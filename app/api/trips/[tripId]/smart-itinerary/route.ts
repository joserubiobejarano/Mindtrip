import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { SmartItinerary, ItinerarySlot, ItineraryPlace } from '@/types/itinerary';
import { smartItinerarySchema } from '@/types/itinerary-schema';
import { findPlacePhoto, getPlaceDetails } from '@/lib/google/places-server';
import { clearLikedPlacesAfterRegeneration } from '@/lib/supabase/explore-integration';
import { GOOGLE_MAPS_API_KEY } from '@/lib/google/places-server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getUserSubscriptionStatus } from '@/lib/supabase/user-subscription';

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

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check regeneration limits before proceeding
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Get current regeneration count for today
    const { data: statsData } = await supabase
      .from('trip_regeneration_stats')
      .select('count')
      .eq('trip_id', tripId)
      .eq('date', todayDateString)
      .maybeSingle();
    
    type StatsQueryResult = {
      count: number | null
    }

    const statsDataTyped = statsData as StatsQueryResult | null;
    const currentCount = statsDataTyped?.count || 0;
    
    // Check trip Pro status (account Pro OR trip Pro) to determine limit
    const { getTripProStatus } = await import('@/lib/supabase/pro-status');
    const { isProForThisTrip } = await getTripProStatus(supabase, userId, tripId);
    const maxRegenerationsPerDay = isProForThisTrip ? 5 : 2;
    
    // Enforce limit
    if (currentCount >= maxRegenerationsPerDay) {
      return NextResponse.json(
        {
          error: 'regeneration_limit_reached',
          maxPerDay: maxRegenerationsPerDay,
          isPro: isProForThisTrip,
          message: 'You\'ve changed this itinerary many times already today. Take a break and enjoy your trip, then try more changes tomorrow.',
        },
        { status: 429 }
      );
    }

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

    // 1. Load Trip Details (including personalization fields)
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .select('id, title, start_date, end_date, destination_name, destination_country, travelers, origin_city_name, has_accommodation, accommodation_name, accommodation_address, arrival_transport_mode, arrival_time_local, interests')
      .eq('id', tripId)
      .single();

    if (tripError || !tripData) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    type TripQueryResult = {
      id: string
      title: string
      start_date: string
      end_date: string
      destination_name: string | null
      destination_country: string | null
      travelers: number | null
      origin_city_name: string | null
      has_accommodation: boolean | null
      accommodation_name: string | null
      accommodation_address: string | null
      arrival_transport_mode: string | null
      arrival_time_local: string | null
      interests: string[] | null
    }

    const trip = tripData as TripQueryResult;

    // 2. Load existing itinerary if regenerating
    let existingItinerary: SmartItinerary | null = null;
    if (preserveStructure || mustIncludePlaceIds.length > 0) {
      const { data: existingData } = await supabase
        .from('smart_itineraries')
        .select('content')
        .eq('trip_id', tripId)
        .maybeSingle();

      type ExistingItineraryQueryResult = {
        content: any
      }

      const existingDataTyped = existingData as ExistingItineraryQueryResult | null;

      if (existingDataTyped?.content) {
        try {
          existingItinerary = existingDataTyped.content as SmartItinerary;
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
    const { data: savedPlacesData } = await supabase
      .from('saved_places')
      .select('name, types')
      .eq('trip_id', tripId)
      .limit(10);

    type SavedPlaceQueryResult = {
      name: string
      types: string[] | null
    }

    const savedPlaces = (savedPlacesData || []) as SavedPlaceQueryResult[];

    // Build personalization context string
    const personalizationContext = [
      `Number of travelers: ${trip.travelers || 1}`,
      trip.origin_city_name ? `Origin city: ${trip.origin_city_name}` : 'Origin city: unknown',
      trip.has_accommodation && trip.accommodation_name
        ? `Accommodation: ${trip.accommodation_name}${trip.accommodation_address ? ` (${trip.accommodation_address})` : ''}`
        : 'Accommodation: not booked yet',
      trip.arrival_transport_mode
        ? `Arrival: ${trip.arrival_transport_mode}${trip.arrival_time_local ? ` around ${trip.arrival_time_local}` : ''} on the first day`
        : 'Arrival: unspecified',
      trip.interests && trip.interests.length > 0
        ? `Interests: ${trip.interests.join(', ')}`
        : 'Interests: not specified',
    ].join('\n');

    const tripMeta = {
      destination: trip.destination_name || trip.title,
      dates: `${new Date(trip.start_date).toDateString()} - ${new Date(trip.end_date).toDateString()}`,
      personalization: personalizationContext,
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
         - For each slot, include exactly 4 places (4 morning, 4 afternoon, 4 evening).
         - Aim for 12 total places per day (4 per slot × 3 slots).
         - MAXIMUM: Never exceed 12 places per day (across all slots). This is a hard limit.
         - CRITICAL: Ensure places within the same time slot are geographically close (same neighborhood/area, within walking distance) to minimize backtracking and maximize time efficiency. Group places by proximity.
         - If a place is exceptional for both day and night experiences (e.g., a plaza that's beautiful during the day and has great lighting at night), you may recommend it twice - once for day and once for evening.
         - Use the "areaCluster" field for the day's main area/neighborhood.`;

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
      
      2. Trip Context & Personalization:
         - Use the following personalization information to tailor the itinerary:
           ${personalizationContext}
         - IMPORTANT: Make Day 1 realistic given the arrival time. If arrival is late (after 17:00), plan fewer activities for Day 1, focusing on evening activities and nearby places.
         - If accommodation is provided and has_accommodation is true, prioritize activities near the accommodation location, especially for the first and last day.
         - Prioritize activities that match the user's selected interests throughout the itinerary.
         - If accommodation is not booked yet, avoid specific hotel-based assumptions but you may suggest good neighborhoods to stay in.
         - Consider the number of travelers when suggesting group-friendly activities and restaurant reservations.
      
      3. Content & Writing Style:
         - Write in a warm, friendly, personal tone - like a knowledgeable friend giving recommendations, not a generic travel guide.
         - CRITICAL: The "summary" field is the most important briefing text. It must include ALL of the following information in a comprehensive, detailed paragraph (not bullet points):
           * Airport-to-city transportation: Provide EXACT details including the specific train/bus line name or number, departure station name and location, destination station name, duration, frequency, and approximate cost. Example: "From Madrid-Barajas Airport (Terminal 4), take the Cercanías C1 train (departs every 20 minutes) to Atocha Station in the city center. The journey takes approximately 30 minutes and costs around €2.60. Tickets can be purchased at the airport station or via the Renfe app."
           * Weather conditions and clothing recommendations: Describe the typical weather during the trip dates (temperature ranges, precipitation, sunshine hours) and what clothing/accessories travelers should pack. Example: "During December in Madrid, expect daytime temperatures of 8-15°C (46-59°F) with occasional rain. Pack warm layers, a waterproof jacket, comfortable walking shoes, and a scarf for the cooler evenings."
           * Seasonal activities and events: List specific events, festivals, markets, or seasonal activities happening during the trip dates. Example: "December in Madrid brings Christmas markets throughout the city, especially at Plaza Mayor and Plaza de España. The city is beautifully decorated with holiday lights, and you'll find special seasonal treats like turrón and churros con chocolate at local cafés."
           * Local holidays and festivals: Mention any public holidays, cultural celebrations, or special events during the trip dates that might affect opening hours or availability.
           * Practical city-specific tips: Include information about local customs, tipping culture, best times to visit attractions, common scams to avoid, useful apps, currency, and any other practical information that would help a first-time visitor.
           The summary should be comprehensive and provide maximum value to travelers who don't know the city.
         - In each day's "overview": Write as a series of bullet points (3-5 points), each as a complete sentence ending with a period. Each bullet point should be detailed and evocative. Include:
           * Practical micro-tips (best time to visit, ticket warnings, busy hours, what to bring)
           * Date-specific context (e.g., "During December, Christmas markets around Plaza Mayor create a magical atmosphere")
           * Seasonal considerations (weather, local events, holidays happening during the trip dates)
           * Personal recommendations and insider tips
           * What makes this day special and what travelers will see, feel, and experience
           Format: Each sentence should be a separate bullet point. The overview should be a string with sentences separated by periods, which will be displayed as bullet points.
         - In each slot's "summary" (3-6 sentences): Provide detailed, personal descriptions of what to do during this time. Be specific about:
           * The atmosphere and what makes this time special
           * Practical tips for navigating between places in this slot
           * Transportation recommendations between places (e.g., "Take subway line 10 to X station", "These places are all within walking distance", "Best to walk from Place A to Place B")
           * What travelers will experience and why it's worth doing
         - Day trip prioritization: CRITICAL - Prioritize attractions and places within the main destination city before suggesting day trips. Only suggest day trips if:
           * The trip is 4+ days long, OR
           * The main destination is very small and doesn't have enough attractions for the full trip duration
           * For any day trip suggested, you MUST include in the day's overview EXACT transportation details:
             - Exact train/bus line number or name (e.g., "Renfe Cercanías line C3", "Bus 401")
             - Departure station name and location (e.g., "From Atocha Station in central Madrid")
             - Destination station name (e.g., "to Toledo Station")
             - Duration (e.g., "approximately 35 minutes")
             - Frequency (e.g., "departs every 30 minutes")
             - Approximate cost (e.g., "around €10-15 round trip")
             Example: "Take a day trip to Toledo by catching the Renfe Cercanías C3 train from Atocha Station in central Madrid. The train departs every 30 minutes, takes approximately 35 minutes, and costs around €10-15 for a round trip ticket. Purchase tickets at Atocha Station or via the Renfe app."
         - In "tripTips", include any additional helpful tips that don't fit in the summary (optional, can be empty if all information is in summary).
         - In each place's "description" (2-4 sentences): Be specific and helpful with practical info, what makes it special, opening hours, tips, and what to expect.
         - Use "visited" = false for all places.
         - Fill "tags" with relevant keywords.
      
      3. EXACT JSON SCHEMA (you MUST return exactly this structure):
      {
        "title": string,
        "summary": string,
        "days": [
          {
            "id": string (UUID),
            "index": number (1-based, starting at 1 for the first day),
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
                            let photoUrl = await findPlacePhoto(`${place.name} in ${cityOrArea}`);
                            // Fallback: try generic city photo if place-specific photo fails
                            if (!photoUrl) {
                              photoUrl = await findPlacePhoto(`${cityOrArea} ${place.name}`);
                            }
                            // Fallback: try just the city name
                            if (!photoUrl) {
                              photoUrl = await findPlacePhoto(`${cityOrArea} city`);
                            }
                            place.photos = photoUrl ? [photoUrl] : [];
                          }
                        }
                      }
                      
                      // Set day photos
                      const allPlacePhotos = enrichedDay.slots.flatMap((slot: ItinerarySlot) => 
                        slot.places.flatMap((place: ItineraryPlace) => place.photos || [])
                      );
                      
                      // Ensure day has at least 1-2 photos even if place photos failed
                      if (allPlacePhotos.length === 0) {
                        const cityPhoto = await findPlacePhoto(`${cityOrArea} city`);
                        if (cityPhoto) {
                          enrichedDay.photos = [cityPhoto];
                        } else {
                          // Last resort: try landmark photo
                          const landmarkPhoto = await findPlacePhoto(`${cityOrArea} landmark`);
                          enrichedDay.photos = landmarkPhoto ? [landmarkPhoto] : [];
                        }
                      } else {
                        enrichedDay.photos = allPlacePhotos.slice(0, 4);
                      }
                      
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
                        let photoUrl = await findPlacePhoto(`${place.name} in ${cityOrArea}`);
                        // Fallback: try generic city photo if place-specific photo fails
                        if (!photoUrl) {
                          photoUrl = await findPlacePhoto(`${cityOrArea} ${place.name}`);
                        }
                        // Fallback: try just the city name
                        if (!photoUrl) {
                          photoUrl = await findPlacePhoto(`${cityOrArea} city`);
                        }
                        place.photos = photoUrl ? [photoUrl] : [];
                      }
                    }
                  }
                  
                  const allPlacePhotos = day.slots.flatMap((slot: ItinerarySlot) => 
                    slot.places.flatMap((place: ItineraryPlace) => place.photos || [])
                  );
                  
                  // Ensure day has at least 1-2 photos even if place photos failed
                  if (allPlacePhotos.length === 0) {
                    const cityPhoto = await findPlacePhoto(`${cityOrArea} city`);
                    if (cityPhoto) {
                      day.photos = [cityPhoto];
                    } else {
                      // Last resort: try landmark photo
                      const landmarkPhoto = await findPlacePhoto(`${cityOrArea} landmark`);
                      day.photos = landmarkPhoto ? [landmarkPhoto] : [];
                    }
                  } else {
                    day.photos = allPlacePhotos.slice(0, 4);
                  }
                }));
                
                // Save to Supabase
                const { error: saveError } = await (supabase
                  .from('smart_itineraries') as any)
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
                  
                  // Increment regeneration counter (only after successful save)
                  await (supabase
                    .from('trip_regeneration_stats') as any)
                    .upsert(
                      {
                        trip_id: tripId,
                        date: todayDateString,
                        count: currentCount + 1,
                      },
                      { onConflict: 'trip_id,date' }
                    );
                  
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
                      let photoUrl = await findPlacePhoto(`${place.name} in ${cityOrArea}`);
                      // Fallback: try generic city photo if place-specific photo fails
                      if (!photoUrl) {
                        photoUrl = await findPlacePhoto(`${cityOrArea} ${place.name}`);
                      }
                      // Fallback: try just the city name
                      if (!photoUrl) {
                        photoUrl = await findPlacePhoto(`${cityOrArea} city`);
                      }
                      place.photos = photoUrl ? [photoUrl] : [];
                    }
                  }
                }
                
                const allPlacePhotos = day.slots.flatMap((slot: ItinerarySlot) => 
                  slot.places.flatMap((place: ItineraryPlace) => place.photos || [])
                );
                
                // Ensure day has at least 1-2 photos even if place photos failed
                if (allPlacePhotos.length === 0) {
                  const cityPhoto = await findPlacePhoto(`${cityOrArea} city`);
                  if (cityPhoto) {
                    day.photos = [cityPhoto];
                  } else {
                    // Last resort: try landmark photo
                    const landmarkPhoto = await findPlacePhoto(`${cityOrArea} landmark`);
                    day.photos = landmarkPhoto ? [landmarkPhoto] : [];
                  }
                } else {
                  day.photos = allPlacePhotos.slice(0, 4);
                }
              }));
              
              // Save
              const { error: saveError } = await (supabase
                .from('smart_itineraries') as any)
                .upsert(
                  {
                    trip_id: tripId,
                    content: validatedItinerary,
                    updated_at: new Date().toISOString()
                  },
                  { onConflict: 'trip_id' },
                );
              
              if (!saveError) {
                // Increment regeneration counter (only after successful save)
                await (supabase
                  .from('trip_regeneration_stats') as any)
                  .upsert(
                    {
                      trip_id: tripId,
                      date: todayDateString,
                      count: currentCount + 1,
                    },
                    { onConflict: 'trip_id,date' }
                  );
                
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

    type ItineraryQueryResult = {
      content: any
    }

    const dataTyped = data as ItineraryQueryResult | null;

    if (!dataTyped?.content) {
      return NextResponse.json({ error: 'not-found' }, { status: 404 });
    }

    console.log('[smart-itinerary] loaded from DB:', JSON.stringify(dataTyped.content, null, 2));

    // Return bare SmartItinerary directly (data.content is already the SmartItinerary object)
    return NextResponse.json(
      dataTyped.content,
      { status: 200 }
    );
  } catch (err) {
    console.error('[smart-itinerary GET] unexpected error', err);
    return NextResponse.json({ error: 'server-error' }, { status: 500 });
  }
}
