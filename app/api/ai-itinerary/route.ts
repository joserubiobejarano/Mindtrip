import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/openai'
import { findPlacePhoto, getCityFromLatLng, isLandmark } from '@/lib/google/places-server'
import { resolvePlacePhotoSrc } from '@/lib/placePhotos' // Import resolvePlacePhotoSrc
import { getSmartItinerary, upsertSmartItinerary } from '@/lib/supabase/smart-itineraries-server'
import type { TripSegment } from '@/types/trip-segments'

interface TripDetails {
  title: string;
  start_date: string;
  end_date: string;
  center_lat: number | null;
  center_lng: number | null;
  destination_name: string | null;
  destination_country: string | null;
  destination_city: string | null;
}

/**
 * Get a human-readable "good for" label based on place types
 * Reused from Explore tab
 */
function getGoodForLabel(types: string[] | null | undefined): string | null {
  if (!types || types.length === 0) return null

  const t = types

  if (t.includes("park") || t.includes("tourist_attraction")) {
    return "Ideal if you like parks and nature"
  }
  if (t.includes("museum") || t.includes("art_gallery")) {
    return "Ideal if you enjoy art and museums"
  }
  if (t.includes("restaurant") || t.includes("cafe")) {
    return "Great if you love food spots"
  }
  if (t.includes("bar") || t.includes("night_club")) {
    return "Nice if you like nightlife"
  }
  if (t.includes("shopping_mall") || t.includes("store")) {
    return "Perfect if you like shopping"
  }

  return null
}

/**
 * Match a suggestion string to a saved place by name (case-insensitive)
 */
function matchSuggestionToSavedPlace(
  suggestion: string,
  savedPlaces: Array<{ name: string; photo_url: string | null; types: string[] | null; place_id: string | null }>
): { photoUrl: string | null; goodFor: string | null; placeId: string | null } | null {
  if (!savedPlaces || savedPlaces.length === 0) return null

  const suggestionLower = suggestion.toLowerCase().trim()
  
  // Try to find a match by name (case-insensitive)
  const matchedPlace = savedPlaces.find(place => {
    const placeNameLower = place.name.toLowerCase().trim()
    // Check if suggestion contains the place name or vice versa
    return suggestionLower.includes(placeNameLower) || placeNameLower.includes(suggestionLower)
  })

  if (!matchedPlace) return null

  return {
    photoUrl: matchedPlace.photo_url,
    goodFor: getGoodForLabel(matchedPlace.types),
    placeId: matchedPlace.place_id,
  }
}

// IMPORTANT: Set OPENAI_API_KEY in your .env.local file and in Vercel environment variables
// This key is only used on the server and never exposed to the client

export type ActivitySuggestion = {
  title: string
  description?: string
  photoUrl?: string | null
  goodFor?: string | null
  placeId?: string | null
  alreadyVisited?: boolean
}

export type AiItinerary = {
  tripTitle: string
  summary: string
  days: {
    date: string
    title: string
    theme: string
    summary: string
    heroImages: string[]
    sections: {
      partOfDay: "Morning" | "Afternoon" | "Evening"
      label?: string
      description: string
      activities?: ActivitySuggestion[]
      suggestions?: (string | ActivitySuggestion)[]
      seasonalNotes?: string
    }[]
  }[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tripId, trip_segment_id } = body

    if (!tripId) {
      return NextResponse.json(
        { error: 'tripId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if smart itinerary already exists (segment-scoped if trip_segment_id provided)
    let existingItinerary = null;
    if (trip_segment_id) {
      const { data: segmentItinerary } = await supabase
        .from('smart_itineraries')
        .select('content')
        .eq('trip_id', tripId)
        .eq('trip_segment_id', trip_segment_id)
        .maybeSingle<{ content: any }>();
      existingItinerary = segmentItinerary?.content as AiItinerary | null;
    } else {
      const { data: tripItinerary } = await getSmartItinerary(tripId);
      existingItinerary = tripItinerary;
    }
    
    if (existingItinerary) {
      return NextResponse.json({ itinerary: existingItinerary, fromCache: true })
    }

    // Load trip data
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('title, start_date, end_date, center_lat, center_lng, destination_name, destination_country, destination_city')
      .eq('id', tripId)
      .single<{
        title: string;
        start_date: string;
        end_date: string;
        center_lat: number | null;
        center_lng: number | null;
        destination_name: string | null;
        destination_country: string | null;
        destination_city: string | null;
      }>()

    if (tripError || !trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      )
    }

    // Load segment data if trip_segment_id provided
    let segment: TripSegment | null = null;
    if (trip_segment_id) {
      const { data: segmentData } = await supabase
        .from('trip_segments')
        .select('*')
        .eq('id', trip_segment_id)
        .eq('trip_id', tripId)
        .single<TripSegment>();
      segment = segmentData;
    }

    // Load days for the trip (filtered by segment if provided)
    let daysQuery = supabase
      .from('days')
      .select('id, date, day_number')
      .eq('trip_id', tripId);
    
    if (trip_segment_id) {
      daysQuery = daysQuery.eq('trip_segment_id', trip_segment_id);
    } else {
      // For trip-level, get days without segment (legacy single-city trips)
      daysQuery = daysQuery.is('trip_segment_id', null);
    }
    
    const { data: days, error: daysError } = await daysQuery
      .order('date', { ascending: true })
      .returns<Array<{
        id: string;
        date: string;
        day_number: number;
      }>>();

    if (daysError) {
      console.error('Error loading days:', daysError)
      return NextResponse.json(
        { error: 'Failed to load trip days' },
        { status: 500 }
      )
    }

    // Load saved places for the trip (from saved_places table)
    const { data: savedPlaces, error: placesError } = await supabase
      .from('saved_places')
      .select('name, address, lat, lng, types, photo_url, place_id')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })
      .limit(20)
      .returns<Array<{
        name: string;
        address: string | null;
        lat: number | null;
        lng: number | null;
        types: string[] | null;
        photo_url: string | null;
        place_id: string | null;
      }>>();

    if (placesError) {
      console.error('Error loading saved places:', placesError)
      // Don't fail if places can't be loaded, just continue without them
    }

    // Build the prompt (use segment data if available)
    // Determine the primary destination for the prompt
    let primaryDestination = trip.destination_city || trip.destination_name || trip.title;
    let resolvedCity = trip.destination_city;

    // If primaryDestination is a landmark and no city is resolved, attempt to reverse geocode
    if (!resolvedCity && trip.center_lat && trip.center_lng && (await isLandmark(primaryDestination))) {
      const cityFromLatLng = await getCityFromLatLng(trip.center_lat, trip.center_lng);
      if (cityFromLatLng) {
        resolvedCity = cityFromLatLng;
        primaryDestination = cityFromLatLng; // Use the resolved city as the primary destination
        // Update the trip with the resolved city
        // @ts-expect-error - destination_city exists in schema but types may not be updated
        await supabase.from('trips').update({ destination_city: cityFromLatLng }).eq('id', tripId);
      }
    }

    // Set destination and country for the prompt
    const destination = segment?.city_name || primaryDestination;
    const country = trip.destination_country || "";
    const startDate = segment ? new Date(segment.start_date) : new Date(trip.start_date);
    const endDate = segment ? new Date(segment.end_date) : new Date(trip.end_date);
    
    // Format saved places for the prompt
    let savedPlacesText = ''
    if (savedPlaces && savedPlaces.length > 0) {
      const placesList = savedPlaces.map(p => {
        const typesStr = p.types && p.types.length > 0 ? ` (${p.types.slice(0, 2).join(', ')})` : ''
        return `- ${p.name}${p.address ? ` - ${p.address}` : ''}${typesStr}`
      }).join('\n')
      savedPlacesText = `

Saved places of interest (prioritize including these in the itinerary):
${placesList}`
    }

    const daysInfo = (days || []).map(day => {
      const date = new Date(day.date)
      return {
        date: date.toISOString().split('T')[0],
        dayNumber: day.day_number,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
        month: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        day: date.getDate(),
        year: date.getFullYear(),
      }
    })

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
- **Hard Constraint**: If the trip is 2 or more days, it *must* include at least 3 different areas/neighborhoods of the city. If the trip is 1 day, it *must* include at least 2 different areas/neighborhoods.
- **Hard Constraint**: Must include category diversity. Each day must feature activities from at least 4 different categories from this list: sightseeing, food, park/nature, culture, viewpoint, local streets/market.
- **Hard Constraint**: No single Point of Interest (POI) can appear in more than 1 activity block per day (e.g., if a museum is visited in the morning, it cannot be visited again in the afternoon or evening of the same day). Exceptions for distinctly different experiences (e.g. day/night visit to a major landmark) must be explicitly justified in the activity description.
- For each time slot (Morning, Afternoon, Evening), target at least 4-6 activities where feasible. This can include major sights, short stops, viewpoints, small walks, etc. Still respect realistic travel time and opening hours.
- Use the destination city "${destination}" to anchor recommendations, but ensure variety across daily activities rather than dominating with a single "trip title" landmark.
- Prioritize incorporating the saved places listed above - try to include as many as possible in the day-by-day itinerary, organizing them logically by location and timing.
- Avoid adding the exact same place or landmark more than once to the itinerary, UNLESS it is a significant landmark that offers a distinctly different experience at different times (e.g., day vs. night visit).
- When a place is suggested multiple times (e.g., a restaurant for lunch and dinner), pick the most suitable slot and do not duplicate. If a place must be visited multiple times, make sure the activity description for each visit is unique and highlights the different experience.
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

Make sure each day has sections for Morning, Afternoon, and Evening with approximately 4 activities per slot (12+ activities per day). Be creative but realistic.`

    // Call OpenAI
    const openai = getOpenAIClient()
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
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    type RawActivity = {
      name: string
      description: string
      placeId: string | null
      alreadyVisited: boolean
    }

    type RawAiItinerary = {
      tripTitle: string
      summary: string
      days: {
        date: string
        title: string
        theme: string
        summary: string
        heroImages: string[]
        sections: {
          label: string
          description: string
          activities: RawActivity[]
          seasonalNotes?: string
        }[]
      }[]
    }

    let parsedResponse: RawAiItinerary
    try {
      const parsed = JSON.parse(responseContent)
      // Handle case where response might be wrapped in an object
      parsedResponse = parsed.itinerary || parsed
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      console.error('Response content:', responseContent)
      throw new Error('Failed to parse OpenAI response as JSON')
    }

    // Validate structure
    if (!parsedResponse.tripTitle || !parsedResponse.summary || !Array.isArray(parsedResponse.days)) {
      throw new Error('Invalid itinerary structure from OpenAI')
    }

    // Post-process: Enforce food place cap (max 1 per slot)
    // Improved food place detection function
    const isFoodPlace = (activity: RawActivity, types?: string[] | null): boolean => {
      // Check Google Places types first (most reliable)
      if (types && Array.isArray(types)) {
        const foodTypes = [
          'restaurant', 'cafe', 'bakery', 'bar', 'food', 'meal_takeaway', 'meal_delivery',
          'cafe', 'bakery', 'bar', 'night_club', 'liquor_store', 'store', 'supermarket'
        ];
        if (types.some(type => foodTypes.includes(type))) {
          return true;
        }
      }
      
      // Fallback to keyword matching in name/description
      const foodKeywords = [
        'restaurant', 'cafe', 'café', 'bar', 'brunch', 'dining', 'bistro', 'eatery',
        'food', 'meal', 'lunch', 'dinner', 'breakfast', 'tavern', 'pub', 'bakery',
        'pizzeria', 'trattoria', 'tapas', 'taverna', 'ristorante', 'osteria', 'cantina',
        'food court', 'food market', 'market', 'deli', 'deli', 'sandwich', 'burger',
        'steakhouse', 'seafood', 'sushi', 'ramen', 'noodle', 'pasta', 'pizza'
      ];
      
      const nameLower = activity.name.toLowerCase();
      const descLower = activity.description.toLowerCase();
      return foodKeywords.some(keyword => nameLower.includes(keyword) || descLower.includes(keyword));
    };

    parsedResponse.days.forEach(day => {
      day.sections.forEach(section => {
        const activities = section.activities || [];
        // Note: At this point, activities don't have types yet, so we use keyword matching
        // Types will be available after place details are fetched
        const eatingPlaces = activities.filter(activity => isFoodPlace(activity));
        
        if (eatingPlaces.length > 1) {
          // Keep the first eating place (we don't have rating info at this stage)
          // In a future enhancement, we could fetch place details here to get ratings
          const firstEatingPlace = eatingPlaces[0];
          const firstEatingIndex = activities.indexOf(firstEatingPlace);
          
          // Remove other eating places from this slot
          const filteredActivities = activities.filter((activity, index) => {
            if (index === firstEatingIndex) return true; // Keep first
            return !isFoodPlace(activity); // Remove other eating places
          });
          
          section.activities = filteredActivities;
          
          // Log removed food places for debugging
          if (process.env.NODE_ENV === 'development') {
            console.log(`[ai-itinerary] Removed ${eatingPlaces.length - 1} food place(s) from ${day.date} ${section.label}, kept: ${firstEatingPlace.name}`);
          }
        }
      });
    });

    // Initialize sets for deduplication within the current itinerary generation
    const usedImageUrls = new Set<string>();
    const usedPlaceIds = new Set<string>();

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
          // Pass deduplication sets when finding hero images
          return await findPlacePhoto(query, { usedImageUrls, usedPlaceIds, placeId: null, allowDedupedFallback: true, destinationCity: destination });
        })
      );

      const enrichedSections = await Promise.all(day.sections.map(async (section) => {
        const partOfDay = section.label as "Morning" | "Afternoon" | "Evening";
        
        const enrichedActivities = await Promise.all(section.activities.map(async (activity, aIndex) => {
          // Try to match with saved place first
          let match = matchSuggestionToSavedPlace(activity.name, savedPlaces || []);
          let photoUrl = match?.photoUrl;
          let activityPlaceId = match?.placeId || activity.placeId;
          
          // If no photo from saved place, try Google Places
          if (!photoUrl) {
             const query = `${activity.name} in ${destination}${country ? `, ${country}` : ''}`;
             // Pass deduplication sets and placeId to resolvePlacePhotoSrc
             photoUrl = await findPlacePhoto(query, { usedImageUrls, usedPlaceIds, placeId: activityPlaceId, allowDedupedFallback: true, destinationCity: destination });
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
              place_id: activityPlaceId, // Save the resolved placeId
            });
          }

          return {
            title: activity.name,
            description: activity.description,
            photoUrl: photoUrl,
            goodFor: match?.goodFor,
            placeId: activityPlaceId, // Return the resolved placeId
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

    // Save enriched itinerary JSON to smart_itineraries table
    const { error: saveError } = await upsertSmartItinerary(tripId, enrichedItinerary, trip_segment_id);
    if (saveError) {
      console.error('Error saving smart itinerary:', saveError);
      // Continue even if save fails - we still return the itinerary
    }

    // Insert activities into DB
    // First, clear existing auto-generated activities? 
    // The prompt says "Do not delete existing activities automatically when mounting".
    // But here we are generating new ones. If user requested generation, maybe they want to overwrite?
    // "After activities are loaded, if activities.length === 0 ... then call".
    // So we assume it's empty. If not empty, we append.
    if (activitiesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('activities')
        // @ts-ignore - Supabase type inference fails here, but the types are correct at runtime
        .insert(activitiesToInsert);
      
      if (insertError) {
        console.error("Error inserting generated activities:", insertError);
      }
    }

    return NextResponse.json({ itinerary: enrichedItinerary, fromCache: false })
  } catch (error) {
    console.error('Error in /api/ai-itinerary:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

