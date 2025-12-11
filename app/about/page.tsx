import type { Metadata } from "next";
import { NewNavbar } from "@/components/new-navbar";
import { NewFooter } from "@/components/new-footer";

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
  return (
    <div className="min-h-screen bg-background">
      <NewNavbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 
          className="text-4xl font-bold mb-6"
          style={{ fontFamily: "'Patrick Hand', cursive" }}
        >
          About Kruno
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-muted-foreground mb-6">
            Kruno is an AI-powered travel planning platform designed to make trip planning effortless, 
            collaborative, and enjoyable. We believe that planning your next adventure should be as exciting 
            as the trip itself.
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-muted-foreground">
              We're on a mission to transform how people plan their travels. By combining artificial intelligence 
              with intuitive design, Kruno helps you discover amazing places, create personalized itineraries, 
              and collaborate seamlessly with friends and family.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What Makes Kruno Different</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>AI-generated smart itineraries tailored to your preferences</li>
              <li>Tinder-style swipe interface for discovering places</li>
              <li>Real-time collaboration with trip members</li>
              <li>Multi-city trip planning support</li>
              <li>Integrated expense tracking and checklists</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Why We Built Kruno</h2>
            <p className="text-muted-foreground">
              Planning a trip can be overwhelming. With countless options, conflicting recommendations, and 
              the challenge of coordinating with others, we saw an opportunity to create a tool that simplifies 
              the entire process. Kruno exists to help travelers spend less time planning and more time 
              experiencing the world.
            </p>
          </section>
        </div>
      </main>
      <NewFooter />
    </div>
  );
}
