import { z } from 'zod';

export const itineraryPlaceSchema = z.object({
  id: z.string().describe("UUID"),
  name: z.string(),
  description: z.string().describe("Short description of the place"),
  area: z.string().describe("Neighborhood or area name, e.g. 'Gothic Quarter'"),
  neighborhood: z.string().nullable().describe("Specific neighborhood if applicable"),
  photos: z.array(z.string()).describe("Array of photo URLs"),
  visited: z.boolean().describe("Whether the place has been visited (should be false for new itineraries)"),
  tags: z.array(z.string()).describe("Tags like 'food', 'viewpoint', 'history'"),
});

export const itinerarySlotSchema = z.object({
  label: z.enum(['morning', 'afternoon', 'evening']),
  summary: z.string().describe("Brief summary of what happens in this slot"),
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

export const smartItinerarySchema = z.object({
  title: z.string(),
  summary: z.string(),
  days: z.array(itineraryDaySchema),
  tripTips: z.array(z.string()).optional().default([]).describe("Trip-wide tips (season, holidays, packing)"),
});

