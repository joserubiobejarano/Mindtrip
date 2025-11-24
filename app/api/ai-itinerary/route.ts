import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/openai'

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
  photoUrl?: string | null
  goodFor?: string | null
}

export type AiItinerary = {
  tripTitle: string
  summary: string
  days: {
    date: string
    title: string
    theme: string
    sections: {
      partOfDay: "Morning" | "Afternoon" | "Evening"
      description: string
      suggestions: (string | ActivitySuggestion)[]
      seasonalNotes?: string
    }[]
  }[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tripId } = body

    if (!tripId) {
      return NextResponse.json(
        { error: 'tripId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Load trip data
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('title, start_date, end_date, center_lat, center_lng, destination_name')
      .eq('id', tripId)
      .single()

    if (tripError || !trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      )
    }

    // Load days for the trip
    const { data: days, error: daysError } = await supabase
      .from('days')
      .select('id, date, day_number')
      .eq('trip_id', tripId)
      .order('date', { ascending: true })

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
      .limit(20) // Limit to avoid too much context

    if (placesError) {
      console.error('Error loading saved places:', placesError)
      // Don't fail if places can't be loaded, just continue without them
    }

    // Build the prompt
    const destination = trip.destination_name || trip.title
    const startDate = new Date(trip.start_date)
    const endDate = new Date(trip.end_date)
    
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

    const prompt = `You are helping create a smart itinerary for MindTrip, a travel planning application.

Trip Details:
- Destination: ${destination}
- Trip dates: ${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} to ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
- Number of days: ${days?.length || 0}${savedPlacesText}

Days to plan:
${daysInfo.map(d => `- Day ${d.dayNumber}: ${d.dayOfWeek}, ${d.month} ${d.day}, ${d.year} (${d.date})`).join('\n')}

Please create a comprehensive itinerary that:
1. Takes into account the actual dates (season, weekends, holidays, local events like Christmas markets, festivals, etc.)
2. Uses the destination city "${destination}" to anchor recommendations
3. Prioritizes incorporating the saved places listed above - try to include as many as possible in the day-by-day itinerary, organizing them logically by location and timing
4. Avoids booking links or specific booking recommendations - just give ideas and context
5. Provides realistic timing and themes for each day
6. Includes seasonal considerations (weather, local events, etc.)

Return a JSON object with this exact structure:
{
  "tripTitle": "A descriptive title for this trip",
  "summary": "A 2-3 sentence overview of the trip",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "title": "Day title (e.g., 'Arrival and City Exploration')",
      "theme": "Theme for the day (e.g., 'Cultural Immersion', 'Nature & Relaxation')",
      "sections": [
        {
          "partOfDay": "Morning" | "Afternoon" | "Evening",
          "description": "A paragraph describing what to do during this part of the day",
          "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
          "seasonalNotes": "Optional note about seasonal considerations"
        }
      ]
    }
  ]
}

Make sure each day has sections for Morning, Afternoon, and Evening. Be creative but realistic.`

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
    // GPT returns suggestions as strings, we'll enrich them below
    type RawAiItinerary = {
      tripTitle: string
      summary: string
      days: {
        date: string
        title: string
        theme: string
        sections: {
          partOfDay: "Morning" | "Afternoon" | "Evening"
          description: string
          suggestions: string[]
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

    // Enrich suggestions with photoUrl and goodFor by matching to saved places
    const enrichedItinerary: AiItinerary = {
      ...parsedResponse,
      days: parsedResponse.days.map(day => ({
        ...day,
        sections: day.sections.map(section => ({
          ...section,
          suggestions: section.suggestions.map(suggestion => {
            // Try to match the suggestion string to a saved place
            const match = matchSuggestionToSavedPlace(suggestion, savedPlaces || [])
            
            if (match) {
              return {
                title: suggestion,
                photoUrl: match.photoUrl,
                goodFor: match.goodFor,
              } as ActivitySuggestion
            }
            
            // If no match, return as string (backward compatible)
            return suggestion
          }),
        })),
      })),
    }

    return NextResponse.json({ itinerary: enrichedItinerary })
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

