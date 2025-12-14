import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/openai'
import { findPlacePhoto } from '@/lib/google/places-server'
import { getSmartItinerary, upsertSmartItinerary } from '@/lib/supabase/smart-itineraries-server'
import type { TripSegment } from '@/types/trip-segments'

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
  savedPlaces: Array<{ name: string; photo_url: string | null; types: string[] | null }>
): { photoUrl: string | null; goodFor: string | null } | null {
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
      .select('title, start_date, end_date, center_lat, center_lng, destination_name, destination_country')
      .eq('id', tripId)
      .single<{
        title: string;
        start_date: string;
        end_date: string;
        center_lat: number | null;
        center_lng: number | null;
        destination_name: string | null;
        destination_country: string | null;
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
      .select('name, address, lat, lng, types, photo_url')
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
      }>>();

    if (placesError) {
      console.error('Error loading saved places:', placesError)
      // Don't fail if places can't be loaded, just continue without them
    }

    // Build the prompt (use segment data if available)
    const destination = segment?.city_name || trip.destination_name || trip.title
    const country = trip.destination_country || ""
    const startDate = segment ? new Date(segment.start_date) : new Date(trip.start_date)
    const endDate = segment ? new Date(segment.end_date) : new Date(trip.end_date)
    
    // Format saved places for the prompt
    let savedPlacesText = ''
    if (savedPlaces && savedPlaces.length > 0) {
      const placesList = savedPlaces.map(p => {
        const typesStr = p.types && p.types.length > 0 ? ` (${p.types.slice(0, 2).join(', ')})` : ''
        return `- ${p.name}${p.address ? ` - ${p.address}` : ''}${typesStr}`
      }).join('\n')
      savedPlacesText = `\n\nSaved places of interest (prioritize including these in the itinerary):\n${placesList}`
    }

    const daysInfo = (days || []).map(day => {
      const date = new Date(day.date)
      return {
        date: date.toISOString().split('T')[0],
        dayNumber: day.day_number,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
        month: date.toLocaleDateString('en-US', { month: 'long' }),
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
- For each time slot (Morning, Afternoon, Evening), target at least 4 activities where feasible. This can include major sights, short stops, viewpoints, small walks, etc. Still respect realistic travel time and opening hours.
- At most 1 eating place per slot. Define "eating place" as restaurant, café, bar focused primarily on food/drinks. If needed for user preferences (e.g. foodie), keep other items nearby but do not exceed one eating place per slot.
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
    const foodKeywords = ['restaurant', 'cafe', 'café', 'bar', 'brunch', 'dining', 'bistro', 'eatery', 'food', 'meal', 'lunch', 'dinner', 'breakfast', 'tavern', 'pub', 'bakery', 'pizzeria', 'trattoria', 'tapas'];
    
    const isEatingPlace = (activity: RawActivity): boolean => {
      const nameLower = activity.name.toLowerCase();
      const descLower = activity.description.toLowerCase();
      return foodKeywords.some(keyword => nameLower.includes(keyword) || descLower.includes(keyword));
    };

    parsedResponse.days.forEach(day => {
      day.sections.forEach(section => {
        const activities = section.activities || [];
        const eatingPlaces = activities.filter(isEatingPlace);
        
        if (eatingPlaces.length > 1) {
          // Keep the first eating place
          const firstEatingPlace = eatingPlaces[0];
          const firstEatingIndex = activities.indexOf(firstEatingPlace);
          
          // Remove other eating places from this slot
          const filteredActivities = activities.filter((activity, index) => {
            if (index === firstEatingIndex) return true; // Keep first
            return !isEatingPlace(activity); // Remove other eating places
          });
          
          section.activities = filteredActivities;
        }
      });
    });

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

