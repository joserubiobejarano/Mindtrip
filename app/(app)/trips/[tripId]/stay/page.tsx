import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HotelSearchWrapper } from "@/components/hotel-search-wrapper";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  return buildMetadata({
    title: "Trip Stay – Kruno",
    description: "Plan where to stay for your trip in Kruno.",
    path: `/trips/${tripId}/stay`,
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default async function StayPage({
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

  if (trip.owner_id !== userId && !isMember) {
    redirect("/trips");
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-hidden">
        <HotelSearchWrapper tripId={tripId} />
      </div>
    </div>
  );
}
