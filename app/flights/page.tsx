import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import FlightsPageClient from "@/components/flights-page-client";

export const metadata: Metadata = buildMetadata({
  title: "Flights – Kruno",
  description: "Find flights for your next trip with Kruno.",
  path: "/flights",
  robots: {
    index: false,
    follow: false,
  },
});

export default function FlightsPage() {
  return <FlightsPageClient />;
}

