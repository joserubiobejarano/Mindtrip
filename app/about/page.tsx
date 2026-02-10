import { AboutContent } from "./about-content";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "About Kruno – Smart travel planner",
  description:
    "Learn about Kruno, the smart travel planning platform that helps you create personalized itineraries and discover amazing places.",
  path: "/about",
  robots: {
    index: false,
    follow: false,
  },
});

export default async function AboutPage() {
  return <AboutContent isSignedIn={false} />;
}
