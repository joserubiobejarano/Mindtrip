import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TripDetail } from "@/components/trip-detail";
import { Suspense } from "react";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = await createClient();

  // Check if user has access to this trip
  const { data: tripData, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .single();

  if (error || !tripData) {
    redirect("/trips");
  }

  type TripQueryResult = {
    owner_id: string
    [key: string]: any
  }

  const trip = tripData as TripQueryResult;

  const { data: isMember } = await supabase
    .from("trip_members")
    .select("id")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .single();

  // Backfill: If user is owner and no members exist, create owner member
  if (trip.owner_id === userId && !isMember) {
    const { data: existingMembers } = await supabase
      .from("trip_members")
      .select("id")
      .eq("trip_id", tripId)
      .limit(1);

    if (!existingMembers || existingMembers.length === 0) {
      // Create owner member entry
      await (supabase
        .from("trip_members") as any)
        .insert({
          trip_id: tripId,
          user_id: userId,
          email: null,
          display_name: null,
          role: "owner",
        });
    }
  }

  if (trip.owner_id !== userId && !isMember) {
    redirect("/trips");
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

