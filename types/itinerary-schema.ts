import { z } from 'zod';

export const itineraryPlaceSchema = z.object({
  id: z.string().describe("UUID"),
  name: z.string(),
  description: z.string().describe("Short description of the place"),
  area: z.string().describe("Neighborhood or area name, e.g. 'Gothic Quarter'"),
  neighborhood: z.string().nullable().describe("Specific neighborhood if applicable"),
  photos: z.array(z.string()).describe("Array of photo URLs (legacy, use image_url instead)"),
  visited: z.boolean().describe("Whether the place has been visited (should be false for new itineraries)"),
  tags: z.array(z.string()).describe("Tags like 'food', 'viewpoint', 'history'"),
  place_id: z.string().optional().describe("Google Places place_id for accurate photo fetching (include when available)"),
  image_url: z.string().nullable().optional().describe("Stable Supabase Storage URL (prioritized over photos array)"),
});

export const slotSummarySchema = z.object({
  block_title: z.string().describe("Specific anchor like 'Buda Castle + Fisherman's Bastion'"),
  what_to_do: z.array(z.string()).min(2).max(4).describe("2-4 bullets, each mentioning specific POIs"),
  local_insights: z.string().min(800).max(1600).describe("200-320 words, 1-2 paragraphs of practical city-specific insights unique to this slot/time-of-day"),
  move_between: z.string().describe("1 short sentence with specific transport or walk distance"),
  getting_around: z.string().optional().describe("Optional: 1-2 sentences with realistic transit mode for that area"),
  cost_note: z.string().nullable().describe("Optional cost information; only if truly relevant (ticketed attraction, transit pass, specific expense); NO generic ranges"),
  heads_up: z.string().describe("1 unique caution for this block, must not repeat across days"),
});

export const itinerarySlotSchema = z.object({
  label: z.enum(['morning', 'afternoon', 'evening']),
  summary: z.union([slotSummarySchema, z.string()]).describe("Structured summary object (new format) or string (legacy format)"),
  places: z.array(itineraryPlaceSchema).describe("2-4 places that are geographically close"),
});

export const itineraryDaySchema = z.object({
  id: z.string().describe("UUID"),
  index: z.number(),
  date: z.string().describe("ISO date string"),
  title: z.string(),
  theme: z.string(),
  areaCluster: z.string().describe("Main area/neighborhood for that day"),
  photos: z.array(z.string()).describe("Photos representing the day"),
  overview: z.string().describe("Daily overview including practical micro-tips"),
  slots: z.array(itinerarySlotSchema).describe("Morning, afternoon, evening slots"),
});

export const cityOverviewSchema = z.object({
  gettingThere: z.object({
    airports: z.array(z.string()).optional(),
    distanceToCity: z.string().optional(),
    transferOptions: z.array(z.string()).optional(),
  }).optional(),
  gettingAround: z.object({
    publicTransport: z.string().optional(),
    walkability: z.string().optional(),
    taxiRideshare: z.string().optional(),
  }).optional(),
  budgetGuide: z.object({
    budgetDaily: z.string().optional(),
    midRangeDaily: z.string().optional(),
    luxuryDaily: z.string().optional(),
    transportPass: z.string().optional(),
  }).optional(),
  bestTimeToVisit: z.object({
    bestMonths: z.string().optional(),
    shoulderSeason: z.string().optional(),
    peakLowSeason: z.string().optional(),
  }).optional(),
  whereToStay: z.array(z.object({
    neighborhood: z.string(),
    description: z.string(),
  })).optional(),
  advancePlanning: z.object({
    bookEarly: z.array(z.string()).optional(),
    spontaneous: z.array(z.string()).optional(),
  }).optional(),
});

export const smartItinerarySchema = z.object({
  title: z.string(),
  summary: z.string(),
  days: z.array(itineraryDaySchema),
  tripTips: z.array(z.string()).optional().default([]).describe("Trip-wide tips (season, holidays, packing)"),
  cityOverview: cityOverviewSchema.optional().describe("Structured city overview with practical information"),
});

