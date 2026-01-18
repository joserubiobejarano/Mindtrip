export const siteConfig = {
  name: "Kruno",
  title: "Kruno - AI Travel Planner",
  description:
    "Plan smart, personalized trips with Kruno's AI travel planner. Build itineraries, discover places, and travel with confidence.",
} as const;

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://kruno.app"
  );
}
