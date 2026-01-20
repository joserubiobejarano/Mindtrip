export type CitySeo = {
  slug: string;
  name: string;
  country: string;
  days: number;
  description: string;
  highlights: string[];
};

export const cityPages: CitySeo[] = [
  {
    slug: "paris",
    name: "Paris",
    country: "France",
    days: 3,
    description:
      "A 3-day Paris travel guide focused on classic landmarks, cafe culture, and walkable neighborhoods.",
    highlights: ["Eiffel Tower", "Louvre Museum", "Montmartre"],
  },
  {
    slug: "barcelona",
    name: "Barcelona",
    country: "Spain",
    days: 4,
    description:
      "A 4-day Barcelona travel guide packed with Gaudi architecture, beaches, and food markets.",
    highlights: ["Sagrada Familia", "Gothic Quarter", "La Boqueria"],
  },
  {
    slug: "london",
    name: "London",
    country: "United Kingdom",
    days: 3,
    description:
      "A 3-day London travel guide with iconic sights, museums, and neighborhoods across the Thames.",
    highlights: ["Westminster", "British Museum", "Tower Bridge"],
  },
  {
    slug: "rome",
    name: "Rome",
    country: "Italy",
    days: 3,
    description:
      "A 3-day Rome travel guide highlighting ancient history, piazzas, and Italian cuisine.",
    highlights: ["Colosseum", "Vatican Museums", "Trevi Fountain"],
  },
];

export function getCityBySlug(slug: string): CitySeo | undefined {
  return cityPages.find((city) => city.slug === slug);
}
