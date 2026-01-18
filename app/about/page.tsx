import { AboutContent } from "./about-content";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "About Kruno – AI Travel Planner",
  description:
    "Learn about Kruno, the AI-powered travel planning platform that helps you create smart, personalized itineraries and discover amazing places.",
  path: "/about",
  robots: {
    index: true,
    follow: true,
  },
});

export default function AboutPage() {
  return <AboutContent />;
}
