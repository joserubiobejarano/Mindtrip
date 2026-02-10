"use client";

import { useState } from "react";
import { MarketingNavbar } from "@/components/marketing-navbar";
import { NewHeroSection } from "@/components/new-hero-section";
import { NewWhyChooseSection } from "@/components/new-why-choose-section";
import { NewExperiencesSection } from "@/components/new-experiences-section";
import { NewCTASection } from "@/components/new-cta-section";
import { NewNewsletterSection } from "@/components/new-newsletter-section";
import { NewFooter } from "@/components/new-footer";
import { type DestinationOption } from "@/hooks/use-create-trip";

export function HomePageClient({
  showChrome = true,
  isSignedIn = false,
}: {
  showChrome?: boolean;
  isSignedIn?: boolean;
}) {
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

  const content = (
    <>
      <NewHeroSection
        destination={destination}
        setDestination={setDestination}
        isSignedIn={isSignedIn}
      />
      <NewWhyChooseSection />
      <NewExperiencesSection onCityClick={handleCityClick} isSignedIn={isSignedIn} />
      <NewCTASection />
      <NewNewsletterSection />
    </>
  );

  if (!showChrome) {
    return content;
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketingNavbar isSignedIn={isSignedIn} />
      <main>{content}</main>
      <NewFooter />
    </div>
  );
}
