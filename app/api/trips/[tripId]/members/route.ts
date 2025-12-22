import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireTripOwner, tripOwnerErrorResponse } from "@/lib/auth/require-trip-owner";
import { requireTripAccess, tripAccessErrorResponse } from "@/lib/auth/require-trip-access";
import { validateParams } from "@/lib/validation/validate-request";
import { TripIdParamsSchema } from "@/lib/validation/api-schemas";
import { currentUser } from "@clerk/nextjs/server";
import { sendTripInvitationEmail } from "@/lib/email/resend";

interface InviteMemberBody {
  email: string;
  role: "editor" | "viewer";
  language?: "en" | "es";
}

// GET /api/trips/[tripId]/members - Returns trip members list
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    // Validate params
    const { tripId } = await validateParams(params, TripIdParamsSchema);

    const supabase = await createClient();

    // Verify user has access to trip (owner or member)
    await requireTripAccess(tripId, supabase);

    // Fetch trip members
    const { data: members, error: membersError } = await supabase
      .from("trip_members")
      .select("id, user_id, email, display_name, role, created_at")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: true });

    if (membersError) {
      console.error("[trip-members] Error fetching members:", membersError);
      return NextResponse.json(
        { error: "Failed to load trip members" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      members: members || [],
    });
  } catch (error: unknown) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("[trip-members] Error in GET /api/trips/[tripId]/members:", error);
    return tripAccessErrorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    // Validate params
    const { tripId } = await validateParams(params, TripIdParamsSchema);
    
    // Verify user is trip owner
    const supabase = await createClient();
    const ownerResult = await requireTripOwner(tripId, supabase);
    const profileId = ownerResult.profileId;
    const clerkUserId = ownerResult.clerkUserId;
    const trip = ownerResult.trip;

    // Parse request body
    const body: InviteMemberBody = await request.json();
    const { email, role, language } = body;

    // Validate input
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    if (!role || (role !== "editor" && role !== "viewer")) {
      return NextResponse.json(
        { error: "Role must be 'editor' or 'viewer'" },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Check if member already exists for this trip and email
    const { data: existingMember, error: existingError } = await supabase
      .from("trip_members")
      .select("id, user_id")
      .eq("trip_id", tripId)
      .eq("email", normalizedEmail)
      .maybeSingle();

    // If member exists (not a "not found" error), return error
    if (existingMember) {
      return NextResponse.json(
        { error: "This member is already invited" },
        { status: 400 }
      );
    }

    // If error is not "not found", it's a real error
    if (existingError && existingError.code !== "PGRST116") {
      console.error("[trip-members] Error checking existing member:", existingError);
      return NextResponse.json(
        { error: "Failed to check existing members" },
        { status: 500 }
      );
    }

    // Look up profile by email (case-insensitive)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("clerk_user_id, full_name")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    // Profile not found is fine - user_id will be NULL
    if (profileError && profileError.code !== "PGRST116") {
      console.error("[trip-members] Error looking up profile:", profileError);
      // Continue anyway - we'll just set user_id to NULL
    }

    // Determine user_id: use clerk_user_id if profile exists, otherwise NULL
    type Profile = { clerk_user_id: string | null; full_name: string | null };
    const userId = (profile as Profile | null)?.clerk_user_id || null;

    // Get inviter name from Clerk
    const inviter = await currentUser();
    const inviterName = inviter?.fullName || inviter?.firstName || "Someone";

    // Upsert trip_members row
    const { data: member, error: memberError } = await (supabase
      .from("trip_members") as any)
      .upsert(
        {
          trip_id: tripId,
          user_id: userId,
          email: normalizedEmail,
          role,
          display_name: (profile as Profile | null)?.full_name || null,
        },
        {
          onConflict: "trip_id,email",
        }
      )
      .select()
      .single();

    if (memberError) {
      console.error("[trip-members] Error upserting member:", memberError);
      return NextResponse.json(
        { error: "Failed to invite member" },
        { status: 500 }
      );
    }

    // Send invitation email
    try {
      await sendTripInvitationEmail({
        to: normalizedEmail,
        tripName: trip.title,
        inviterName,
        tripId,
        language: language || 'en',
      });
    } catch (emailError: any) {
      // Log email error but don't fail the request
      // The member is already added, so we'll just log the error
      console.error("[trip-members] Error sending invitation email:", emailError);
      // Continue - member is still added even if email fails
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("[trip-members] Error in POST /api/trips/[tripId]/members:", error);
    return tripOwnerErrorResponse(error);
  }
}

