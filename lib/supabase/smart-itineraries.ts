import { createClient } from "@/lib/supabase/server";
import type { AiItinerary, ActivitySuggestion } from "@/app/api/ai-itinerary/route";
import { getOpenAIClient } from "@/lib/openai";
import { findPlacePhoto } from "@/lib/google/places-server";

/**
 * Get the smart itinerary for a trip
 */
export async function getSmartItinerary(
  tripId: string
): Promise<{ data: AiItinerary | null; error: Error | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("smart_itineraries")
      .select("content")
      .eq("trip_id", tripId)
      .maybeSingle();

    if (error) {
      return { data: null, error: error as Error };
    }

    return { data: data?.content as AiItinerary | null, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Upsert (insert or update) the smart itinerary for a trip
 */
export async function upsertSmartItinerary(
  tripId: string,
  content: AiItinerary
): Promise<{ error: Error | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("smart_itineraries")
      .upsert(
        {
          trip_id: tripId,
          content: content as any,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "trip_id",
        }
      );

    if (error) {
      return { error: error as Error };
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Get a human-readable "good for" label based on place types
 */
function getGoodForLabel(types: string[] | null | undefined): string | null {
  if (!types || types.length === 0) return null;

  const t = types;

  if (t.includes("park") || t.includes("tourist_attraction")) {
    return "Ideal if you like parks and nature";
  }
  if (t.includes("museum") || t.includes("art_gallery")) {
    return "Ideal if you enjoy art and museums";
  }
  if (t.includes("restaurant") || t.includes("cafe")) {
    return "Great if you love food spots";
  }
  if (t.includes("bar") || t.includes("night_club")) {
    return "Nice if you like nightlife";
  }
  if (t.includes("shopping_mall") || t.includes("store")) {
    return "Perfect if you like shopping";
  }

  return null;
}

/**
 * Match a suggestion string to a saved place by name (case-insensitive)
 */
function matchSuggestionToSavedPlace(
  suggestion: string,
  savedPlaces: Array<{ name: string; photo_url: string | null; types: string[] | null }>
): { photoUrl: string | null; goodFor: string | null } | null {
  if (!savedPlaces || savedPlaces.length === 0) return null;

  const suggestionLower = suggestion.toLowerCase().trim();
  
  // Try to find a match by name (case-insensitive)
  const matchedPlace = savedPlaces.find(place => {
    const placeNameLower = place.name.toLowerCase().trim();
    // Check if suggestion contains the place name or vice versa
    return suggestionLower.includes(placeNameLower) || placeNameLower.includes(suggestionLower);
  });

  if (!matchedPlace) return null;

  return {
    photoUrl: matchedPlace.photo_url,
    goodFor: getGoodForLabel(matchedPlace.types),
  };
}

/**
 * Generate a smart itinerary using OpenAI
 */
export async function generateSmartItineraryWithOpenAI(
  tripId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<AiItinerary> {
  // Load trip data
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('title, start_date, end_date, center_lat, center_lng, destination_name, destination_country')
    .eq('id', tripId)
    .single();

  if (tripError || !trip) {
    throw new Error('Trip not found');
  }

  // Load days for the trip
  const { data: days, error: daysError } = await supabase
    .from('days')
    .select('id, date, day_number')
    .eq('trip_id', tripId)
    .order('date', { ascending: true });

  if (daysError) {
    throw new Error('Failed to load trip days');
  }

  // Load saved places for the trip (from saved_places table)
  const { data: savedPlaces, error: placesError } = await supabase
    .from('saved_places')
    .select('name, address, lat, lng, types, photo_url')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false })
    .limit(20); // Limit to avoid too much context

  if (placesError) {
    console.error('Error loading saved places:', placesError);
    // Don't fail if places can't be loaded, just continue without them
  }

  // Build the prompt
  const destination = trip.destination_name || trip.title;
  const country = trip.destination_country || "";
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  
  // Format saved places for the prompt
  let savedPlacesText = '';
  if (savedPlaces && savedPlaces.length > 0) {
    const placesList = savedPlaces.map(p => {
      const typesStr = p.types && p.types.length > 0 ? ` (${p.types.slice(0, 2).join(', ')})` : '';
      return `- ${p.name}${p.address ? ` - ${p.address}` : ''}${typesStr}`;
    }).join('\n');
    savedPlacesText = `\n\nSaved places of interest (prioritize including these in the itinerary):\n${placesList}`;
  }

  const daysInfo = (days || []).map(day => {
    const date = new Date(day.date);
    return {
      date: date.toISOString().split('T')[0],
      dayNumber: day.day_number,
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
      month: date.toLocaleDateString('en-US', { month: 'long' }),
      day: date.getDate(),
      year: date.getFullYear(),
    };
  });

  const prompt = `You are an expert travel planner. Create a detailed, story-like itinerary in JSON format.

Trip Details:
- Destination: ${destination}
- Trip dates: ${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} to ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
- Number of days: ${days?.length || 0}${savedPlacesText}

Days to plan:
${daysInfo.map(d => `- Day ${d.dayNumber}: ${d.dayOfWeek}, ${d.month} ${d.day}, ${d.year} (${d.date})`).join('\n')}

Requirements:
- 1 entry per day of the trip.
- Each day has:
    - "title": short name for the day.
    - "date": ISO date string (YYYY-MM-DD).
    - "theme": short label like "Cultural Immersion" or "Food & Markets".
    - "summary": 3-5 sentences describing the day in depth (tone: friendly, vivid, like a travel blog).
    - "heroImages": 4-6 photo search terms for that day (for a horizontal gallery), e.g. ["Madrid Royal Palace", "Retiro Park Madrid", "Tapas bar Madrid"].
    - "sections": morning / afternoon / evening. Each section has:
         - "label": "Morning", "Afternoon", or "Evening"
         - "description": 3-4 sentences describing what to do during this part of the day
         - "activities": array of activities. Each activity has:
              - "name": activity name
              - "description": 2-3 sentences with practical info (opening hours, tips, what to expect)
              - "placeId": null (always null for now)
              - "alreadyVisited": false (always false for now)
- Take into account the actual dates (season, weekends, holidays, local events like Christmas markets, festivals, etc.)
- Use the destination city "${destination}" to anchor recommendations
- Prioritize incorporating the saved places listed above - try to include as many as possible in the day-by-day itinerary, organizing them logically by location and timing
- Avoid booking links or specific booking recommendations - just give ideas and context
- Provide realistic timing and themes for each day
- Include seasonal considerations (weather, local events, etc.)
- Make the text rich, descriptive, and engaging - like a travel blog post

Return ONLY valid JSON with this exact structure:
{
  "tripTitle": "A descriptive title for this trip",
  "summary": "A 2-3 sentence overview of the trip",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "title": "Day title (e.g., 'Arrival and City Exploration')",
      "theme": "Theme for the day (e.g., 'Cultural Immersion', 'Nature & Relaxation')",
      "summary": "3-5 sentences describing the day in depth, friendly and vivid tone",
      "heroImages": ["Photo search term 1", "Photo search term 2", "Photo search term 3", "Photo search term 4"],
      "sections": [
        {
          "label": "Morning",
          "description": "3-4 sentences describing what to do during this part of the day",
          "activities": [
            {
              "name": "Activity name",
              "description": "2-3 sentences with practical info",
              "placeId": null,
              "alreadyVisited": false
            }
          ],
          "seasonalNotes": "Optional note about seasonal considerations"
        }
      ]
    }
  ]
}

Make sure each day has sections for Morning, Afternoon, and Evening with 4-6 activities total per day. Be creative but realistic.`;

  // Call OpenAI
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful travel planning assistant. Always return valid JSON matching the exact structure requested. No markdown formatting, just pure JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const responseContent = completion.choices[0]?.message?.content;
  if (!responseContent) {
    throw new Error('No response from OpenAI');
  }

  // Parse the JSON response
  type RawActivity = {
    name: string;
    description: string;
    placeId: string | null;
    alreadyVisited: boolean;
  };

  type RawAiItinerary = {
    tripTitle: string;
    summary: string;
    days: {
      date: string;
      title: string;
      theme: string;
      summary: string;
      heroImages: string[];
      sections: {
        label: string;
        description: string;
        activities: RawActivity[];
        seasonalNotes?: string;
      }[];
    }[];
  };

  let parsedResponse: RawAiItinerary;
  try {
    const parsed = JSON.parse(responseContent);
    // Handle case where response might be wrapped in an object
    parsedResponse = parsed.itinerary || parsed;
  } catch (parseError) {
    console.error('Error parsing OpenAI response:', parseError);
    console.error('Response content:', responseContent);
    throw new Error('Failed to parse OpenAI response as JSON');
  }

  // Validate structure
  if (!parsedResponse.tripTitle || !parsedResponse.summary || !Array.isArray(parsedResponse.days)) {
    throw new Error('Invalid itinerary structure from OpenAI');
  }

  // Process itinerary: Fetch photos and prepare activities for insertion
  const activitiesToInsert: any[] = [];
  let globalOrderCounter = 0;
  
  const enrichedDays = await Promise.all(parsedResponse.days.map(async (day, index) => {
    // Find matching DB day
    const dbDay = days?.find(d => d.date === day.date) || days?.[index];
    
    // Fetch photos for hero images
    const heroPhotoUrls = await Promise.all(
      (day.heroImages || []).slice(0, 6).map(async (searchTerm) => {
        const query = `${searchTerm} in ${destination}${country ? `, ${country}` : ''}`;
        return await findPlacePhoto(query);
      })
    );

    const enrichedSections = await Promise.all(day.sections.map(async (section) => {
      const partOfDay = section.label as "Morning" | "Afternoon" | "Evening";
      
      const enrichedActivities = await Promise.all(section.activities.map(async (activity, aIndex) => {
        // Try to match with saved place first
        let match = matchSuggestionToSavedPlace(activity.name, savedPlaces || []);
        let photoUrl = match?.photoUrl;
        
        // If no photo from saved place, try Google Places
        if (!photoUrl) {
           const query = `${activity.name} in ${destination}${country ? `, ${country}` : ''}`;
           photoUrl = await findPlacePhoto(query);
        }

        // Prepare activity record
        if (dbDay) {
          let startTime = "09:00";
          let endTime = "12:00";
          
          if (partOfDay === "Afternoon") {
            startTime = "13:00";
            endTime = "17:00";
          } else if (partOfDay === "Evening") {
            startTime = "18:00";
            endTime = "21:00";
          }

          activitiesToInsert.push({
            trip_id: tripId,
            day_id: dbDay.id,
            title: activity.name,
            start_time: startTime,
            end_time: endTime,
            photo_url: photoUrl,
            order_number: globalOrderCounter++,
          });
        }

        return {
          title: activity.name,
          description: activity.description,
          photoUrl: photoUrl,
          goodFor: match?.goodFor,
          placeId: activity.placeId,
          alreadyVisited: activity.alreadyVisited || false,
        } as ActivitySuggestion;
      }));

      return {
        partOfDay: partOfDay,
        label: section.label,
        description: section.description,
        activities: enrichedActivities,
        seasonalNotes: section.seasonalNotes,
      };
    }));

    return {
      ...day,
      heroImages: heroPhotoUrls.filter(url => url !== null) as string[],
      sections: enrichedSections,
    };
  }));

  const enrichedItinerary: AiItinerary = {
    ...parsedResponse,
    days: enrichedDays,
  };

  // Insert activities into DB (only if no activities exist)
  if (activitiesToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('activities')
      .insert(activitiesToInsert);
    
    if (insertError) {
      console.error("Error inserting generated activities:", insertError);
      // Don't throw - we still want to return the itinerary
    }
  }

  return enrichedItinerary;
}

/**
 * Get or create a smart itinerary for a trip
 * Returns existing itinerary if found, otherwise generates a new one
 */
export async function getOrCreateSmartItinerary(
  tripId: string,
  options?: { forceRegenerate?: boolean }
): Promise<{ itinerary: AiItinerary; fromCache: boolean }> {
  const supabase = await createClient();
  const forceRegenerate = options?.forceRegenerate ?? false;

  // 1) If not forcing regenerate, try to fetch existing itinerary
  if (!forceRegenerate) {
    const { data: existing, error: existingError } = await supabase
      .from("smart_itineraries")
      .select("id, content")
      .eq("trip_id", tripId)
      .maybeSingle();

    // if we got something, just return it
    if (existing && !existingError) {
      return { itinerary: existing.content as AiItinerary, fromCache: true };
    }
  }

  // 2) No itinerary yet or forceRegenerate === true -> generate a new one with OpenAI
  const itineraryJson = await generateSmartItineraryWithOpenAI(tripId, supabase);

  // 3) Upsert into smart_itineraries (one per trip)
  const { data: upserted, error: upsertError } = await supabase
    .from("smart_itineraries")
    .upsert(
      {
        trip_id: tripId,
        content: itineraryJson as any,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "trip_id",
      }
    )
    .select("content")
    .single();

  if (upsertError) {
    console.error("Error saving smart itinerary", upsertError);
    throw upsertError;
  }

  return { itinerary: upserted.content as AiItinerary, fromCache: false };
}

