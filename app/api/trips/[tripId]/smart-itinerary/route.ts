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

const SYSTEM_PROMPT = `You are the Smart Itinerary planner for MindTrip, a travel planning app.

Your job:
- Take the trip information that the developer passes to you (destination, dates, travelers, preferences if any).
- Design a story-like, realistic itinerary that balances:
  - walking and sightseeing,
  - food and coffee breaks,
  - a mix of “must see” highlights and a few less obvious local spots,
  - no crazy backtracking or teleporting across the city in one hour.

ABSOLUTE RULES ABOUT YOUR OUTPUT
--------------------------------
1. You MUST follow the exact output format described below.
2. You MUST produce **plain text**, not Markdown.
3. You MUST include a single JSON object between the markers \`JSON_START\` and \`JSON_END\`.
4. Outside of that JSON block, you may only output “progress” lines that start with \`PROGRESS:\`.
5. Never output anything after the line \`JSON_END\`.

OUTPUT FORMAT
-------------
Your response must look like this, in this order:
1) 3–8 progress lines, one per line, each starting with:
   PROGRESS: short present-tense message about what you are planning.
   Examples:
   - PROGRESS: Analyzing dates and trip length.
   - PROGRESS: Choosing must-see landmarks and neighborhoods.
   - PROGRESS: Designing Day 1 morning activities near the city center.
   - PROGRESS: Balancing food, culture, and free time across the week.

2) A line that contains exactly:
   JSON_START

3) A single well-formed JSON object that matches the SmartItinerary schema below.
   - No comments.
   - No trailing commas.
   - All object keys in double quotes.
   - All strings in double quotes.
   - Use \`true\` / \`false\` (no capital letters) for booleans.
   - Use arrays \`[]\` even if they are empty.

4) A line that contains exactly:
   JSON_END

SMART ITINERARY SCHEMA (IMPORTANT)
----------------------------------
You MUST produce a JSON object of this shape:
{
  "title": string,               // Story-like trip title
  "summary": string,             // 2–4 sentence overview of the whole trip
  "days": [
    {
      "id": string,              // unique, stable id for this day (uuid-like is fine)
      "index": number,           // 1-based index for the day (1,2,3…)
      "date": string,            // ISO date: "YYYY-MM-DD"
      "title": string,           // short title for the day
      "summary": string,         // 2–4 sentences narrating the day
      "theme": string,           // short theme label, e.g. "Cultural Immersion", "Food & Markets"
      "places": [
        {
          "id": string,          // unique id for the place (uuid-like is fine)
          "name": string,        // place or activity name
          "summary": string,     // 1–3 sentences describing what the traveler does there
          "photos": string[],    // ALWAYS an empty array [] for now; backend will fill with URLs
          "visited": boolean,    // ALWAYS false initially
          "tags": string[],      // categories, e.g. ["park", "viewpoint", "food", "nightlife"]
          "neighborhood": string, // optional rough area name in the city
          "timeOfDay": "morning" | "afternoon" | "evening" | "night" | "flex"
        }
      ]
    }
  ]
}

CONTENT STYLE GUIDELINES
------------------------
- Make the itinerary **realistic**: no more than 3–6 main places per day.
- Group places in the same neighborhood for each half-day when possible.
- Use **story-like** language inside the \`summary\` fields (trip summary, day summaries, place summaries), but DO NOT add any additional free text outside the JSON.
- For dates:
  - Respect the exact start and end dates the developer passes in.
  - Day 1 should be the arrival date, Day N the last date of the trip.
- For trips with arrival/departure at odd hours:
  - Keep arrival/departure days lighter (fewer places, closer to accommodation or station).
- If the trip is long (10+ days), add a few lighter days to rest or wander more freely.

REMEMBER:
- Your response must be:
  - Several \`PROGRESS:\` lines,
  - then \`JSON_START\`,
  - then one valid JSON object following the schema,
  - then \`JSON_END\`.
- No Markdown. No comments. No text after \`JSON_END\`.
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
                          const query = `${place.name} in ${destination}`;
                          const photoUrl = await findPlacePhoto(query);
                          if (photoUrl) {
                              place.photos = [photoUrl];
                          }
                      } catch (photoErr) {
                           console.error(`[smart-itinerary] Photo error for ${place.name}`, photoErr);
                      }
                  }
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
