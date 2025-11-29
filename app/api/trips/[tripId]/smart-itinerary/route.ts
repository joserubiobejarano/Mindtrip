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

  const systemPrompt = `You are an expert travel planner.
Your goal is to plan a detailed itinerary for a trip to ${destination}.

Process:
1. First, output short progress lines describing your thought process, one per line.
   Examples:
   "Analyzing trip duration and season..."
   "Selecting top rated restaurants..."
   "Designing Day 1 route..."
   
2. Then, output a single valid JSON object matching this schema:
{
  "tripId": "${tripId}",
  "title": "Trip Title",
  "summary": "Overall trip summary...",
  "days": [
    {
      "id": "uuid",
      "index": 1,
      "date": "YYYY-MM-DD",
      "title": "Day Title",
      "theme": "Theme",
      "description": "Day description...",
      "places": [
        {
          "id": "uuid",
          "name": "Place Name",
          "summary": "Place summary...",
          "pictures": [],
          "visited": false
        }
      ]
    }
  ]
}

Rules:
- The JSON must be the LAST thing you output.
- The JSON must be valid.
- Leave "pictures" arrays empty (we will fill them).
- Generate UUIDs for ids.
- Do NOT output markdown code blocks for the JSON, just the raw JSON string starting with { and ending with }.
- Ensure you output at least 3-4 progress lines before the JSON.
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
      let jsonStarted = false;

      try {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || '';
          fullText += text;

          if (!jsonStarted) {
            const jsonStartIndex = fullText.indexOf('{');
            if (jsonStartIndex !== -1) {
              jsonStarted = true;
              // Send the part before JSON if it was just received
              const chunkIndexInFull = fullText.length - text.length;
              if (chunkIndexInFull < jsonStartIndex) {
                 const partToSend = text.substring(0, jsonStartIndex - chunkIndexInFull);
                 controller.enqueue(encoder.encode(partToSend));
              }
            } else {
              controller.enqueue(encoder.encode(text));
            }
          }
        }

        // Process JSON
        const jsonStartIndex = fullText.indexOf('{');
        const jsonEndIndex = fullText.lastIndexOf('}');
        
        if (jsonStartIndex === -1 || jsonEndIndex === -1) {
          throw new Error('Failed to generate valid JSON itinerary');
        }

        const jsonStr = fullText.substring(jsonStartIndex, jsonEndIndex + 1);
        let itinerary: SmartItinerary;
        
        try {
           itinerary = JSON.parse(jsonStr);
        } catch (err) {
           console.error('[smart-itinerary] JSON parse error', err);
           console.error('[smart-itinerary] Raw output snippet:', fullText.slice(0, 1000));
           throw new Error('JSON_PARSE_ERROR');
        }

        // Enrich with photos
        try {
          // Temporarily disabled photo enrichment
          /*
          for (const day of itinerary.days) {
            for (const place of day.places) {
               try {
                 const query = `${place.name} in ${destination}`;
                 const photoUrl = await findPlacePhoto(query);
                 if (photoUrl) {
                   place.pictures = [photoUrl];
                 }
               } catch (err) {
                 console.error('[smart-itinerary] Photo fetch error', err);
               }
            }
          }
          */
        } catch (err) {
          console.error('[smart-itinerary] Photo enrichment error', err);
          throw new Error('PHOTO_ENRICHMENT_ERROR');
        }

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

      } catch (err) {
        console.error('[smart-itinerary] Fatal error generating itinerary', err);
        // If the error is one of our known codes, we might want to send that to client, 
        // but for now the requirement says "Error: Failed to generate itinerary."
        controller.enqueue(encoder.encode('Error: Failed to generate itinerary.\n'));
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
