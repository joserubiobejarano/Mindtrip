import type { Metadata } from "next";
import { HomePageClient } from "@/components/home-page-client";

export const metadata: Metadata = {
  title: "Kruno – AI travel planner for smart, swipeable itineraries",
  description:
    "Plan your next trip in minutes. Kruno creates smart, personalized itineraries, lets you swipe through places Tinder-style, and collaborate on every detail with friends.",
  openGraph: {
    title: "Kruno – AI travel planner for smart, swipeable itineraries",
    description:
      "Plan your next trip in minutes. Kruno creates smart, personalized itineraries, lets you swipe through places Tinder-style, and collaborate on every detail with friends.",
    url: "https://kruno.app",
    siteName: "Kruno",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kruno – AI travel planner for smart, swipeable itineraries",
    description:
      "Plan your next trip in minutes with AI-generated itineraries and swipe-based discovery.",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
