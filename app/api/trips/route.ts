import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfileId } from "@/lib/auth/getProfileId";
import { getProfileIdFromRequest } from "@/lib/auth/getProfileIdFromRequest";
import { getUserSubscriptionStatus } from "@/lib/supabase/user-subscription";
import { createTripSegment } from "@/lib/supabase/trip-segments";
import { getPlaceDetails, findGooglePlaceId, GOOGLE_MAPS_API_KEY } from "@/lib/google/places-server";
import { eachDayOfInterval, format, addDays } from "date-fns";
import type { TripPersonalizationPayload } from "@/types/trip-personalization";

interface NewTripPayload {
  destinationPlaceId: string;
  destinationName?: string;
  destinationCenter?: [number, number];
  startDate: string;
  endDate: string;
  travelers?: number;
  segments?: Array<{
    cityPlaceId: string;
    cityName: string;
    nights: number;
  }>;
  personalization?: TripPersonalizationPayload;
}

export async function POST(request: NextRequest) {
  let profileId: string | undefined;
  
  try {
    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Trips API]', {
        path: '/api/trips',
        method: 'POST',
        error: authError?.message || 'Failed to get profile',
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: NewTripPayload = await request.json();
    const { destinationPlaceId, destinationName, destinationCenter, startDate, endDate, segments, personalization } = body;

    // Extract personalization data with defaults
    const {
      travelers = 1,
      originCityPlaceId,
      originCityName,
      hasAccommodation = false,
      accommodationPlaceId,
      accommodationName,
      accommodationAddress,
      arrivalTransportMode,
      arrivalTimeLocal,
      interests = [],
    } = personalization ?? {};

    if (!destinationPlaceId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "destinationPlaceId, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    // Check subscription status
    // Note: getUserSubscriptionStatus expects clerkUserId
    const authResult = await getProfileId(supabase);
    const { isPro } = await getUserSubscriptionStatus(authResult.clerkUserId);

    // Enforce trip limit for free users
    const FREE_TRIP_LIMIT = 1;
    if (!isPro) {
      // Count existing trips owned by this user
      const { count: tripCount, error: countError } = await supabase
        .from("trips")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", profileId);

      if (countError) {
        console.error('[Trips API] Error counting trips:', {
          profileId,
          error: countError.message,
        });
        return NextResponse.json(
          { error: "Failed to check trip limit" },
          { status: 500 }
        );
      }

      if ((tripCount || 0) >= FREE_TRIP_LIMIT) {
        return NextResponse.json(
          { 
            error: "trip_limit_reached",
            message: "Free users can only create 1 trip. Upgrade to Pro to create unlimited trips.",
          },
          { status: 403 }
        );
      }

      // Enforce trip duration limit for free users (4 days max)
      const FREE_TRIP_MAX_DAYS = 4;
      const tripStart = new Date(startDate);
      const tripEnd = new Date(endDate);
      const diffTime = tripEnd.getTime() - tripStart.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days

      if (diffDays > FREE_TRIP_MAX_DAYS) {
        return NextResponse.json(
          { 
            error: "trip_duration_limit_reached",
            message: "Free users are only allowed to create trips up to 4 days. Please select dates within that range or upgrade to Pro to create longer trips.",
          },
          { status: 403 }
        );
      }
    }

    // Determine segments to create
    let segmentsToCreate: Array<{
      cityPlaceId: string;
      cityName: string;
      startDate: string;
      endDate: string;
    }> = [];

    if (isPro && segments && segments.length > 0) {
      // Multi-city trip: compute dates from nights
      const tripStart = new Date(startDate);
      let currentDate = tripStart;

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const segmentStart = new Date(currentDate);
        const segmentEnd = addDays(segmentStart, segment.nights - 1);

        segmentsToCreate.push({
          cityPlaceId: segment.cityPlaceId,
          cityName: segment.cityName,
          startDate: format(segmentStart, "yyyy-MM-dd"),
          endDate: format(segmentEnd, "yyyy-MM-dd"),
        });

        // Next segment starts the day after this one ends
        currentDate = addDays(segmentEnd, 1);
      }
    } else {
      // Single-city trip: use destinationPlaceId and full date range
      let googlePlaceId: string | null = null;
      let cityName = destinationName || "Unknown City";
      let placeDetails: any = null;
      
      // Use the place name to find Google Place ID
      if (destinationName) {
        // Use coordinates if available for better accuracy
        if (destinationCenter && destinationCenter.length === 2) {
          googlePlaceId = await findGooglePlaceId(destinationName, destinationCenter[1], destinationCenter[0]);
        } else {
          googlePlaceId = await findGooglePlaceId(destinationName);
        }
        
        if (googlePlaceId) {
          placeDetails = await getPlaceDetails(googlePlaceId);
          cityName = placeDetails?.name || destinationName;
        }
      } else {
        // Fallback: try to use destinationPlaceId as Google Place ID (in case it's already a Google ID)
        placeDetails = await getPlaceDetails(destinationPlaceId);
        if (placeDetails) {
          cityName = placeDetails.name;
          googlePlaceId = destinationPlaceId;
        }
      }

      segmentsToCreate = [
        {
          cityPlaceId: googlePlaceId || destinationPlaceId,
          cityName,
          startDate,
          endDate,
        },
      ];
    }

    // Get primary city details for trip title
    const primaryPlaceId = segmentsToCreate[0].cityPlaceId;
    let primaryPlaceDetails: any = null;
    
    // Try to get place details using Google Place ID
    if (primaryPlaceId) {
      primaryPlaceDetails = await getPlaceDetails(primaryPlaceId);
    }
    
    // If we couldn't get details and have a city name, try to find Google Place ID from name
    if (!primaryPlaceDetails && segmentsToCreate[0].cityName && segmentsToCreate[0].cityName !== "Unknown City") {
      const googlePlaceId = await findGooglePlaceId(segmentsToCreate[0].cityName);
      if (googlePlaceId) {
        primaryPlaceDetails = await getPlaceDetails(googlePlaceId);
      }
    }
    
    // Extract city name, ensuring it's city-based, not landmark-based
    // CRITICAL: Check Google Places types FIRST - this is the most reliable way to detect landmarks
    // Google Places types include: stadium, tourist_attraction, point_of_interest, museum, etc.
    const landmarkTypes = [
      'stadium', 'arena', 'tourist_attraction', 'point_of_interest', 'museum', 
      'church', 'mosque', 'synagogue', 'temple', 'shrine', 'cathedral', 'basilica',
      'park', 'amusement_park', 'zoo', 'aquarium', 'library', 'university', 'college',
      'theater', 'movie_theater', 'opera', 'art_gallery', 'casino', 'night_club',
      'shopping_mall', 'market', 'gym', 'hospital', 'airport', 'train_station', 'bus_station',
      'establishment' // Sometimes landmarks are just marked as 'establishment'
    ];
    
    // Check if place has landmark types (PRIORITY 1 - Most reliable)
    const hasLandmarkType = primaryPlaceDetails?.types && primaryPlaceDetails.types.some(
      (type: string) => landmarkTypes.includes(type.toLowerCase())
    );
    
    // Also check name for landmark keywords (PRIORITY 2 - Fallback if types not available)
    // Include both English and Spanish keywords for full language support
    const landmarkKeywords = [
      // English keywords
      'basilica', 'basílica', 'cathedral', 'museum', 'palace', 'tower', 'monument', 'church', 'temple', 
      'mosque', 'synagogue', 'shrine', 'stadium', 'arena', 'coliseum', 'theater', 'theatre', 'opera', 
      'market', 'park', 'garden', 'bridge', 'fort', 'castle', 'square', 'plaza', 'fountain', 'memorial', 
      'zoo', 'aquarium', 'library', 'university', 'mestalla',
      // Spanish keywords (for Spanish-speaking locales)
      'museo', 'catedral', 'palacio', 'torre', 'monumento', 'iglesia', 'templo', 'mezquita', 'sinagoga', 
      'santuario', 'estadio', 'estadium', 'coliseo', 'teatro', 'ópera', 'mercado', 'parque', 'jardín', 
      'puente', 'fuerte', 'castillo', 'plaza', 'fuente', 'memorial', 'zoológico', 'acuario', 'biblioteca', 
      'universidad', 'campo', 'camp nou', 'estadio camp nou', 'spotify camp nou',
      // Common Spanish place name patterns
      'sagrada família', 'sagrada familia', 'la rambla', 'park güell', 'parc güell'
    ];
    const isLandmarkName = primaryPlaceDetails?.name && landmarkKeywords.some(keyword => 
      primaryPlaceDetails.name.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // CRITICAL: If it's a landmark by type OR name, we MUST extract the city
    const isLandmark = hasLandmarkType || isLandmarkName;
    
    // Start with the place name, but we'll validate and extract the actual city
    let primaryCityName = primaryPlaceDetails?.name || segmentsToCreate[0].cityName;
    
    // CRITICAL: If this is a landmark (by type or name), ALWAYS extract the city
    if (isLandmark) {
      console.log(`[trip-creation] Detected landmark: "${primaryPlaceDetails?.name}" (types: ${primaryPlaceDetails?.types?.join(', ') || 'none'}). Extracting city...`);
      
      // METHOD 1: Try to extract city from formatted_address (fastest and most reliable)
      if (primaryPlaceDetails?.formatted_address) {
        const addressParts = primaryPlaceDetails.formatted_address.split(',').map((s: string) => s.trim());
        // Format is typically: "Landmark Name, Street/Area, City, Country" or "Landmark Name, City, Country"
        // Country is always last, city is usually second-to-last
        if (addressParts.length >= 2) {
          // Start from second-to-last (before country) and work backwards
          let extractedCity: string | null = null;
          for (let i = addressParts.length - 2; i >= 0; i--) {
            const candidate = addressParts[i];
            // Skip if it's the landmark name itself (usually first part)
            if (i === 0 && candidate.toLowerCase() === (primaryPlaceDetails.name?.toLowerCase() || '')) {
              continue;
            }
            // Check if candidate is not a landmark, street type, or number
            if (candidate && candidate.length > 2) {
              const candidateLower = candidate.toLowerCase();
              const skipPatterns = [
                ...landmarkKeywords,
                ...landmarkTypes.map(t => t.replace('_', ' ')),
                // English street types
                'street', 'avenue', 'road', 'boulevard', 'lane', 'way', 'drive',
                // Spanish street types
                'calle', 'avenida', 'camino', 'carretera', 'paseo', 'plaza', 'plazoleta',
                'ronda', 'travesía', 'vía', 'bulevar', 'pasaje', 'carrer', 'carrera',
                // Catalan/Valencian street types
                'carrer', 'avinguda', 'plaça', 'passatge',
                // French/German street types
                'rue', 'strasse', 'str.',
                // Common address elements
                'number', 'num', 'nº', '#', 'numero', 'número', 'núm.', 'via'
              ];
              
              const shouldSkip = skipPatterns.some(pattern => candidateLower.includes(pattern)) || /\d/.test(candidate);
              
              if (!shouldSkip && !landmarkTypes.some(type => candidateLower.includes(type.replace('_', ' ')))) {
                extractedCity = candidate;
                break;
              }
            }
          }
          
          if (extractedCity) {
            primaryCityName = extractedCity;
            console.log(`[trip-creation] ✓ Extracted city "${primaryCityName}" from landmark address: "${primaryPlaceDetails.formatted_address}"`);
          } else {
            // Fallback: use second-to-last anyway (might be wrong, but better than landmark)
            primaryCityName = addressParts[addressParts.length - 2];
            console.warn(`[trip-creation] ⚠ Could not find non-landmark city in address. Using "${primaryCityName}" from address: "${primaryPlaceDetails.formatted_address}"`);
          }
        }
      }
      
      // METHOD 2: If still looks like a landmark or extraction failed, try reverse geocoding from coordinates
      const stillLooksLikeLandmark = landmarkKeywords.some(keyword => 
        primaryCityName.toLowerCase().includes(keyword.toLowerCase())
      ) || (primaryPlaceDetails?.types && primaryPlaceDetails.types.some((type: string) => 
        landmarkTypes.includes(type.toLowerCase())
      ) && primaryCityName === primaryPlaceDetails.name);
      
      if (stillLooksLikeLandmark && primaryPlaceDetails?.geometry?.location && GOOGLE_MAPS_API_KEY) {
        try {
          const { getCityFromLatLng } = await import('@/lib/google/places-server');
          const cityFromCoords = await getCityFromLatLng(
            primaryPlaceDetails.geometry.location.lat, 
            primaryPlaceDetails.geometry.location.lng
          );
          if (cityFromCoords && !landmarkKeywords.some(keyword => cityFromCoords.toLowerCase().includes(keyword.toLowerCase()))) {
            console.log(`[trip-creation] ✓ Extracted city "${cityFromCoords}" from coordinates for landmark "${primaryPlaceDetails.name}"`);
            primaryCityName = cityFromCoords;
          } else if (cityFromCoords) {
            console.warn(`[trip-creation] ⚠ Reverse geocoded result "${cityFromCoords}" still looks like a landmark. Keeping extracted city: "${primaryCityName}"`);
          }
        } catch (err) {
          console.error('[trip-creation] Error getting city from coordinates:', err);
        }
      }
    }
    
    // Final validation: Ensure we're not using a landmark as the city name
    const finalIsLandmark = landmarkKeywords.some(keyword => primaryCityName.toLowerCase().includes(keyword.toLowerCase())) ||
                            (primaryPlaceDetails?.types && primaryPlaceDetails.types.some((type: string) => 
                              landmarkTypes.includes(type.toLowerCase())
                            ) && primaryCityName === primaryPlaceDetails.name);
    
    if (finalIsLandmark) {
      console.error(`[trip-creation] ❌ ERROR: Final city name "${primaryCityName}" is still a landmark! Original: "${primaryPlaceDetails?.name || destinationName}". Attempting emergency extraction.`);
      // Try one more time with a more aggressive extraction from formatted_address
      if (primaryPlaceDetails?.formatted_address) {
        const addressParts = primaryPlaceDetails.formatted_address.split(',').map((s: string) => s.trim());
        console.log(`[trip-creation] Emergency extraction - address parts:`, addressParts);
        
        // Try each part from the end (before country) backwards to find a valid city name
        // Typically format is: "Landmark, Street, City, Country" or "Landmark, City, Country"
        // Country is always last, city is usually second-to-last
        for (let i = addressParts.length - 2; i >= 0; i--) {
          const candidate = addressParts[i];
          if (!candidate || candidate.length < 2) continue;
          
          const candidateLower = candidate.toLowerCase();
          // Skip if it's clearly a landmark, street type, or number
          const skipPatterns = [
            ...landmarkKeywords,
            ...landmarkTypes.map(t => t.replace('_', ' ')),
            // English street types
            'street', 'avenue', 'road', 'boulevard', 'lane', 'way', 'drive', 'square',
            // Spanish street types
            'calle', 'avenida', 'camino', 'carretera', 'paseo', 'plaza', 'plazoleta',
            'ronda', 'travesía', 'vía', 'bulevar', 'pasaje', 'carrer', 'carrera',
            // Catalan/Valencian street types
            'carrer', 'avinguda', 'plaça', 'passatge',
            // French/German street types
            'rue', 'strasse', 'str.',
            // Common address elements
            'number', 'num', 'nº', '#', 'numero', 'número', 'núm.', 'via'
          ];
          
          const shouldSkip = skipPatterns.some(pattern => candidateLower.includes(pattern)) || /\d/.test(candidate);
          
          if (!shouldSkip) {
            // This looks like a valid city name
            console.log(`[trip-creation] ✓ Emergency extraction: Using "${candidate}" from address as city name (was: "${primaryCityName}")`);
            primaryCityName = candidate;
            break;
          }
        }
        
        // If still a landmark after emergency extraction, we're in trouble
        const stillLandmark = landmarkKeywords.some(keyword => primaryCityName.toLowerCase().includes(keyword.toLowerCase()));
        if (stillLandmark) {
          console.error(`[trip-creation] ❌ CRITICAL: Emergency extraction failed. City name "${primaryCityName}" is still a landmark. Address: "${primaryPlaceDetails.formatted_address}". Types: ${primaryPlaceDetails?.types?.join(', ') || 'none'}`);
          
          // Last resort: Force reverse geocoding if coordinates are available
          if (primaryPlaceDetails?.geometry?.location && GOOGLE_MAPS_API_KEY) {
            try {
              const { getCityFromLatLng } = await import('@/lib/google/places-server');
              const cityFromCoords = await getCityFromLatLng(
                primaryPlaceDetails.geometry.location.lat, 
                primaryPlaceDetails.geometry.location.lng
              );
              if (cityFromCoords) {
                console.log(`[trip-creation] ✓ Last resort: Using city from coordinates: "${cityFromCoords}"`);
                primaryCityName = cityFromCoords;
              }
            } catch (err) {
              console.error('[trip-creation] ❌ Last resort reverse geocoding failed:', err);
            }
          }
        }
      } else {
        console.error(`[trip-creation] ❌ CRITICAL: No formatted_address available for emergency extraction. City name "${primaryCityName}" is still a landmark. Types: ${primaryPlaceDetails?.types?.join(', ') || 'none'}`);
        
        // Last resort: Force reverse geocoding if coordinates are available
        if (primaryPlaceDetails?.geometry?.location && GOOGLE_MAPS_API_KEY) {
          try {
            const { getCityFromLatLng } = await import('@/lib/google/places-server');
            const cityFromCoords = await getCityFromLatLng(
              primaryPlaceDetails.geometry.location.lat, 
              primaryPlaceDetails.geometry.location.lng
            );
            if (cityFromCoords) {
              console.log(`[trip-creation] ✓ Last resort: Using city from coordinates: "${cityFromCoords}"`);
              primaryCityName = cityFromCoords;
            }
          } catch (err) {
            console.error('[trip-creation] ❌ Last resort reverse geocoding failed:', err);
          }
        }
      }
    }
    
    const primaryCountry = primaryPlaceDetails?.formatted_address
      ?.split(",")
      .slice(-1)[0]
      .trim() || null;

    // Generate trip title - ensure it's always city-based
    const tripStart = new Date(startDate);
    const tripEnd = new Date(endDate);
    const title =
      segmentsToCreate.length > 1
        ? `${segmentsToCreate.map((s) => s.cityName).join(" → ")} Trip`
        : `${primaryCityName} Trip`;

    // Create trip
    const { data: trip, error: tripError } = await (supabase
      .from("trips") as any)
      .insert({
        title,
        start_date: startDate,
        end_date: endDate,
        default_currency: "USD",
        destination_name: primaryCityName, // This should be the extracted city name, not the landmark
        destination_city: primaryCityName, // Also save as destination_city for easier access (CRITICAL: must be city, not landmark)
        destination_country: primaryCountry,
        destination_place_id: primaryPlaceId, // Save the original landmark's place_id for reference
        center_lat: primaryPlaceDetails?.geometry?.location?.lat || null,
        center_lng: primaryPlaceDetails?.geometry?.location?.lng || null,
        owner_id: profileId,
        // Personalization fields
        travelers,
        origin_city_place_id: originCityPlaceId || null,
        origin_city_name: originCityName || null,
        has_accommodation: hasAccommodation,
        accommodation_place_id: accommodationPlaceId || null,
        accommodation_name: accommodationName || null,
        accommodation_address: accommodationAddress || null,
        arrival_transport_mode: arrivalTransportMode || null,
        arrival_time_local: arrivalTimeLocal || null,
        interests: interests.length > 0 ? interests : [],
      })
      .select()
      .single();

    if (tripError || !trip) {
      return NextResponse.json(
        { error: tripError?.message || "Failed to create trip" },
        { status: 500 }
      );
    }

    // Create segments and days
    const createdSegments: any[] = [];
    for (let i = 0; i < segmentsToCreate.length; i++) {
      const segmentData = segmentsToCreate[i];

      // Create segment
      const { data: segment, error: segmentError } = await (supabase
        .from("trip_segments") as any)
        .insert({
          trip_id: trip.id,
          order_index: i,
          city_place_id: segmentData.cityPlaceId,
          city_name: segmentData.cityName,
          start_date: segmentData.startDate,
          end_date: segmentData.endDate,
        })
        .select()
        .single();

      if (segmentError || !segment) {
        // Rollback: delete trip
        await supabase.from("trips").delete().eq("id", trip.id);
        return NextResponse.json(
          { error: segmentError?.message || "Failed to create segment" },
          { status: 500 }
        );
      }

      createdSegments.push(segment);

      // Create days for this segment
      const segmentStart = new Date(segmentData.startDate);
      const segmentEnd = new Date(segmentData.endDate);
      const days = eachDayOfInterval({ start: segmentStart, end: segmentEnd });

      const dayRecords = days.map((date, dayIndex) => {
        // Calculate day_number across entire trip
        const tripStart = new Date(startDate);
        const daysSinceTripStart = Math.floor(
          (date.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          trip_id: trip.id,
          trip_segment_id: segment.id,
          date: format(date, "yyyy-MM-dd"),
          day_number: daysSinceTripStart + 1,
        };
      });

      const { error: daysError } = await (supabase
        .from("days") as any)
        .insert(dayRecords);

      if (daysError) {
        // Rollback: delete trip and segments
        await supabase.from("trip_segments").delete().eq("trip_id", trip.id);
        await supabase.from("trips").delete().eq("id", trip.id);
        return NextResponse.json(
          { error: daysError.message || "Failed to create days" },
          { status: 500 }
        );
      }
    }

    // Create trip member (owner) using upsert to prevent 409 errors
    const { error: memberError } = await (supabase
      .from("trip_members") as any)
      .upsert({
        trip_id: trip.id,
        user_id: profileId,
        email: null, // Will be populated from Clerk if needed
        role: "owner",
        display_name: null,
      }, {
        onConflict: 'trip_id,email'
      });

    if (memberError) {
      console.error('[trip-members]', { tripId: trip.id, email: null, profileId, action: 'create_trip_owner_member', error: memberError.message });
      // Rollback: delete everything
      await supabase.from("trip_segments").delete().eq("trip_id", trip.id);
      await supabase.from("days").delete().eq("trip_id", trip.id);
      await supabase.from("trips").delete().eq("id", trip.id);
      return NextResponse.json(
        { error: memberError.message || "Failed to create trip member" },
        { status: 500 }
      );
    }

    console.log('[trip-members]', { tripId: trip.id, email: null, profileId, action: 'create_trip_owner_member' });

    console.log('[trip-create] returning trip id', trip.id);

    return NextResponse.json({
      trip: {
        id: trip.id,
        ...trip,
      },
      segments: createdSegments,
    });
  } catch (error: any) {
    console.error('[Trips API]', {
      path: '/api/trips',
      method: 'POST',
      profileId: profileId || 'unknown',
      error: error?.message || 'Internal server error',
      errorCode: error?.code,
    });
    return NextResponse.json(
      {
        error: error?.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  let profileId: string | undefined;
  let authMethod: 'bearer' | 'cookie' | undefined;
  
  try {
    const supabase = await createClient();

    // Get profile ID for authorization (supports both Bearer token and cookie/session)
    try {
      const authResult = await getProfileIdFromRequest(request, supabase);
      profileId = authResult.profileId;
      authMethod = authResult.authMethod;
      
      console.log('[Trips API] Authentication successful', {
        path: '/api/trips',
        method: 'GET',
        profileId,
        clerkUserId: authResult.clerkUserId,
        authMethod,
      });
    } catch (authError: any) {
      console.error('[Trips API] Authentication failed', {
        path: '/api/trips',
        method: 'GET',
        error: authError?.message || 'Failed to get profile',
        authMethod: authMethod || 'unknown',
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch trips where user is owner
    const { data: ownedTrips, error: ownedError } = await supabase
      .from("trips")
      .select("*")
      .eq("owner_id", profileId)
      .order("start_date", { ascending: true });

    if (ownedError) {
      console.error('[Trips API]', {
        path: '/api/trips',
        method: 'GET',
        error: ownedError.message,
        profileId,
      });
      return NextResponse.json(
        { error: ownedError.message || "Failed to fetch trips" },
        { status: 500 }
      );
    }

    // Fetch trips where user is a member
    const { data: memberTrips, error: memberError } = await supabase
      .from("trip_members")
      .select("trip_id, trips(*)")
      .eq("user_id", profileId);

    if (memberError) {
      console.error('[Trips API]', {
        path: '/api/trips',
        method: 'GET',
        error: memberError.message,
        profileId,
      });
      return NextResponse.json(
        { error: memberError.message || "Failed to fetch trip members" },
        { status: 500 }
      );
    }

    // Combine and deduplicate trips
    const allTrips = [
      ...(ownedTrips || []),
      ...(memberTrips || []).map((mt: any) => mt.trips).filter(Boolean),
    ];

    // Deduplicate by id
    const uniqueTrips = Array.from(
      new Map(allTrips.map((trip: any) => [trip.id, trip])).values()
    );

    // Sort by start_date
    uniqueTrips.sort(
      (a: any, b: any) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    console.log('[Trips API] Success', {
      path: '/api/trips',
      method: 'GET',
      profileId,
      authMethod,
      tripCount: uniqueTrips.length,
    });

    return NextResponse.json({
      trips: uniqueTrips,
    });
  } catch (error: any) {
    console.error('[Trips API] Error', {
      path: '/api/trips',
      method: 'GET',
      profileId: profileId || 'unknown',
      authMethod: authMethod || 'unknown',
      error: error?.message || 'Internal server error',
      errorCode: error?.code,
    });
    return NextResponse.json(
      {
        error: error?.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

