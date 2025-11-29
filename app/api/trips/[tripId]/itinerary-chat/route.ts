import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOpenAIClient } from '@/lib/openai';
import { SmartItinerary } from '@/types/itinerary';

export const maxDuration = 300; // Set timeout to 5 minutes

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    const resolvedParams = await params;
    const tripId = resolvedParams.tripId;

    const supabase = await createClient();
    const { data: row, error } = await supabase
      .from('smart_itineraries')
      .select('content')
      .eq('trip_id', tripId)
      .single();

    if (error || !row?.content) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }

    const currentItinerary = row.content as unknown as SmartItinerary;

    const SYSTEM_PROMPT = `
You are an expert travel planner editing an existing trip itinerary.

You are given:
- The CURRENT itinerary JSON (with days, places, tips, and affiliateSuggestions).
- A USER REQUEST describing modifications.

Your job:
- Apply ONLY the requested changes.
- Keep IDs (trip, day, place, tips, affiliateSuggestions) stable whenever possible.
- Do NOT drop existing content unless it conflicts with the user's request.
- Ensure every day still has a coherent flow and reasonable number of activities.

Important:
- Respond with a SINGLE JSON object in the SmartItinerary format.
- Do NOT include any extra text, commentary, or markdown.
`;

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_ITINERARY_MODEL_ID || 'gpt-4o', // Use specific model or fallback
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            currentItinerary,
            userRequest: message,
          }),
        },
      ],
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    let updated: SmartItinerary;
    
    try {
        updated = JSON.parse(raw);
    } catch (e) {
        console.error("JSON parse error in chat edit", e);
        return NextResponse.json({ error: 'Failed to parse itinerary from AI' }, { status: 500 });
    }

    // basic sanity check
    if (!updated?.days || !Array.isArray(updated.days)) {
      console.error("Invalid itinerary shape", updated);
      return NextResponse.json({ error: 'Invalid itinerary JSON from model' }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from('smart_itineraries')
      .update({ content: updated as any }) // Casting as any to bypass Supabase JSON type strictness if needed
      .eq('trip_id', tripId);

    if (updateError) {
      console.error('[itinerary-chat] Supabase update failed', updateError);
      return NextResponse.json({ error: 'Failed to save itinerary' }, { status: 500 });
    }

    return NextResponse.json({ itinerary: updated });
  } catch (err) {
    console.error('[itinerary-chat] Error', err);
    return NextResponse.json({ error: 'Chat edit failed' }, { status: 500 });
  }
}
