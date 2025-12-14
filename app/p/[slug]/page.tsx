import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PublicTripView } from "@/components/public-trip-view";

export default async function PublicTripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get trip from public slug
  const { data: tripShare } = await supabase
    .from("trip_shares")
    .select("trip_id")
    .eq("public_slug", slug)
    .single();

  if (!tripShare) {
    redirect("/");
  }

  type TripShareQueryResult = {
    trip_id: string
  }

  const tripShareTyped = tripShare as TripShareQueryResult | null;

  if (!tripShareTyped) {
    notFound();
  }

  return <PublicTripView tripId={tripShareTyped.trip_id} slug={slug} />;
}

