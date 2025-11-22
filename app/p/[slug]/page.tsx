import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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

  return <PublicTripView tripId={tripShare.trip_id} slug={slug} />;
}

