import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicTripView } from "@/components/public-trip-view";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildMetadata({
    title: "Shared Trip – Kruno",
    description: "View a shared Kruno trip itinerary.",
    path: `/p/${slug}`,
    robots: {
      index: false,
      follow: false,
    },
  });
}

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
    notFound();
  }

  type TripShareQueryResult = {
    trip_id: string
  }

  const tripShareTyped = tripShare as TripShareQueryResult;

  return <PublicTripView tripId={tripShareTyped.trip_id} slug={slug} />;
}

