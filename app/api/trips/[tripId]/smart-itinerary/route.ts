import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOpenAIClient } from '@/lib/openai';
import { SmartItinerary } from '@/types/itinerary';
import { smartItinerarySchema } from '@/types/itinerary-schema';
import { findPlacePhoto } from '@/lib/google/places-server';

export const maxDuration = 300;

export async function POST(req: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;

  if (!tripId) {
    return NextResponse.json(
      { error: 'Missing trip id' },
      { status: 400 },
    );
  }

  try {
    const supabase = await createClient();

    // 1. Load Trip Details
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, title, start_date, end_date, destination_name, destination_country')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // 2. Load Saved Places
    const { data: savedPlaces } = await supabase
      .from('saved_places')
      .select('name, types')
      .eq('trip_id', tripId)
      .limit(10);

    const tripMeta = {
      destination: trip.destination_name || trip.title,
      dates: `${new Date(trip.start_date).toDateString()} - ${new Date(trip.end_date).toDateString()}`,
      savedPlaces: savedPlaces?.map(p => p.name) || []
    };

    const system = `
      You are an expert travel planner. Generate a multi-day travel itinerary as JSON matching the SmartItinerary schema.

      RULES:
      1. Structure:
         - Split each day into three slots: "morning", "afternoon", "evening".
         - For each slot, pick 2–4 places.
         - Aim for 8–10 total places per day.
         - Ensure places in a slot are geographically close (same area/neighborhood) to reduce backtracking.
         - Use the "areaCluster" field for the day's main area.
      
      2. Content:
         - In each day's "overview", include practical micro-tips (best time to visit, ticket warnings, busy hours).
         - In "tripTips", include season- and date-based advice (weather, holidays, opening hours, local events) specific to the trip dates.
         - Use "visited" = false for all places.
         - Fill "tags" with relevant keywords.
      
      3. EXACT JSON SCHEMA (you MUST return exactly this structure):
      {
        "title": string,
        "summary": string,
        "days": [
          {
            "id": string (UUID),
            "index": number (0-based),
            "date": string (ISO date),
            "title": string,
            "theme": string,
            "areaCluster": string,
            "photos": string[],
            "overview": string,
            "slots": [
              {
                "label": "morning" | "afternoon" | "evening",
                "summary": string,
                "places": [
                  {
                    "id": string (UUID),
                    "name": string,
                    "description": string,
                    "area": string,
                    "neighborhood": string | null,
                    "photos": string[],
                    "visited": boolean (always false),
                    "tags": string[]
                  }
                ]
              }
            ]
          }
        ],
        "tripTips": string[]
      }
      
      4. OUTPUT ONLY JSON matching the SmartItinerary schema. Do not include any text outside the JSON structure. Reply ONLY with a single JSON object that matches the SmartItinerary schema. Do not include any explanation or markdown. Do not wrap the response in any other object.
    `;

    const userPrompt = `Trip details:\n${JSON.stringify(tripMeta)}\n\nGenerate the full itinerary.`;

    console.log('[smart-itinerary] generating itinerary for trip', tripId);

    const openai = getOpenAIClient();

    // Use JSON mode so we don't get non-JSON text
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: system,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error('[smart-itinerary] empty completion', completion);
      return NextResponse.json(
        { error: 'Empty completion from OpenAI' },
        { status: 500 },
      );
    }

    let itinerary: unknown;
    try {
      itinerary = JSON.parse(content);
    } catch (err) {
      console.error('[smart-itinerary] JSON parse error', err, 'raw content:', content);
      return NextResponse.json(
        { error: 'Failed to parse itinerary JSON' },
        { status: 500 },
      );
    }

    // Log raw object from model for debugging
    console.log('[smart-itinerary] SMART_ITINERARY_RAW_MODEL_OUTPUT:', JSON.stringify(itinerary, null, 2));

    // Validate the itinerary structure using Zod schema
    let validatedItinerary: SmartItinerary;
    try {
      validatedItinerary = smartItinerarySchema.parse(itinerary) as SmartItinerary;
    } catch (validationError: any) {
      // Serialize error without circular refs
      const errorDetails = {
        name: validationError?.name,
        message: validationError?.message,
        issues: validationError?.issues || validationError?.errors || [],
        stack: validationError?.stack?.split('\n').slice(0, 5), // First 5 lines of stack
      };
      
      console.error('[smart-itinerary] SMART_ITINERARY_SCHEMA_ERROR:', JSON.stringify(errorDetails, null, 2));
      console.error('[smart-itinerary] SMART_ITINERARY_RAW_MODEL_OUTPUT:', JSON.stringify(itinerary, null, 2));
      
      return NextResponse.json(
        { 
          error: 'Invalid itinerary payload', 
          details: errorDetails 
        },
        { status: 500 },
      );
    }

    console.log('[smart-itinerary] validated itinerary for trip', tripId, 'days:', validatedItinerary.days.length);

    // Enrich places with photos from Google Places API
    const destination = trip.destination_name || trip.title;
    const cityOrArea = destination;
    
    // Enrich all days in parallel, but places sequentially within each day to avoid rate limits
    await Promise.all(validatedItinerary.days.map(async (day) => {
      // Enrich each place's photos sequentially
      for (const slot of day.slots) {
        for (const place of slot.places) {
          // Only enrich if photos array is empty or missing
          if (!place.photos || place.photos.length === 0) {
            const photoUrl = await findPlacePhoto(`${place.name} in ${cityOrArea}`);
            place.photos = photoUrl ? [photoUrl] : [];
          }
        }
      }
      
      // Set day.photos from place photos (first 4 photos from all places in the day)
      const allPlacePhotos = day.slots.flatMap(slot => 
        slot.places.flatMap(place => place.photos || [])
      );
      day.photos = allPlacePhotos.slice(0, 4);
    }));

    // Save to Supabase - content is the SmartItinerary object directly, not wrapped
    const { data, error } = await supabase
      .from('smart_itineraries')
      .upsert(
        {
          trip_id: tripId,
          content: validatedItinerary, // content column should be jsonb, storing SmartItinerary directly
          updated_at: new Date().toISOString()
        },
        { onConflict: 'trip_id' },
      )
      .select('content')
      .single();

    if (error) {
      console.error('[smart-itinerary] Supabase upsert error', error);
      return NextResponse.json(
        { error: 'Failed to save itinerary', details: error.message },
        { status: 500 },
      );
    }

    console.log('[smart-itinerary] saved itinerary row for trip', tripId);

    // Return bare SmartItinerary directly (data.content is already the SmartItinerary object)
    // No wrapping - data.content is the SmartItinerary itself
    return NextResponse.json(
      data.content as SmartItinerary,
      { status: 200 },
    );
  } catch (err: any) {
    console.error('[smart-itinerary] POST fatal error', err);
    return NextResponse.json(
      { error: 'Failed to generate itinerary', details: err?.message ?? String(err) },
      { status: 500 },
    );
  }
}

// GET handler for loading existing itinerary
export async function GET(req: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  try {
    const { tripId } = await params;
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode') ?? 'load';
    
    // Only handle mode=load
    if (mode !== 'load') {
      return NextResponse.json({ error: 'unsupported-mode' }, { status: 400 });
    }

    const supabase = await createClient();

    // Load itinerary from database
    const { data, error } = await supabase
      .from('smart_itineraries')
      .select('content')
      .eq('trip_id', tripId)
      .single();

    if (error) {
      console.error('[smart-itinerary GET] supabase error', error);
      // If no row yet → 404, frontend will decide to generate
      if (error.code === 'PGRST116' || error.details?.includes('Results contain 0 rows')) {
        return NextResponse.json({ error: 'not-found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'db-error' }, { status: 500 });
    }

    if (!data?.content) {
      return NextResponse.json({ error: 'not-found' }, { status: 404 });
    }

    console.log('[smart-itinerary] loaded from DB:', JSON.stringify(data.content, null, 2));

    // Return bare SmartItinerary directly (data.content is already the SmartItinerary object)
    return NextResponse.json(
      data.content,
      { status: 200 }
    );
  } catch (err) {
    console.error('[smart-itinerary GET] unexpected error', err);
    return NextResponse.json({ error: 'server-error' }, { status: 500 });
  }
}
