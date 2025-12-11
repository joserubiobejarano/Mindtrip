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
    // Search for the destination
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error("Mapbox token not configured");
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          cityName
        )}.json?access_token=${mapboxToken}&types=place,country,region&limit=1`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const features = data.features || [];

      if (features.length === 0) {
        return;
      }

      const feature = features[0];
      const placeName = feature.place_name.split(",")[0].trim();

      const regionParts: string[] = [];
      if (feature.context) {
        const country = feature.context.find((ctx: any) => ctx.id.startsWith("country"));
        const region = feature.context.find((ctx: any) => ctx.id.startsWith("region"));

        if (region) regionParts.push(region.text);
        if (country) regionParts.push(country.text);
      }
      const region = regionParts.join(", ") || feature.place_name.split(",").slice(1).join(",").trim();

      let type: "City" | "Country" | "Region" = "City";
      if (feature.place_type?.includes("country")) {
        type = "Country";
      } else if (feature.place_type?.includes("region")) {
        type = "Region";
      } else if (feature.place_type?.includes("place")) {
        type = "City";
      }

      const foundDestination: DestinationOption = {
        id: feature.id,
        placeName,
        region,
        type,
        center: feature.center,
      };

      setDestination(foundDestination);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error searching destination:", error);
    }
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
