export type InfluencerSeo = {
  slug: string;
  name: string;
  niche: string;
  description: string;
  locationFocus: string;
  profileUrl?: string;
};

export const influencerPages: InfluencerSeo[] = [
  {
    slug: "lena-escapes",
    name: "Lena Escapes",
    niche: "City breaks & cafe culture",
    description:
      "Short, stylish travel guides for travelers who love local cafes, walkable neighborhoods, and boutique stays.",
    locationFocus: "Europe",
    profileUrl: "https://instagram.com",
  },
  {
    slug: "atlas-once",
    name: "Atlas Once",
    niche: "Outdoor adventures",
    description:
      "Trail-to-table trips built around hikes, scenic drives, and local food stops.",
    locationFocus: "North America",
    profileUrl: "https://instagram.com",
  },
  {
    slug: "mina-goes",
    name: "Mina Goes",
    niche: "Family travel",
    description:
      "Family-friendly travel guides with easy pacing, playgrounds, and flexible dining spots.",
    locationFocus: "Global",
    profileUrl: "https://instagram.com",
  },
];

export function getInfluencerBySlug(slug: string): InfluencerSeo | undefined {
  return influencerPages.find((influencer) => influencer.slug === slug);
}
