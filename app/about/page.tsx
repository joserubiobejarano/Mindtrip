import type { Metadata } from "next";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
  title: "About Kruno – AI Travel Planner",
  description: "Learn about Kruno, the AI-powered travel planning platform that helps you create smart, personalized itineraries and discover amazing places.",
  openGraph: {
    title: "About Kruno – AI Travel Planner",
    description: "Learn about Kruno, the AI-powered travel planning platform that helps you create smart, personalized itineraries.",
    url: "https://kruno.app/about",
    siteName: "Kruno",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Kruno – AI Travel Planner",
    description: "Learn about Kruno, the AI-powered travel planning platform.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
