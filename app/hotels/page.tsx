import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import HotelsPageClient from "@/components/hotels-page-client";

export const metadata: Metadata = buildMetadata({
  title: "Hotels – Kruno",
  description: "Find hotels and stays for your next trip with Kruno.",
  path: "/hotels",
  robots: {
    index: false,
    follow: false,
  },
});

export default function HotelsPage() {
  return <HotelsPageClient />;
}

