"use client";

import { useState } from "react";
import { NewNavbar } from "@/components/new-navbar";
import { NewHeroSection } from "@/components/new-hero-section";
import { NewWhyChooseSection } from "@/components/new-why-choose-section";
import { NewExperiencesSection } from "@/components/new-experiences-section";
import { WhyChooseSection } from "@/components/why-choose-section";
import { NewCTASection } from "@/components/new-cta-section";
import { NewNewsletterSection } from "@/components/new-newsletter-section";
import { NewFooter } from "@/components/new-footer";
import { type DestinationOption } from "@/hooks/use-create-trip";

export function HomePageClient() {
  const [destination, setDestination] = useState<DestinationOption | null>(null);

  const handleCityClick = async (cityName: string) => {
    // Set destination from city name (no geocoding for MVP)
    const foundDestination: DestinationOption = {
      id: `city-${cityName.toLowerCase().replace(/\s+/g, '-')}`,
      placeName: cityName,
      region: "",
      type: "City",
      center: [0, 0],
    };

    setDestination(foundDestination);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <NewNavbar />
      <main>
        <NewHeroSection destination={destination} setDestination={setDestination} />
        <NewWhyChooseSection />
        <NewExperiencesSection onCityClick={handleCityClick} />
        <WhyChooseSection />
        <NewCTASection />
        <NewNewsletterSection />
      </main>
      <NewFooter />
    </div>
  );
}
