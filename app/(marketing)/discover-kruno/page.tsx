import type { Metadata } from "next";
import { DiscoverKrunoPage } from "@/components/landing/discover-kruno-page";

export const metadata: Metadata = {
  title: "Kruno - Discover",
  description: "Create a clear trip plan in minutes.",
};

export default function DiscoverKrunoRoute() {
  return <DiscoverKrunoPage />;
}
