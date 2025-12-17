import type { Metadata } from "next";
import { HomePageClient } from "@/components/home-page-client";

export const metadata: Metadata = {
  title: "Kruno - Smart travel planner",
  description: "Smart travel planner",
  openGraph: {
    title: "Kruno - Smart travel planner",
    description: "Smart travel planner",
    url: "https://kruno.app",
    siteName: "Kruno",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kruno - Smart travel planner",
    description: "Smart travel planner",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
