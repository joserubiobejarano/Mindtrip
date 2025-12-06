import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { SmartItinerary } from '@/types/itinerary';

export const maxDuration = 300;

const SMART_ITINERARY_SCHEMA_TEXT = `
interface ItineraryPlace {
  id: string;
  name: string;
  description: string;
  area: string;       // e.g. "Gothic Quarter"
  neighborhood: string | null;
  photos: string[];
  visited: boolean;
  tags: string[];     // "food", "viewpoint", etc.
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening';

interface ItinerarySlot {
  label: TimeOfDay;
  summary: string;
  places: ItineraryPlace[];
}

interface ItineraryDay {
  id: string;
  index: number;
  date: string;
  title: string;
  theme: string;
  areaCluster: string; // main area for that day
  photos: string[];
  overview: string;
  slots: ItinerarySlot[]; // usually 3
}

interface SmartItinerary {
  title: string;
  summary: string;
  days: ItineraryDay[];
  tripTips: string[]; // trip-wide tips (season, holidays, packing)
}
`;

export async function POST(req: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  try {
    const { tripId } = await params;
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    // 1) Auth + Supabase
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    
    const supabase = await createClient();

    // 2) Load existing itinerary
    const { data: row, error: fetchError } = await supabase
      .from('smart_itineraries')
      .select('content')
      .eq('trip_id', tripId)
      .single();

    if (fetchError || !row) {
      console.error('[itinerary-chat] missing itinerary', fetchError);
      return NextResponse.json({ error: 'no-itinerary' }, { status: 400 });
    }

    const currentItinerary = row.content as unknown as SmartItinerary;

    // 3) Call OpenAI
    const system = `
You are an assistant that edits a JSON itinerary object.
ALWAYS reply with ONLY valid JSON matching this TypeScript type, nothing else:

${SMART_ITINERARY_SCHEMA_TEXT}

You are given the current itinerary JSON and a user request.
Modify ONLY the necessary parts (days, places, tips), keep ids stable when possible.
Do NOT change the overall structure (keys, arrays).
`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // or 'gpt-4o' if preferred/available
      temperature: 0.4,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Current itinerary JSON:\n${JSON.stringify(currentItinerary)}` },
        { role: 'user', content: `User request:\n${message}` },
      ],
      response_format: { type: 'json_object' }
    });

    const raw = response.choices[0]?.message?.content ?? '';

    // 4) Strip code fences and parse safely
    function extractJson(raw: string) {
      const cleaned = raw
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(cleaned);
    }

    let updated: SmartItinerary;
    try {
      updated = extractJson(raw);
    } catch (err) {
      console.error('[itinerary-chat] JSON parse error', raw, err);
      return NextResponse.json({ error: 'bad-json' }, { status: 500 });
    }

    // 5) Save back to Supabase
    const { data: updatedRow, error: updateError } = await supabase
      .from('smart_itineraries')
      .update({ content: updated as any })
      .eq('trip_id', tripId)
      .select()
      .single();

    if (updateError) {
      console.error('[itinerary-chat] supabase update error', updateError);
      return NextResponse.json({ error: 'db-error' }, { status: 500 });
    }

    // Return bare SmartItinerary directly (updated is already the SmartItinerary object)
    return NextResponse.json(updated);

  } catch (err) {
    console.error('[itinerary-chat] Error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
