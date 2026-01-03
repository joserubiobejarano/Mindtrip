import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireTripAccess, tripAccessErrorResponse } from "@/lib/auth/require-trip-access";
import { validateParams } from "@/lib/validation/validate-request";
import { TripIdParamsSchema } from "@/lib/validation/api-schemas";
import { currentUser } from "@clerk/nextjs/server";
import { sendExpoPush } from "@/lib/push/expo";

// GET /api/trips/[tripId]/expenses - Returns expenses list with shares and member info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    // Validate params
    const { tripId } = await validateParams(params, TripIdParamsSchema);

    const supabase = await createClient();

    // Verify user has access to trip
    await requireTripAccess(tripId, supabase);

    // Fetch expenses with related data (same structure as web Supabase query)
    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select(`
        *,
        paid_by_member:trip_members!expenses_paid_by_member_id_fkey(
          id,
          email,
          display_name
        ),
        shares:expense_shares(
          id,
          member_id,
          amount,
          member:trip_members!expense_shares_member_id_fkey(
            id,
            email,
            display_name
          )
        )
      `)
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false });

    if (expensesError) {
      console.error("[Expenses API] Error fetching expenses:", expensesError);
      return NextResponse.json(
        { error: "Failed to load expenses" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      expenses: expenses || [],
    });
  } catch (error: unknown) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("[Expenses API]", {
      path: "/api/trips/[tripId]/expenses",
      method: "GET",
      error: error instanceof Error ? error.message : "Internal server error",
    });
    return tripAccessErrorResponse(error);
  }
}

// POST /api/trips/[tripId]/expenses - Creates a new expense with shares
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    // Validate params
    const { tripId } = await validateParams(params, TripIdParamsSchema);

    const supabase = await createClient();

    // Verify user has access to trip
    const accessResult = await requireTripAccess(tripId, supabase);

    // Parse request body
    const body = await request.json();
    const {
      description,
      amount,
      currency,
      category,
      paid_by_member_id,
      shared_by_member_ids,
      language,
    } = body;

    // Validate required fields
    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    if (!currency || typeof currency !== "string") {
      return NextResponse.json(
        { error: "Currency is required" },
        { status: 400 }
      );
    }

    if (!paid_by_member_id || typeof paid_by_member_id !== "string") {
      return NextResponse.json(
        { error: "paid_by_member_id is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(shared_by_member_ids) || shared_by_member_ids.length === 0) {
      return NextResponse.json(
        { error: "At least one member must share the expense" },
        { status: 400 }
      );
    }

    // Verify paid_by_member_id is a valid member of this trip
    const { data: paidMember, error: paidMemberError } = await supabase
      .from("trip_members")
      .select("id")
      .eq("id", paid_by_member_id)
      .eq("trip_id", tripId)
      .single();

    if (paidMemberError || !paidMember) {
      return NextResponse.json(
        { error: "Invalid paid_by_member_id" },
        { status: 400 }
      );
    }

    // Verify all shared_by_member_ids are valid members of this trip
    const { data: sharedMembers, error: sharedMembersError } = await supabase
      .from("trip_members")
      .select("id")
      .eq("trip_id", tripId)
      .in("id", shared_by_member_ids);

    if (sharedMembersError || !sharedMembers || sharedMembers.length !== shared_by_member_ids.length) {
      return NextResponse.json(
        { error: "Invalid shared_by_member_ids" },
        { status: 400 }
      );
    }

    // Create expense
    const { data: expense, error: expenseError } = await (supabase
      .from("expenses") as any)
      .insert({
        trip_id: tripId,
        description: description.trim(),
        amount,
        currency: currency.toUpperCase(),
        category: category || null,
        paid_by_member_id,
      })
      .select()
      .single();

    if (expenseError) {
      console.error("[Expenses API] Error creating expense:", expenseError);
      return NextResponse.json(
        { error: expenseError.message || "Failed to create expense" },
        { status: 500 }
      );
    }

    if (!expense) {
      return NextResponse.json(
        { error: "Failed to create expense" },
        { status: 500 }
      );
    }

    // Create shares (equal split)
    const shareAmount = amount / shared_by_member_ids.length;
    const shares = shared_by_member_ids.map((memberId: string) => ({
      expense_id: expense.id,
      member_id: memberId,
      amount: shareAmount,
    }));

    const { error: sharesError } = await (supabase
      .from("expense_shares") as any)
      .insert(shares);

    if (sharesError) {
      console.error("[Expenses API] Error creating expense shares:", sharesError);
      // Try to clean up the expense
      await supabase.from("expenses").delete().eq("id", expense.id);
      return NextResponse.json(
        { error: sharesError.message || "Failed to create expense shares" },
        { status: 500 }
      );
    }

    // Fetch the created expense with related data
    const { data: expenseWithRelations, error: fetchError } = await supabase
      .from("expenses")
      .select(`
        *,
        paid_by_member:trip_members!expenses_paid_by_member_id_fkey(
          id,
          email,
          display_name
        ),
        shares:expense_shares(
          id,
          member_id,
          amount,
          member:trip_members!expense_shares_member_id_fkey(
            id,
            email,
            display_name
          )
        )
      `)
      .eq("id", expense.id)
      .single();

    if (fetchError || !expenseWithRelations) {
      // Expense was created but we couldn't fetch it with relations
      // Return the basic expense data
      return NextResponse.json({
        expense: expense,
      });
    }

    // Send push notifications to other trip members
    try {
      // Get creator's name from Clerk
      const creator = await currentUser();
      const creatorName = creator?.fullName || creator?.firstName || "Someone";

      // Get all trip members (excluding the creator)
      const { data: allMembers, error: membersError } = await supabase
        .from("trip_members")
        .select("user_id")
        .eq("trip_id", tripId)
        .not("user_id", "is", null)
        .neq("user_id", accessResult.clerkUserId);

      if (membersError) {
        console.error("[Expenses API] Error fetching trip members for push notifications:", membersError);
        // Continue - push notification failure shouldn't break expense creation
      } else if (allMembers && allMembers.length > 0) {
        // Collect all profile IDs (UUIDs) from member Clerk IDs
        const profileIds: string[] = [];
        // Type assertion: allMembers contains user_id (not null due to .not filter)
        type MemberWithUserId = { user_id: string };
        const members = allMembers as MemberWithUserId[];
        for (const member of members) {
          if (member.user_id) {
            // Look up profile by clerk_user_id
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("id")
              .eq("clerk_user_id", member.user_id)
              .maybeSingle();

            // Type assertion: profile contains id when not null
            type ProfileWithId = { id: string };
            if (!profileError && profile && (profile as ProfileWithId).id) {
              profileIds.push((profile as ProfileWithId).id);
            }
          }
        }

        // Get all push tokens for all recipient profiles
        if (profileIds.length > 0) {
          const { data: pushTokens, error: tokensError } = await supabase
            .from("user_push_tokens")
            .select("token")
            .in("user_id", profileIds);

          if (tokensError) {
            console.error("[Expenses API] Error fetching push tokens:", tokensError);
            // Continue - push notification failure shouldn't break expense creation
          } else if (pushTokens && pushTokens.length > 0) {
            // Build notification message based on language
            const notificationLanguage = language || 'en';
            const title = notificationLanguage === 'es' 
              ? "Nuevo gasto añadido" 
              : "New expense added";
            
            // Format description with safe fallback
            const expenseLabel = description.trim() || (notificationLanguage === 'es' ? "un gasto" : "an expense");
            const body = notificationLanguage === 'es'
              ? `${creatorName} añadió ${amount} ${currency.toUpperCase()} para ${expenseLabel}`
              : `${creatorName} added ${amount} ${currency.toUpperCase()} for ${expenseLabel}`;

            // Send push notification to all devices
            type PushToken = { token: string };
            const tokens = (pushTokens as PushToken[]).map(pt => pt.token);
            // Deduplicate tokens
            const uniqueTokens = [...new Set(tokens)];
            
            const pushResult = await sendExpoPush(uniqueTokens, {
              title,
              body,
              data: { 
                tripId,
                deepLink: `kruno://link?tripId=${tripId}&screen=expenses`
              },
              sound: 'default',
              priority: 'default',
            });

            // Clean up invalid tokens if any were reported
            if (pushResult.invalidTokens && pushResult.invalidTokens.length > 0) {
              try {
                const { error: deleteError } = await supabase
                  .from('user_push_tokens')
                  .delete()
                  .in('token', pushResult.invalidTokens);

                if (deleteError) {
                  console.error("[Expenses API] Error cleaning up invalid push tokens:", deleteError);
                } else {
                  console.log(`[Expenses API] Cleaned up ${pushResult.invalidTokens.length} invalid push token(s)`);
                }
              } catch (cleanupError: any) {
                // Log but don't fail - cleanup errors shouldn't break expense creation
                console.error("[Expenses API] Error during token cleanup:", cleanupError);
              }
            }

            if (!pushResult.success) {
              console.error("[Expenses API] Error sending push notification:", pushResult.errors);
              // Continue - push notification failure shouldn't break expense creation
            } else {
              console.log(`[Expenses API] Push notification sent to ${uniqueTokens.length} device(s) for expense creation`);
            }
          }
        }
      }
    } catch (pushError: any) {
      // Log push error but don't fail the request
      console.error("[Expenses API] Error sending push notification:", pushError);
      // Continue - expense is still created even if push fails
    }

    return NextResponse.json({
      expense: expenseWithRelations,
    });
  } catch (error: unknown) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("[Expenses API]", {
      path: "/api/trips/[tripId]/expenses",
      method: "POST",
      error: error instanceof Error ? error.message : "Internal server error",
    });
    return tripAccessErrorResponse(error);
  }
}

