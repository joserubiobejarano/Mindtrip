import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireTripAccess, tripAccessErrorResponse } from "@/lib/auth/require-trip-access";
import { validateParams } from "@/lib/validation/validate-request";
import { TripIdParamsSchema } from "@/lib/validation/api-schemas";
import { sendExpensesSummaryEmail } from "@/lib/email/resend";

interface SendSummaryBody {
  language?: "en" | "es";
}

// Send expense balance summary emails to all tripmates
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    // Validate params
    const { tripId } = await validateParams(params, TripIdParamsSchema);

    // Parse request body for language
    const body: SendSummaryBody = await request.json().catch(() => ({}));
    const language = body.language || "en";

    const supabase = await createClient();

    // Verify user has access to trip
    const accessResult = await requireTripAccess(tripId, supabase);
    const trip = accessResult.trip;
    const profileId = accessResult.profileId;

    // Check if user is owner or has role "owner" or "editor"
    const isOwner = trip.owner_id === profileId;
    let hasPermission = isOwner;

    if (!hasPermission) {
      // Check if user is a member with owner or editor role
      const { data: member } = await supabase
        .from("trip_members")
        .select("role")
        .eq("trip_id", tripId)
        .eq("user_id", profileId)
        .maybeSingle();

      type MemberRole = { role: string };
      if (member && ((member as MemberRole).role === "owner" || (member as MemberRole).role === "editor")) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Forbidden: Only trip owners and editors can send balance summaries" },
        { status: 403 }
      );
    }

    // Load trip members with email and display_name
    type Member = { id: string; email: string | null; display_name: string | null };
    const { data: members, error: membersError } = await supabase
      .from("trip_members")
      .select("id, email, display_name")
      .eq("trip_id", tripId);

    if (membersError) {
      console.error("[Send Summary API] Error loading members:", membersError);
      throw new Error("Failed to load trip members");
    }

    if (!members || members.length === 0) {
      return NextResponse.json(
        { error: "No trip members found" },
        { status: 400 }
      );
    }

    // Load expenses for the trip
    type Expense = { id: string; amount: number; currency: string; paid_by_member_id: string };
    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select("id, amount, currency, paid_by_member_id")
      .eq("trip_id", tripId);

    if (expensesError) {
      console.error("[Send Summary API] Error loading expenses:", expensesError);
      throw new Error("Failed to load expenses");
    }

    // Load expense shares
    type ExpenseShare = { expense_id: string; member_id: string; amount: number };
    const { data: shares, error: sharesError } = await supabase
      .from("expense_shares")
      .select("expense_id, member_id, amount")
      .in(
        "expense_id",
        ((expenses || []) as Expense[]).map((e) => e.id)
      );

    if (sharesError) {
      console.error("[Send Summary API] Error loading expense shares:", sharesError);
      throw new Error("Failed to load expense shares");
    }

    // Calculate balances (same logic as frontend)
    const defaultCurrency = trip.default_currency || "USD";
    const balanceMap: Record<string, number> = {};

    // Initialize balances for all members
    (members as Member[]).forEach((member) => {
      balanceMap[member.id] = 0;
    });

    // Only calculate for expenses in default currency
    ((expenses || []) as Expense[])
      .filter((expense) => expense.currency === defaultCurrency)
      .forEach((expense) => {
        // Add amount paid by member (they are owed this)
        balanceMap[expense.paid_by_member_id] =
          (balanceMap[expense.paid_by_member_id] || 0) + expense.amount;

        // Subtract shares (each member owes their share)
        ((shares || []) as ExpenseShare[])
          .filter((share) => share.expense_id === expense.id)
          .forEach((share) => {
            balanceMap[share.member_id] =
              (balanceMap[share.member_id] || 0) - share.amount;
          });
      });

    // Calculate total spent
    const totalSpent = ((expenses || []) as Expense[])
      .filter((expense) => expense.currency === defaultCurrency)
      .reduce((sum, expense) => sum + expense.amount, 0);

    // Format balance summary text
    const getMemberName = (member: { display_name: string | null; email: string | null }) => {
      return member.display_name || member.email || "Unknown";
    };

    // Sort members alphabetically by name
    const sortedMembers = [...(members as Member[])].sort((a, b) => {
      const aName = getMemberName(a);
      const bName = getMemberName(b);
      return aName.localeCompare(bName);
    });

    // Language-aware labels
    const labels = {
      trip: language === "es" ? "Viaje" : "Trip",
      totalSpent: language === "es" ? "Total gastado" : "Total spent",
      isOwed: language === "es" ? "(le deben)" : "(is owed)",
      owes: language === "es" ? "(debe)" : "(owes)",
      settled: language === "es" ? "(saldo)" : "(settled)",
    };

    // Build balance summary text with language-aware labels
    const totalText = `${labels.totalSpent}: ${defaultCurrency} ${totalSpent.toFixed(2)}`;
    let summaryText = `${labels.trip}: ${trip.title}\n`;
    summaryText += `${totalText}\n\n`;

    sortedMembers.forEach((member) => {
      const balance = balanceMap[member.id] || 0;
      // Round values close to zero
      const roundedBalance = Math.abs(balance) < 0.01 ? 0 : balance;
      const memberName = getMemberName(member);

      if (roundedBalance > 0) {
        summaryText += `${memberName}: +${defaultCurrency} ${Math.abs(roundedBalance).toFixed(2)} ${labels.isOwed}\n`;
      } else if (roundedBalance < 0) {
        summaryText += `${memberName}: -${defaultCurrency} ${Math.abs(roundedBalance).toFixed(2)} ${labels.owes}\n`;
      } else {
        summaryText += `${memberName}: ${defaultCurrency} 0.00 ${labels.settled}\n`;
      }
    });

    // Send emails to all tripmates with email addresses
    let sentCount = 0;
    const emailPromises = (members as Member[])
      .filter((member) => member.email) // Only members with email
      .map((member) => {
        return sendExpensesSummaryEmail({
          to: member.email!,
          tripName: trip.title,
          totalText,
          summaryText,
          language: language as "en" | "es",
        })
          .then(() => {
            sentCount++;
          })
          .catch((error) => {
            console.error(
              `[Send Summary API] Error sending email to ${member.email}:`,
              error
            );
            // Continue sending to other members even if one fails
          });
      });

    await Promise.all(emailPromises);

    return NextResponse.json({
      success: true,
      sentCount,
    });
  } catch (error: unknown) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("[Send Summary API]", {
      path: "/api/trips/[tripId]/expenses/send-summary",
      method: "POST",
      error: error instanceof Error ? error.message : "Internal server error",
    });
    return tripAccessErrorResponse(error);
  }
}

