import "server-only";

import { cache } from "react";
import type { DayPlan } from "@/lib/itinerary/city-itineraries";
import { cachePlaceImage } from "@/lib/images/cache-place-image";

type DayImageCard = {
  title: string;
  image: {
    src: string;
    alt: string;
  };
};

type DayImageParams = {
  slug: string;
  city: string;
  country?: string;
  dayPlans: DayPlan[];
  fallbackImage?: {
    src: string;
    alt: string;
  };
};

const getDayImageUrl = cache(
  async (cacheKey: string, title: string, city: string, country?: string) => {
    return cachePlaceImage({
      tripId: cacheKey,
      title,
      city,
      country,
    });
  }
);

export async function getDayImageCards({
  slug,
  city,
  country,
  dayPlans,
  fallbackImage,
}: DayImageParams): Promise<DayImageCard[] | null> {
  if (!dayPlans.length) {
    return null;
  }

  const cards = await Promise.all(
    dayPlans.map(async (plan, index) => {
      const cacheKey = `${slug}-day-${index + 1}`;
      const src =
        (await getDayImageUrl(cacheKey, plan.title, city, country)) ??
        fallbackImage?.src;

      if (!src) {
        return null;
      }

      return {
        title: plan.title,
        image: {
          src,
          alt: `${city} - ${plan.title}`,
        },
      };
    })
  );

  if (cards.some((card) => !card)) {
    return null;
  }

  return cards as DayImageCard[];
}
