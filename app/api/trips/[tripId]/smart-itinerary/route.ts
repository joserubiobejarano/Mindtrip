import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { SmartItinerary } from "@/types/itinerary";
import { findPlacePhoto } from "@/lib/google/places-server";

// Remove edge runtime as requested
// export const runtime = "edge";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// Helper to build the user prompt (reused from existing logic)
function buildUserPromptFromTrip(trip: any, savedPlaces: any[]) {
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const destination = trip.destination_name || trip.title;

  let savedPlacesText = "";
  if (savedPlaces && savedPlaces.length > 0) {
    savedPlacesText = `\nInclude these saved places if possible: ${savedPlaces
      .map((p: any) => p.name)
      .join(", ")}`;
  }

  return `Plan a trip to ${destination} from ${startDate.toDateString()} to ${endDate.toDateString()}.${savedPlacesText}`;
}

const SYSTEM_PROMPT = `
You are an expert travel planner and itinerary generator.
Output STRICT JSON only in the SmartItinerary schema described below.
Do NOT include any extra keys, comments, or text outside JSON.

SCHEMA (high-level):
SmartItinerary {
  title: string;
  summary: string;
  days: ItineraryDay[];
  tips?: ItineraryTip[];
  affiliateSuggestions?: AffiliateSuggestion[];
}

ItineraryDay {
  id: string;              // uuid
  index: number;           // 1-based day index
  date: string;            // ISO date for that day
  title: string;           // e.g. "Day 2 – Art & Architecture"
  theme: string;           // short theme label
  summary: string;         // 2–4 sentences overview of the day
  photos: string[];        // image URLs (empty initially)
  places: ItineraryPlace[];
  affiliateSuggestions?: AffiliateSuggestion[];
}

ItineraryPlace {
  id: string;              // uuid
  name: string;
  summary: string;         // 2–4 sentences about what the traveler does there
  area?: string;           // neighborhood or district (e.g. "Gothic Quarter", "Eixample")
  neighborhood?: string;   // optional, can match area
  lat?: number;
  lng?: number;
  estimatedDurationMinutes?: number;
  visited: boolean;        // always false at generation
  photos: string[];        // image URLs (empty initially)
}

ItineraryTip {
  id: string;              // uuid
  text: string;
  category?: "weather" | "season" | "culture" | "transport" | "money" | "safety" | "other";
}

AffiliateSuggestion {
  id: string;              // uuid
  level: "trip" | "day" | "place";
  kind: "hotel" | "activity" | "tour" | "transport" | "esim" | "insurance" | "other";
  label: string;           // short descriptive label
  cta: string;             // CTA text (e.g. "Book hotel in this area")
  deeplinkSlug: string;    // slug we will later map to real affiliate URLs
  relatedDayId?: string;
  relatedPlaceId?: string;
}

RULES:
1. ACTIVITIES PER DAY
   - For typical city trips, aim for 4–6 places per day when reasonable.
   - Use shorter visits for close-by points of interest (markets, streets, viewpoints).
   - Do NOT schedule only 1–2 activities unless the user explicitly requested a very slow pace.

2. CLUSTER BY AREA / NEIGHBORHOOD
   - Group places within each day so that they are in the SAME area or neighboring areas.
   - Prefer walking-friendly routes with minimal backtracking.
   - Example: In Barcelona, don't put "Mercado de la Boquería" and "Las Ramblas" on different days; they are next to each other.
   - Fill the "area" field with neighborhood names (e.g. "Gothic Quarter", "Gràcia", "Eixample").

3. TIPS & NOTES
   - At the end of the itinerary include 4–8 ItineraryTip items in SmartItinerary.tips.
   - Use the actual season and dates to give relevant advice:
     - weather & clothing
     - holiday closures or reduced hours
     - local festivals or events if likely
     - transport tips for airport/train during those dates
   - Example of style:
     - "Temperatures will be cold in winter — pack warm layers and good walking shoes."
     - "Because your dates include New Year’s Eve, book restaurant reservations in advance."

4. AFFILIATE SUGGESTIONS
   - Add contextual AffiliateSuggestion items.
   - Examples:
     - Trip-level: e.g. "Get an eSIM for Europe", kind "esim".
     - Day-level: e.g. "Book a food tour in La Latina", kind "tour".
     - Place-level: e.g. "Skip-the-line tickets for Sagrada Família", kind "activity".
   - Use placeholder deeplinkSlug values like:
     - "/hotels?city=barcelona&area=eixample"
     - "/activities?city=madrid&place=sagrada-familia"
     - "/esim?region=europe"
   - Keep it reasonable: 1–3 suggestions per day max.

5. OUTPUT FORMAT
   - Your response must look like this, in this order:
     1) 3–8 progress lines, one per line, each starting with "PROGRESS: "
     2) A line that contains exactly: JSON_START
     3) A single well-formed JSON object that matches the SmartItinerary schema.
     4) A line that contains exactly: JSON_END
   - No Markdown. No comments. No text after JSON_END.
`;

// GET: Load existing itinerary as pure JSON (mode=load) or return 404
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const resolvedParams = await params;
    const tripId = resolvedParams.tripId;
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");

    if (!tripId) {
      console.error("[smart-itinerary] Missing tripId param");
      return new NextResponse("Error: MISSING_TRIP_ID", { status: 400 });
    }

    // Only handle mode=load for GET
    if (mode !== "load") {
      return new NextResponse("Error: Use POST to generate itinerary", { status: 400 });
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Look up the itinerary row in smart_itineraries by trip_id
    const { data: existing, error: existingError } = await supabase
      .from("smart_itineraries")
      .select("content")
      .eq("trip_id", tripId)
      .maybeSingle();

    if (existingError) {
      console.error("[smart-itinerary] error fetching existing", existingError);
      return NextResponse.json({ error: "DATABASE_ERROR" }, { status: 500 });
    }

    if (!existing?.content) {
      // Not found → return 404
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    // Found → return pure JSON (content is already a JSON object, not a string)
    return NextResponse.json(existing.content);

  } catch (error) {
    console.error("[smart-itinerary] Top-level error", error);
    return new NextResponse("Error: TOP_LEVEL_ERROR", { status: 500 });
  }
}

// POST: Stream generation progress and save to Supabase
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const resolvedParams = await params;
    const tripId = resolvedParams.tripId;

    if (!tripId) {
      console.error("[smart-itinerary] Missing tripId param");
      return new NextResponse("Error: MISSING_TRIP_ID", { status: 400 });
    }

    // Initialize Supabase client
    const supabase = await createClient();

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const enqueue = (text: string) => {
          controller.enqueue(encoder.encode(text + "\n"));
        };

        try {
          // Check if itinerary already exists (idempotent)
          const { data: existing, error: existingError } = await supabase
            .from("smart_itineraries")
            .select("content")
            .eq("trip_id", tripId)
            .maybeSingle();

          if (existingError) {
            console.error("[smart-itinerary] error fetching existing", existingError);
          }

          if (existing?.content) {
            // Nothing to regenerate, just tell frontend to reload
            enqueue("__ITINERARY_READY__");
            controller.close();
            return;
          }

          // Fetch Trip Data for prompt
          const { data: trip, error: tripError } = await supabase
            .from("trips")
            .select("id, title, start_date, end_date, destination_name, destination_country")
            .eq("id", tripId)
            .single();

          if (tripError || !trip) {
            enqueue("Error: TRIP_NOT_FOUND");
            controller.close();
            return;
          }

          // Load saved places
          const { data: savedPlaces } = await supabase
            .from("saved_places")
            .select("name, types")
            .eq("trip_id", tripId)
            .limit(10);

          // Stream some progress lines to keep user engaged
          enqueue("PROGRESS: Analyzing trip details...");
          
          // Call OpenAI once and accumulate ALL text
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            stream: false,
            messages: [
              {
                role: "system",
                content: SYSTEM_PROMPT,
              },
              {
                role: "user",
                content: buildUserPromptFromTrip(trip, savedPlaces || []),
              },
            ],
          });

          const rawOutput = completion.choices[0]?.message?.content ?? "";
          
          // Parse the output to send any PROGRESS lines found in the LLM response before the JSON
          const lines = rawOutput.split('\n');
          for (const line of lines) {
              if (line.trim().startsWith("PROGRESS:")) {
                  enqueue(line.trim());
              }
          }

          console.log("[smart-itinerary] rawOutput length:", rawOutput.length);

          // Extract JSON between JSON_START / JSON_END
          const startMarker = "JSON_START";
          const endMarker = "JSON_END";
          const startIndex = rawOutput.indexOf(startMarker);
          const endIndex = rawOutput.indexOf(endMarker);

          if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
            console.error("[smart-itinerary] Missing JSON markers", {
              startIndex,
              endIndex,
            });
            // Try to find just json if markers missing? 
            // For now, strict error.
            enqueue("Error: JSON_MARKER_NOT_FOUND");
            controller.close();
            return;
          }

          const jsonString = rawOutput
            .slice(startIndex + startMarker.length, endIndex)
            .trim();

          let itinerary: SmartItinerary;

          try {
            itinerary = JSON.parse(jsonString);
          } catch (err) {
            console.error("[smart-itinerary] JSON parse error", err);
            console.error(
              "[smart-itinerary] JSON snippet:",
              jsonString.slice(0, 1000)
            );
            enqueue("Error: JSON_PARSE_ERROR");
            controller.close();
            return;
          }

          // Enrich photos
          enqueue("PROGRESS: Finding photos for key places...");
          try {
              const destination = trip.destination_name || trip.title;
              for (const day of itinerary.days) {
                  for (const place of day.places) {
                      try {
                          // Skip if photo already exists (unlikely from LLM, but safe)
                          if (place.photos && place.photos.length > 0 && place.photos[0]) continue;

                          const query = `${place.name} in ${destination}`;
                          const photoUrl = await findPlacePhoto(query);
                          if (photoUrl) {
                              place.photos = [photoUrl];
                          }
                      } catch (photoErr) {
                           console.error(`[smart-itinerary] Photo error for ${place.name}`, photoErr);
                      }
                  }
                  // Also try to find a hero photo for the day if not present
                  // Use the first place's photo or find one for the day title/theme?
                  // For now, let frontend pick from places.
              }
          } catch (photoErr) {
            console.error("[smart-itinerary] photo enrichment error", photoErr);
          }

          // Save to Supabase (pure JSON object, no markers)
          const { error: insertError } = await supabase
            .from("smart_itineraries")
            .insert({
              trip_id: tripId,
              content: itinerary, // This is already a parsed JSON object, not a string
            });

          if (insertError) {
            console.error("[smart-itinerary] insert error", insertError);
            enqueue("Error: DB_INSERT_ERROR");
            controller.close();
            return;
          }

          // Done – tell frontend to reload itinerary from DB
          enqueue("__ITINERARY_READY__");
          controller.close();

        } catch (error) {
          console.error("[smart-itinerary] Fatal error inside stream", error);
          controller.enqueue(
            encoder.encode("Error: FAILED_TO_GENERATE_ITINERARY\n")
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });

  } catch (error) {
    console.error("[smart-itinerary] Top-level error", error);
    return new NextResponse("Error: TOP_LEVEL_ERROR", { status: 500 });
  }
}
