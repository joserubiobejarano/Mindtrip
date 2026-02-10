export const siteConfig = {
  name: "Kruno",
  title: "Kruno - Smart travel planner",
  description:
    "Plan smart, personalized trips with Kruno's smart travel planner. Build itineraries, discover places, and travel with confidence.",
} as const;

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://www.kruno.app"
  );
}
