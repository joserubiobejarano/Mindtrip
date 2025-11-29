import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOpenAIClient } from '@/lib/openai';
import { SmartItinerary } from '@/types/itinerary';

export const maxDuration = 300;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  let tripId: string | undefined;
  try {
    const resolvedParams = await params;
    tripId = resolvedParams.tripId;
    const { message } = await request.json();

    if (!tripId || !message) {
      return NextResponse.json({ error: 'Missing tripId or message' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // 1. Load current itinerary
    const { data: row, error: fetchError } = await supabase
      .from('smart_itineraries')
      .select('content')
      .eq('trip_id', tripId)
      .single();

    if (fetchError || !row) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }

    const currentItinerary = row.content as unknown as SmartItinerary;

    // 2. Call LLM to update
    const systemPrompt = `You are a travel assistant modifying a JSON itinerary.
You will receive the current "SmartItinerary" JSON and a user request.
You MUST return a VALID JSON object representing the UPDATED itinerary.
Do not change ids of existing items unless necessary.
Do not add comments or markdown.
Current Schema:
interface SmartItinerary {
  tripId: string;
  title: string;
  summary: string;
  days: {
    id: string;
    index: number;
    date: string;
    title: string;
    theme: string;
    description: string;
    places: {
      id: string;
      name: string;
      summary: string;
      pictures: string[];
      visited: boolean;
    }[];
  }[];
}
If you add new places, generate a UUID for them and leave pictures empty.
If the user asks to "swap" or "change", modify the relevant parts.
Output ONLY the JSON.`;

    const userPrompt = `Current Itinerary JSON:
${JSON.stringify(currentItinerary)}

User Request: "${message}"

Return the updated JSON.`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) throw new Error('No response from AI');

    let updatedItinerary: SmartItinerary;
    try {
      updatedItinerary = JSON.parse(responseContent);
    } catch (e) {
      console.error('[itinerary-chat] JSON Parse Error', e);
      console.log('Response:', responseContent);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    // 3. Save updated itinerary
    const { error: saveError } = await supabase
      .from('smart_itineraries')
      .update({
        content: updatedItinerary as any,
        updated_at: new Date().toISOString()
      })
      .eq('trip_id', tripId);

    if (saveError) {
      throw saveError;
    }

    return NextResponse.json({ itinerary: updatedItinerary });

  } catch (error) {
    console.error('[itinerary-chat] Error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

