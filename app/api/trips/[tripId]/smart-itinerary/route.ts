import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { findPlacePhoto } from '@/lib/google/places-server';
import { getOpenAIClient } from '@/lib/openai';
import { SmartItinerary, ItineraryDay, ItineraryPlace } from '@/types/itinerary';

export const maxDuration = 300; // 5 minutes timeout

/**
 * Validate if a string is a valid UUID
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

async function streamItineraryGeneration(tripId: string, trip: any, savedPlaces: any[]) {
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const destination = trip.destination_name || trip.title;
  
  let savedPlacesText = '';
  if (savedPlaces && savedPlaces.length > 0) {
    savedPlacesText = `\nInclude these saved places if possible: ${savedPlaces.map((p: any) => p.name).join(', ')}`;
  }

  const systemPrompt = `You are the Smart Itinerary planner for MindTrip, a travel planning app.

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

  const userPrompt = `Plan a trip to ${destination} from ${startDate.toDateString()} to ${endDate.toDateString()}.${savedPlacesText}`;

  const openai = getOpenAIClient();
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    stream: true,
  });

  const encoder = new TextEncoder();
  const supabase = await createClient();

  return new ReadableStream({
    async start(controller) {
      let fullText = '';
      
      try {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || '';
          fullText += text;
          
          // Stream everything to client so they see progress lines
          // We can filter on client side if needed, or just let them see it
          controller.enqueue(encoder.encode(text));
        }

        const rawOutput = fullText; 

        const startMarker = 'JSON_START';
        const endMarker = 'JSON_END';
        const startIndex = rawOutput.indexOf(startMarker);
        const endIndex = rawOutput.indexOf(endMarker);

        if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
          console.error('[smart-itinerary] Missing JSON markers', { startIndex, endIndex });
          throw new Error('JSON_MARKER_NOT_FOUND');
        }

        const jsonString = rawOutput
          .slice(startIndex + startMarker.length, endIndex)
          .trim();

        let itinerary: SmartItinerary;

        try {
          itinerary = JSON.parse(jsonString);
        } catch (err) {
          console.error('[smart-itinerary] JSON parse error', err);
          console.error('[smart-itinerary] Raw JSON snippet:', jsonString.slice(0, 1000));
          throw new Error('JSON_PARSE_ERROR');
        }

        // Enrich with photos (disabled for now or needs update to new field 'photos')
        /*
        try {
          for (const day of itinerary.days) {
            for (const place of day.places) {
               try {
                 const query = `${place.name} in ${destination}`;
                 const photoUrl = await findPlacePhoto(query);
                 if (photoUrl) {
                   place.photos = [photoUrl];
                 }
               } catch (err) {
                 console.error('[smart-itinerary] Photo fetch error', err);
               }
            }
          }
        } catch (err) {
          console.error('[smart-itinerary] Photo enrichment error', err);
          // Don't fail the whole request for photos
        }
        */

        // Save to Supabase
        const { error: dbError } = await supabase
          .from('smart_itineraries')
          .upsert({
            trip_id: tripId,
            content: itinerary as any,
            updated_at: new Date().toISOString()
          }, { onConflict: 'trip_id' });

        if (dbError) {
           console.error('[smart-itinerary] Supabase insert error', dbError);
           throw new Error('DB_ERROR');
        }

        controller.enqueue(encoder.encode('\n__ITINERARY_READY__'));
        controller.close();

      } catch (err: any) {
        console.error('[smart-itinerary] Fatal error generating itinerary', err);
        
        let errorMessage = 'Error: UNKNOWN\n';
        if (err.message === 'JSON_MARKER_NOT_FOUND') {
          errorMessage = 'Error: JSON_MARKER_NOT_FOUND\n';
        } else if (err.message === 'JSON_PARSE_ERROR') {
          errorMessage = 'Error: JSON_PARSE_ERROR\n';
        }

        controller.enqueue(encoder.encode(errorMessage));
        controller.close();
      }
    }
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  let tripId: string | undefined;
  
  try {
    const resolvedParams = await params;
    tripId = resolvedParams.tripId;

    if (!tripId || !isValidUUID(tripId)) {
      return NextResponse.json({ error: 'Invalid trip id' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check existing
    const { data: existing, error: existingError } = await supabase
      .from('smart_itineraries')
      .select('content')
      .eq('trip_id', tripId)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: 'Failed to load itinerary' }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ itinerary: existing.content, source: 'existing' });
    }

    // Load Data
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, title, start_date, end_date, destination_name, destination_country')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Load saved places
    const { data: savedPlaces } = await supabase
      .from('saved_places')
      .select('name, types')
      .eq('trip_id', tripId)
      .limit(10);

    const stream = await streamItineraryGeneration(tripId, trip, savedPlaces || []);

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });

  } catch (error) {
    console.error('[smart-itinerary] Unhandled error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  let tripId: string | undefined;
  try {
    const resolvedParams = await params;
    tripId = resolvedParams.tripId;

    if (!tripId || !isValidUUID(tripId)) {
      return NextResponse.json({ error: 'Invalid trip id' }, { status: 400 });
    }

    const supabase = await createClient();

    // Load Trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, title, start_date, end_date, destination_name, destination_country')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }
    
    // Load saved places
    const { data: savedPlaces } = await supabase
      .from('saved_places')
      .select('name, types')
      .eq('trip_id', tripId)
      .limit(10);

    // Delete existing
    await supabase.from('smart_itineraries').delete().eq('trip_id', tripId);

    const stream = await streamItineraryGeneration(tripId, trip, savedPlaces || []);

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error) {
    console.error('[smart-itinerary] POST error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Full Update PATCH (optional, can be used for sync if needed)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const resolvedParams = await params;
    const tripId = resolvedParams.tripId;
    const body = await request.json();
    const { itinerary } = body;

    if (!tripId || !itinerary) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('smart_itineraries')
      .upsert({
        trip_id: tripId,
        content: itinerary,
        updated_at: new Date().toISOString()
      }, { onConflict: 'trip_id' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
