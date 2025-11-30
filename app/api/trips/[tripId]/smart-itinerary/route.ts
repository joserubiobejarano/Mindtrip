import { createOpenAI } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { smartItinerarySchema } from '@/types/itinerary-schema';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  try {
    const { tripId } = await params;

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
      You are an expert travel planner. Generate a multi-day travel itinerary as JSON matching the schema.

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
         - Use "visited" = false.
         - Fill "tags" with relevant keywords.
    `;

    const userPrompt = `Trip details:\n${JSON.stringify(tripMeta)}\n\nGenerate the full itinerary.`;

    const result = await streamObject({
      model: openai('gpt-4o-mini'),
      system,
      prompt: userPrompt,
      schema: smartItinerarySchema,
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error('[smart-itinerary] Error', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
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

    return NextResponse.json(
      { itinerary: data.content },
      { status: 200 }
    );
  } catch (err) {
    console.error('[smart-itinerary GET] unexpected error', err);
    return NextResponse.json({ error: 'server-error' }, { status: 500 });
  }
}
