import type { CityItinerary } from "@/lib/itinerary/city-itineraries";

export type GuideMissingItem =
  | "Hero image"
  | "City stats"
  | "Image cards"
  | "FAQ"
  | "Related itineraries";

const isValidImageUrl = (url: string) => {
  if (url.startsWith("/")) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const validateGuide = (itinerary: CityItinerary): GuideMissingItem[] => {
  const missing: GuideMissingItem[] = [];

  if (!itinerary.hero?.image?.src) {
    missing.push("Hero image");
  }

  if (!itinerary.cityStats?.length) {
    missing.push("City stats");
  }

  if (!itinerary.imageInfoCards?.length) {
    missing.push("Image cards");
  }

  if (!itinerary.faqs?.length) {
    missing.push("FAQ");
  }

  if (!itinerary.relatedItineraries?.length) {
    missing.push("Related itineraries");
  }

  return missing;
};

export const collectInvalidImageUrls = (
  itinerary: CityItinerary,
  relatedItems?: Array<{ slug: string; image?: { src?: string } }>
): string[] => {
  const issues: string[] = [];
  const record = (label: string, url?: string) => {
    if (!url) {
      return;
    }

    if (!isValidImageUrl(url)) {
      issues.push(`${label}: ${url}`);
    }
  };

  record("Hero image", itinerary.hero?.image?.src);
  itinerary.imageInfoCards?.forEach((card, index) => {
    record(`Image card ${index + 1}`, card.image?.src);
  });
  relatedItems?.forEach((item) => {
    record(`Related ${item.slug || "unknown"} image`, item.image?.src);
  });

  return issues;
};
