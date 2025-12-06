import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { SmartItinerary } from '@/types/itinerary';
import { smartItinerarySchema } from '@/types/itinerary-schema';
import { findPlacePhoto, getPlaceDetails } from '@/lib/google/places-server';
import { clearLikedPlacesAfterRegeneration } from '@/lib/supabase/explore-integration';
import { GOOGLE_MAPS_API_KEY } from '@/lib/google/places-server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 300;

/**
 * Helper to extract complete JSON objects from streaming text
 * Uses bracket/brace counting to find complete objects
 */
function extractCompleteObjects(text: string): {
  title?: string;
  summary?: string;
  days: any[];
  tripTips?: string[];
  isComplete: boolean;
} {
  const result: {
    title?: string;
    summary?: string;
    days: any[];
    tripTips?: string[];
    isComplete: boolean;
  } = { days: [] as any[], isComplete: false };
  
  try {
    // Try to parse as complete JSON first
    const parsed = JSON.parse(text);
    if (parsed.title) result.title = parsed.title;
    if (parsed.summary) result.summary = parsed.summary;
    if (parsed.days && Array.isArray(parsed.days)) {
      result.days = parsed.days;
    }
    if (parsed.tripTips) result.tripTips = parsed.tripTips;
    result.isComplete = true;
    return result;
  } catch {
    // Partial JSON - try to extract complete day objects from the days array
    // Find the days array start
    const daysArrayStart = text.indexOf('"days"');
    if (daysArrayStart === -1) return result;
    
    const afterDaysLabel = text.substring(daysArrayStart);
    const arrayStart = afterDaysLabel.indexOf('[');
    if (arrayStart === -1) return result;
    
    // Extract the days array content
    let braceCount = 0;
    let bracketCount = 1; // We're inside the array
    let currentDayStart = -1;
    let i = arrayStart + 1;
    
    while (i < afterDaysLabel.length && bracketCount > 0) {
      const char = afterDaysLabel[i];
      
      if (char === '{') {
        if (braceCount === 0) {
          currentDayStart = i;
        }
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && currentDayStart !== -1) {
          // Found a complete day object
          try {
            const dayJson = afterDaysLabel.substring(currentDayStart, i + 1);
            const day = JSON.parse(dayJson);
            if (day.id && day.index !== undefined && day.slots && Array.isArray(day.slots)) {
              result.days.push(day);
            }
          } catch {
            // Skip invalid day JSON
          }
          currentDayStart = -1;
        }
      } else if (char === '[') {
        bracketCount++;
      } else if (char === ']') {
        bracketCount--;
      }
      
      i++;
    }
    
    // Try to extract title and summary using regex (simpler approach)
    const titleMatch = text.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (titleMatch) result.title = titleMatch[1];
    
    const summaryMatch = text.match(/"summary"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (summaryMatch) result.summary = summaryMatch[1];
  }
  
  return result;
}

/**
 * Send SSE message
 */
function sendSSE(controller: ReadableStreamDefaultController, type: string, data: any) {
  const message = JSON.stringify({ type, data });
  controller.enqueue(new TextEncoder().encode(`data: ${message}\n\n`));
}

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
    const { userId } = await auth();

    // Parse request body for regeneration parameters
    let mustIncludePlaceIds: string[] = [];
    let alreadyPlannedPlaceIds: string[] = [];
    let preserveStructure = false;

    try {
      const body = await req.json().catch(() => ({}));
      mustIncludePlaceIds = body.must_include_place_ids || [];
      alreadyPlannedPlaceIds = body.already_planned_place_ids || [];
      preserveStructure = body.preserve_structure || false;
    } catch {
      // Body parsing failed, continue with defaults
    }

    // 1. Load Trip Details
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, title, start_date, end_date, destination_name, destination_country')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // 2. Load existing itinerary if regenerating
    let existingItinerary: SmartItinerary | null = null;
    if (preserveStructure || mustIncludePlaceIds.length > 0) {
      const { data: existingData } = await supabase
        .from('smart_itineraries')
        .select('content')
        .eq('trip_id', tripId)
        .maybeSingle();

      if (existingData?.content) {
        try {
          existingItinerary = existingData.content as SmartItinerary;
        } catch (err) {
          console.error('Error parsing existing itinerary:', err);
        }
      }
    }

    // 3. Fetch place details for must_include_place_ids
    const mustIncludePlaces: Array<{
      place_id: string;
      name: string;
      address?: string;
      types?: string[];
      rating?: number;
    }> = [];

    if (mustIncludePlaceIds.length > 0 && GOOGLE_MAPS_API_KEY) {
      console.log(`[smart-itinerary] Fetching details for ${mustIncludePlaceIds.length} places`);
      for (const placeId of mustIncludePlaceIds) {
        const placeDetails = await getPlaceDetails(placeId);
        if (placeDetails) {
          mustIncludePlaces.push({
            place_id: placeId,
            name: placeDetails.name,
            address: placeDetails.formatted_address,
            types: placeDetails.types,
            rating: placeDetails.rating,
          });
        }
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      console.log(`[smart-itinerary] Fetched ${mustIncludePlaces.length} place details`);
    }

    // 4. Load Saved Places
    const { data: savedPlaces } = await supabase
      .from('saved_places')
      .select('name, types')
      .eq('trip_id', tripId)
      .limit(10);

    const tripMeta = {
      destination: trip.destination_name || trip.title,
      dates: `${new Date(trip.start_date).toDateString()} - ${new Date(trip.end_date).toDateString()}`,
      savedPlaces: savedPlaces?.map(p => p.name) || [],
      mustIncludePlaces: mustIncludePlaces.map(p => ({
        name: p.name,
        address: p.address,
        types: p.types,
        rating: p.rating,
      })),
      alreadyPlannedPlaceIds: alreadyPlannedPlaceIds.length > 0 ? alreadyPlannedPlaceIds : undefined,
    };

    // Build system prompt with regeneration instructions
    let structureInstructions = `
      1. Structure:
         - Split each day into three slots: "morning", "afternoon", "evening".
         - For each slot, pick 2–4 places.
         - Aim for 8–10 total places per day.
         - Ensure places in a slot are geographically close (same area/neighborhood) to reduce backtracking.
         - Use the "areaCluster" field for the day's main area.`;

    if (preserveStructure && existingItinerary) {
      structureInstructions += `
         - PRESERVE EXISTING DAY STRUCTURE: Keep the same days, themes, and area clusters.
         - Only reshuffle activities/places within days as needed to accommodate new places.
         - Maintain the overall flow and day-by-day organization.`;
    }

    if (mustIncludePlaces.length > 0) {
      structureInstructions += `
         - CRITICAL: You MUST place every place from the "mustIncludePlaces" array at least once in the itinerary.
         - Do not ignore any place from mustIncludePlaces. Every single one must appear in at least one day/slot.
         - Cluster mustIncludePlaces with other places in the same neighborhood/area when possible.`;
    }

    const system = `
      You are an expert travel planner. Generate a multi-day travel itinerary as JSON matching the SmartItinerary schema.

      RULES:
      ${structureInstructions}
      
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

    // Build user prompt with existing itinerary if preserving structure
    let userPrompt = `Trip details:\n${JSON.stringify(tripMeta)}\n\n`;
    
    if (preserveStructure && existingItinerary) {
      userPrompt += `EXISTING ITINERARY STRUCTURE (preserve this structure):\n${JSON.stringify({
        days: existingItinerary.days.map(day => ({
          id: day.id,
          index: day.index,
          date: day.date,
          title: day.title,
          theme: day.theme,
          areaCluster: day.areaCluster,
        }))
      }, null, 2)}\n\n`;
      userPrompt += `Preserve the above day structure. Only reshuffle places/activities within days to accommodate the new mustIncludePlaces. Keep the same themes, area clusters, and day-by-day flow.\n\n`;
    }
    
    userPrompt += `Generate the full itinerary.`;

    console.log('[smart-itinerary] generating itinerary for trip', tripId);

    const destination = trip.destination_name || trip.title;
    const cityOrArea = destination;

    // Create a streaming response using Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let accumulatedText = '';
          let lastSentDayIndex = -1;
          let validatedItinerary: SmartItinerary | null = null;
          let titleSent = false;
          let summarySent = false;

          // Stream the text from OpenAI
          // Note: response_format: 'json_object' doesn't work with streaming in the same way
          // We'll stream the text and parse JSON incrementally
          const result = await streamText({
            model: openai('gpt-4o-mini'),
            system: system,
            prompt: userPrompt,
            temperature: 0.7,
            // Don't use response_format with streaming - we'll parse JSON manually
          });

          // Process the stream
          for await (const chunk of result.textStream) {
            accumulatedText += chunk;
            
            // Try to parse what we have so far
            const partial = extractCompleteObjects(accumulatedText);
            
            // Send title if we have it and haven't sent it
            if (partial.title && !titleSent) {
              sendSSE(controller, 'title', partial.title);
              titleSent = true;
            }
            
            // Send summary if we have it and haven't sent it
            if (partial.summary && !summarySent) {
              sendSSE(controller, 'summary', partial.summary);
              summarySent = true;
            }
            
            // Send days as they become complete
            for (let i = lastSentDayIndex + 1; i < partial.days.length; i++) {
              const day = partial.days[i];
              // Check if day looks complete (has all required fields)
              if (day.id && day.index !== undefined && day.slots && Array.isArray(day.slots) && day.slots.length > 0) {
                // Validate the day structure
                try {
                  // Send the day immediately (without photos for now)
                  sendSSE(controller, 'day', day);
                  lastSentDayIndex = i;
                  
                  // Start fetching photos asynchronously in background
                  // Don't await - let it happen in parallel
                  (async () => {
                    try {
                      const enrichedDay = { ...day };
                      for (const slot of enrichedDay.slots) {
                        for (const place of slot.places) {
                          if (!place.photos || place.photos.length === 0) {
                            const photoUrl = await findPlacePhoto(`${place.name} in ${cityOrArea}`);
                            place.photos = photoUrl ? [photoUrl] : [];
                          }
                        }
                      }
                      
                      // Set day photos
                      const allPlacePhotos = enrichedDay.slots.flatMap(slot => 
                        slot.places.flatMap(place => place.photos || [])
                      );
                      enrichedDay.photos = allPlacePhotos.slice(0, 4);
                      
                      // Send updated day with photos
                      sendSSE(controller, 'day-updated', enrichedDay);
                    } catch (err) {
                      console.error('[smart-itinerary] Error enriching day photos:', err);
                    }
                  })();
                } catch (err) {
                  console.error('[smart-itinerary] Error validating day:', err);
                }
              }
            }
            
            // If we have complete JSON, validate and save
            if (partial.isComplete) {
              try {
                const parsed = JSON.parse(accumulatedText);
                validatedItinerary = smartItinerarySchema.parse(parsed) as SmartItinerary;
                
                // Ensure all days were sent
                for (let i = lastSentDayIndex + 1; i < validatedItinerary.days.length; i++) {
                  sendSSE(controller, 'day', validatedItinerary.days[i]);
                }
                
                // Send tripTips if we have them
                if (validatedItinerary.tripTips && validatedItinerary.tripTips.length > 0) {
                  sendSSE(controller, 'tripTips', validatedItinerary.tripTips);
                }
                
                // Final enrichment pass for any remaining photos
                await Promise.all(validatedItinerary.days.map(async (day) => {
                  for (const slot of day.slots) {
                    for (const place of slot.places) {
                      if (!place.photos || place.photos.length === 0) {
                        const photoUrl = await findPlacePhoto(`${place.name} in ${cityOrArea}`);
                        place.photos = photoUrl ? [photoUrl] : [];
                      }
                    }
                  }
                  
                  const allPlacePhotos = day.slots.flatMap(slot => 
                    slot.places.flatMap(place => place.photos || [])
                  );
                  day.photos = allPlacePhotos.slice(0, 4);
                }));
                
                // Save to Supabase
                const { error: saveError } = await supabase
                  .from('smart_itineraries')
                  .upsert(
                    {
                      trip_id: tripId,
                      content: validatedItinerary,
                      updated_at: new Date().toISOString()
                    },
                    { onConflict: 'trip_id' },
                  );
                
                if (saveError) {
                  console.error('[smart-itinerary] Supabase upsert error', saveError);
                  sendSSE(controller, 'error', { message: 'Failed to save itinerary' });
                } else {
                  console.log('[smart-itinerary] saved itinerary row for trip', tripId);
                  
                  // Clear liked places after successful regeneration
                  if (mustIncludePlaceIds.length > 0 && userId) {
                    try {
                      await clearLikedPlacesAfterRegeneration(tripId, userId);
                      console.log('[smart-itinerary] cleared liked places after regeneration');
                    } catch (err) {
                      console.error('[smart-itinerary] error clearing liked places:', err);
                    }
                  }
                  
                  // Send final complete message
                  sendSSE(controller, 'complete', validatedItinerary);
                }
              } catch (parseError: any) {
                console.error('[smart-itinerary] Error parsing/validating final JSON:', parseError);
                sendSSE(controller, 'error', { 
                  message: 'Failed to parse itinerary',
                  details: parseError.message 
                });
              }
            }
          }
          
          // If we didn't get complete JSON, try to parse what we have
          if (!validatedItinerary && accumulatedText) {
            try {
              const parsed = JSON.parse(accumulatedText);
              validatedItinerary = smartItinerarySchema.parse(parsed) as SmartItinerary;
              
              // Enrich photos
              await Promise.all(validatedItinerary.days.map(async (day) => {
                for (const slot of day.slots) {
                  for (const place of slot.places) {
                    if (!place.photos || place.photos.length === 0) {
                      const photoUrl = await findPlacePhoto(`${place.name} in ${cityOrArea}`);
                      place.photos = photoUrl ? [photoUrl] : [];
                    }
                  }
                }
                
                const allPlacePhotos = day.slots.flatMap(slot => 
                  slot.places.flatMap(place => place.photos || [])
                );
                day.photos = allPlacePhotos.slice(0, 4);
              }));
              
              // Save
              const { error: saveError } = await supabase
                .from('smart_itineraries')
                .upsert(
                  {
                    trip_id: tripId,
                    content: validatedItinerary,
                    updated_at: new Date().toISOString()
                  },
                  { onConflict: 'trip_id' },
                );
              
              if (!saveError) {
                sendSSE(controller, 'complete', validatedItinerary);
              } else {
                sendSSE(controller, 'error', { message: 'Failed to save itinerary' });
              }
            } catch (err: any) {
              console.error('[smart-itinerary] Final parse error:', err);
              sendSSE(controller, 'error', { 
                message: 'Failed to parse itinerary',
                details: err.message 
              });
            }
          }
          
          controller.close();
        } catch (err: any) {
          console.error('[smart-itinerary] Stream error:', err);
          sendSSE(controller, 'error', { 
            message: 'Streaming error',
            details: err.message 
          });
          controller.close();
        }
      },
    });

    // Return streaming response with SSE headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
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
