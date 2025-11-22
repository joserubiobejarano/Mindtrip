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

  if (trip.owner_id !== userId && !isMember) {
    redirect("/trips");
  }

  return <TripDetail tripId={tripId} />;
}

