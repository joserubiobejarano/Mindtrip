import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TripDetail } from "@/components/trip-detail";
import { Suspense } from "react";
import { getProfileId } from "@/lib/auth/getProfileId";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  
  // Check authentication first
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    redirect("/sign-in");
  }

  const supabase = await createClient();

  // Get profileId (UUID) instead of using Clerk userId
  let profileId: string;
  try {
    const authResult = await getProfileId(supabase);
    profileId = authResult.profileId;
    console.log('[trip-page] tripId=', tripId, 'profileId=', profileId);
  } catch (authError: any) {
    console.error('[trip-page] tripId=', tripId, 'authError=', authError?.message);
    redirect("/sign-in");
  }

  // Check if trip exists
  const { data: tripData, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .single();

  if (error || !tripData) {
    console.log('[trip-page] tripId=', tripId, 'profileId=', profileId, 'found=false', 'error=', error?.message);
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold">Trip not found</h1>
          <p className="text-muted-foreground">The trip you&apos;re looking for doesn&apos;t exist or may have been deleted.</p>
          <Link href="/trips">
            <Button>Back to My Trips</Button>
          </Link>
        </div>
      </div>
    );
  }

  type TripQueryResult = {
    owner_id: string
    [key: string]: any
  }

  const trip = tripData as TripQueryResult;

  // Check if user is a member using profileId (UUID)
  const { data: isMember } = await supabase
    .from("trip_members")
    .select("id")
    .eq("trip_id", tripId)
    .eq("user_id", profileId)
    .single();

  const isOwner = trip.owner_id === profileId;
  const hasAccess = isOwner || isMember;

  console.log('[trip-page] tripId=', tripId, 'profileId=', profileId, 'found=true', 'access=', isOwner ? 'owner' : isMember ? 'member' : 'none');

  // Backfill: If user is owner and no members exist, create owner member
  if (isOwner && !isMember) {
    const { data: existingMembers } = await supabase
      .from("trip_members")
      .select("id")
      .eq("trip_id", tripId)
      .limit(1);

    if (!existingMembers || existingMembers.length === 0) {
      // Create owner member entry using profileId
      await (supabase
        .from("trip_members") as any)
        .insert({
          trip_id: tripId,
          user_id: profileId,
          email: null,
          display_name: null,
          role: "owner",
        });
    }
  }

  // Check access - show friendly error instead of redirect
  if (!hasAccess) {
    console.log('[trip-page] tripId=', tripId, 'profileId=', profileId, 'found=true', 'access=denied');
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have access to this trip.</p>
          <Link href="/trips">
            <Button>Back to My Trips</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background p-8">
        <div className="text-muted-foreground">Loading trip...</div>
      </div>
    }>
      <TripDetail tripId={tripId} />
    </Suspense>
  );
}

