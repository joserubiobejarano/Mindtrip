import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TripDetail } from "@/components/trip-detail";

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
  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .single();

  if (error || !trip) {
    redirect("/trips");
  }

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
      await supabase
        .from("trip_members")
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

  return <TripDetail tripId={tripId} />;
}

