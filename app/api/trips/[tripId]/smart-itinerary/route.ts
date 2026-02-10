import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfileId } from '@/lib/auth/getProfileId';
import { SmartItinerary, ItinerarySlot, ItineraryPlace, SlotSummary } from '@/types/itinerary';
import { smartItinerarySchema } from '@/types/itinerary-schema';
import { getPlaceDetails, getPlacePhotoReference, findGooglePlaceId, validatePlaceId } from '@/lib/google/places-server';
import { clearLikedPlacesAfterRegeneration } from '@/lib/supabase/explore-integration';
import { upsertSmartItinerary } from '@/lib/supabase/smart-itineraries-server';
import { GOOGLE_MAPS_API_KEY } from '@/lib/google/places-server';
import { streamText, generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { getUserSubscriptionStatus } from '@/lib/supabase/user-subscription';
import type { Language } from '@/lib/i18n';
import { findPhotoRefForActivity } from '@/lib/google/places-backfill';
import { cachePlaceImageWithDetails } from '@/lib/images/cache-place-image';
import { clerkClient } from '@clerk/nextjs/server';
import { sendTripReadyEmail } from '@/lib/email/resend';
import { getFirstNameFromFullName, normalizeEmailLanguage } from '@/lib/email/language';

export const maxDuration = 300;

async function resolveRecipientFromProfile(profile: {
  clerk_user_id: string | null;
  email: string;
  full_name: string | null;
}) {
  if (profile.clerk_user_id) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(profile.clerk_user_id);
      return {
        email: user.primaryEmailAddress?.emailAddress || profile.email,
        firstName: user.firstName || getFirstNameFromFullName(user.fullName) || getFirstNameFromFullName(profile.full_name),
        language: normalizeEmailLanguage(
          (user.publicMetadata as { locale?: string } | undefined)?.locale || null
        ),
      };
    } catch (error) {
      console.warn('[smart-itinerary] Failed to load Clerk user for email details:', error);
    }
  }

  return {
    email: profile.email,
    firstName: getFirstNameFromFullName(profile.full_name),
    language: 'en' as const,
  };
}

async function trySendTripReadyEmail(params: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  tripId: string;
}) {
  const { data: trip, error: tripError } = await params.supabase
    .from('trips')
    .select('id, title, destination_city, destination_name, owner_id, trip_ready_email_sent_at')
    .eq('id', params.tripId)
    .maybeSingle<{
      id: string;
      title: string;
      destination_city: string | null;
      destination_name: string | null;
      owner_id: string;
      trip_ready_email_sent_at: string | null;
    }>();

  if (tripError || !trip) {
    console.error('[smart-itinerary] Failed to load trip for trip ready email:', tripError);
    return;
  }

  if (trip.trip_ready_email_sent_at) {
    return;
  }

  const { data: profile, error: profileError } = await params.supabase
    .from('profiles')
    .select('id, email, full_name, clerk_user_id')
    .eq('id', trip.owner_id)
    .maybeSingle();

  if (profileError || !profile) {
    console.error('[smart-itinerary] Failed to load owner profile for trip ready email:', profileError);
    return;
  }

  const recipient = await resolveRecipientFromProfile(profile as {
    clerk_user_id: string | null;
    email: string;
    full_name: string | null;
  });

  if (!recipient.email) {
    console.warn('[smart-itinerary] Missing recipient email for trip ready email.');
    return;
  }

  const tripCity = trip.destination_city || trip.destination_name || trip.title;
  const appUrl = process.env.APP_URL || 'https://kruno.app';
  const tripUrl = `${appUrl}/trips/${params.tripId}`;

  await sendTripReadyEmail({
    userEmail: recipient.email,
    firstName: recipient.firstName,
    tripName: trip.title,
    tripCity,
    tripUrl,
    language: recipient.language,
  });

  // Type assertion needed because Supabase type inference fails for update when passed as function parameter
  const { error: updateError } = await (params.supabase
    .from('trips') as any)
    .update({ trip_ready_email_sent_at: new Date().toISOString() })
    .eq('id', params.tripId);

  if (updateError) {
    console.error('[smart-itinerary] Failed to update trip_ready_email_sent_at:', updateError);
  }
}

/**
 * Helper to extract complete JSON objects from streaming text
 * Uses bracket/brace counting to find complete objects
 * Deduplicates days by index to prevent duplicate Day 1 entries
 */
function extractCompleteObjects(text: string): {
  title?: string;
  summary?: string;
  days: any[];
  tripTips?: string[];
  cityOverview?: any;
  isComplete: boolean;
} {
  const result: {
    title?: string;
    summary?: string;
    days: any[];
    tripTips?: string[];
    cityOverview?: any;
    isComplete: boolean;
  } = { days: [] as any[], isComplete: false };
  
  try {
    // Try to parse as complete JSON first
    const parsed = JSON.parse(text);
    if (parsed.title) result.title = parsed.title;
    if (parsed.summary) result.summary = parsed.summary;
    if (parsed.days && Array.isArray(parsed.days)) {
      // Deduplicate days by index - keep the last occurrence of each index
      const indexMap = new Map<number, any>();
      for (const day of parsed.days) {
        if (day.id && day.index !== undefined && day.slots && Array.isArray(day.slots)) {
          indexMap.set(day.index, day);
        }
      }
      result.days = Array.from(indexMap.values()).sort((a, b) => a.index - b.index);
    }
    if (parsed.tripTips) result.tripTips = parsed.tripTips;
    if (parsed.cityOverview) result.cityOverview = parsed.cityOverview;
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
    
    // Extract the days array content - deduplicate by index as we parse
    const indexMap = new Map<number, any>();
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
              // Deduplicate by index - keep the most recent occurrence
              indexMap.set(day.index, day);
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
    
    // Convert map to sorted array
    result.days = Array.from(indexMap.values()).sort((a, b) => a.index - b.index);
    
    // Try to extract title and summary using regex (simpler approach)
    const titleMatch = text.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (titleMatch) result.title = titleMatch[1];
    
    const summaryMatch = text.match(/"summary"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (summaryMatch) result.summary = summaryMatch[1];
    
    // Try to extract cityOverview if present - use brace counting for nested objects
    const cityOverviewStart = text.indexOf('"cityOverview"');
    if (cityOverviewStart !== -1) {
      const afterLabel = text.substring(cityOverviewStart + '"cityOverview"'.length);
      // Skip whitespace, colon, and newlines
      let i = 0;
      while (i < afterLabel.length && (afterLabel[i] === ' ' || afterLabel[i] === ':' || afterLabel[i] === '\n' || afterLabel[i] === '\r' || afterLabel[i] === '\t')) {
        i++;
      }
      if (afterLabel[i] === '{') {
        let braceCount = 0;
        let objStart = i;
        let inString = false;
        let escapeNext = false;
        while (i < afterLabel.length) {
          const char = afterLabel[i];
          
          // Handle string escaping
          if (escapeNext) {
            escapeNext = false;
            i++;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            i++;
            continue;
          }
          
          if (char === '"') {
            inString = !inString;
            i++;
            continue;
          }
          
          // Only count braces when not inside a string
          if (!inString) {
            if (char === '{') {
              braceCount++;
            } else if (char === '}') {
              braceCount--;
              if (braceCount === 0) {
                // Found complete object
                try {
                  const cityOverviewJson = afterLabel.substring(objStart, i + 1);
                  result.cityOverview = JSON.parse(cityOverviewJson);
                } catch (parseError) {
                  // Skip if parsing fails
                  console.warn('[smart-itinerary] Failed to parse cityOverview:', parseError);
                }
                break;
              }
            }
          }
          i++;
        }
      }
    }
    
    // Debug logging for cityOverview extraction
    if (result.cityOverview) {
      console.log('[smart-itinerary] Extracted cityOverview:', JSON.stringify(result.cityOverview).substring(0, 200) + '...');
    }
  }
  
  return result;
}

/**
 * Send SSE message
 */
function sendSSE(controller: ReadableStreamDefaultController, type: string, data: any) {
  const message = JSON.stringify({ type, data });
  try {
    controller.enqueue(new TextEncoder().encode(`data: ${message}\n\n`));
  } catch (err: any) {
    // Most commonly happens if the stream was already closed by the client
    if (err?.code === 'ERR_INVALID_STATE' || err instanceof TypeError) {
      console.warn('[smart-itinerary] SSE send skipped: stream already closed', { type });
      return;
    }
    throw err;
  }
}

/**
 * Resolve place_id for places missing it
 * Uses Google Places Find API to search by name + city
 */
async function resolveMissingPlaceIds(
  places: ItineraryPlace[],
  cityOrArea: string
): Promise<{ refreshed: number; invalidated: number }> {
  if (!GOOGLE_MAPS_API_KEY) return { refreshed: 0, invalidated: 0 };

  let refreshed = 0;
  let invalidated = 0;

  for (const place of places) {
    // Validate existing place_id to avoid NOT_FOUND errors
    if (place.place_id) {
      const isValid = await validatePlaceId(place.place_id);
      if (!isValid) {
        place.place_id = undefined;
        invalidated++;
      }
    }

    if (!place.place_id) {
      // Try to resolve place_id using name + city
      const query = place.area || place.neighborhood 
        ? `${place.name}, ${place.area || place.neighborhood}, ${cityOrArea}`
        : `${place.name}, ${cityOrArea}`;
      
      const placeId = await findGooglePlaceId(query);
      if (placeId) {
        place.place_id = placeId;
        refreshed++;
      }
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return { refreshed, invalidated };
}

/**
 * Build photo URL from photo_reference
 */
function buildPhotoUrl(photoRef: string): string {
  if (!GOOGLE_MAPS_API_KEY) {
    return '';
  }
  return `/api/places/photo?ref=${encodeURIComponent(photoRef)}&maxwidth=800`;
}

/**
 * Deduplicate photos by photo_reference and build URLs
 * Returns array of unique photo URLs (up to maxCount)
 */
/** Normalize URL for deduplication (origin + pathname, ignore query/fragment). */
function normalizePhotoUrl(url: string): string {
  try {
    const u = url.startsWith('/') ? new URL(url, 'https://example.com') : new URL(url);
    return u.origin + u.pathname;
  } catch {
    return url;
  }
}

function deduplicateAndBuildPhotoUrls(
  places: ItineraryPlace[],
  maxCount: number = 4
): string[] {
  const seen = new Set<string>();
  const photoUrls: string[] = [];

  const tryAdd = (url: string | undefined | null) => {
    if (!url) return;
    const norm = normalizePhotoUrl(url);
    if (seen.has(norm)) return;
    seen.add(norm);
    photoUrls.push(url);
  };

  for (const place of places) {
    // Prefer stable cached image_url first
    tryAdd(place.image_url || null);
    if (photoUrls.length >= maxCount) break;

    // Then check any pre-existing photo URLs on the place
    if (place.photos && Array.isArray(place.photos)) {
      for (const photo of place.photos) {
        if (typeof photo === 'string') {
          tryAdd(photo);
        }
        if (photoUrls.length >= maxCount) break;
      }
    }
    if (photoUrls.length >= maxCount) break;

    // Finally, build from photo_reference
    if (place.photo_reference) {
      tryAdd(buildPhotoUrl(place.photo_reference));
    }

    if (photoUrls.length >= maxCount) {
      break;
    }
  }

  return photoUrls;
}

/**
 * Safety guard: Prevent duplicate photo_reference for different place_ids
 * If multiple places share the same photo_reference but have different place_ids,
 * try to find an alternative image for duplicates instead of leaving them empty.
 */
async function applyPhotoReferenceSafetyGuard(
  places: ItineraryPlace[],
  context: PlaceMediaContext
): Promise<void> {
  const refToPlaceIds = new Map<string, Set<string>>();

  // Build map: photo_reference -> set of place_ids
  for (const place of places) {
    if (place.photo_reference && place.place_id) {
      if (!refToPlaceIds.has(place.photo_reference)) {
        refToPlaceIds.set(place.photo_reference, new Set());
      }
      refToPlaceIds.get(place.photo_reference)!.add(place.place_id);
    }
  }

  // Check for conflicts
  for (const [photoRef, placeIds] of refToPlaceIds.entries()) {
    if (placeIds.size > 1) {
      console.warn(
        `[smart-itinerary] Safety guard: photo_reference shared by ${placeIds.size} different places. Finding alternatives for duplicates.`,
        { placeIds: Array.from(placeIds) }
      );

      // Keep photo_reference for the first occurrence; find alternatives for others
      let firstOccurrence = true;
      for (const place of places) {
        if (place.photo_reference === photoRef && place.place_id) {
          if (firstOccurrence) {
            firstOccurrence = false;
          } else {
            // Clear the duplicate and try to find an alternative image
            place.photo_reference = undefined;
            place.photos = [];
            place.image_url = undefined;

            // Try alternative search (area-first or "venue" suffix to get different result)
            const altSearch =
              place.area && place.area !== context.cityOrArea
                ? `${place.area} ${place.name}`
                : `${place.name} ${context.cityOrArea}`;
            const result = await enrichPlaceMedia(place, context, {
              searchTitleOverride: altSearch,
            });
            if (result.photoRef || result.imageUrl) {
              // enrichPlaceMedia mutates place, so it's already updated
            }
          }
        }
      }
    }
  }
}

type PlaceMediaContext = {
  cityOrArea: string;
  tripId: string;
  destinationCountry?: string | null;
  centerLat?: number | null;
  centerLng?: number | null;
};

/**
 * Ensure a place has either a valid photo_reference (preferred) or a cached image_url.
 * Attempts:
 * 1) Use existing photo_reference/image_url.
 * 2) Fetch photo_reference via place_id.
 * 3) Fallback to text search photo reference (Find Place + Details).
 * 4) Final fallback: cache stable image via cachePlaceImageWithDetails (Google/Unsplash/Mapbox).
 * @param options.searchTitleOverride - If provided, use this instead of place.name for text search (e.g. for finding alternative images)
 */
async function enrichPlaceMedia(
  place: ItineraryPlace,
  context: PlaceMediaContext,
  options?: { searchTitleOverride?: string }
): Promise<{ photoRef: string | null; imageUrl: string | null }> {
  // If we already have a cached image, prefer it
  if (place.image_url) {
    if (!place.photos || place.photos.length === 0) {
      place.photos = [place.image_url];
    }
    return { photoRef: place.photo_reference || null, imageUrl: place.image_url };
  }

  // If an existing photo_reference is present, respect it but ensure photos array is populated
  if (place.photo_reference) {
    if (!place.photos || place.photos.length === 0) {
      place.photos = [buildPhotoUrl(place.photo_reference)];
    }
    return { photoRef: place.photo_reference, imageUrl: null };
  }

  // Attempt to fetch photo_reference using place_id
  if (place.place_id) {
    const photoRef = await getPlacePhotoReference(place.place_id);
    if (photoRef) {
      place.photo_reference = photoRef;
      place.photos = [buildPhotoUrl(photoRef)];
      return { photoRef, imageUrl: null };
    }
  }

  // Try to find a photo_reference via text search (aligns with backfill helper)
  const searchTitle = options?.searchTitleOverride ?? place.name;
  const backfillPhotoRef = await findPhotoRefForActivity({
    title: searchTitle,
    city: context.cityOrArea,
    country: context.destinationCountry || undefined,
    lat: context.centerLat || undefined,
    lng: context.centerLng || undefined,
  });

  if (backfillPhotoRef) {
    place.photo_reference = backfillPhotoRef;
    place.photos = [buildPhotoUrl(backfillPhotoRef)];
    return { photoRef: backfillPhotoRef, imageUrl: null };
  }

  // Final fallback: fetch and cache a stable image URL
  const cacheResult = await cachePlaceImageWithDetails({
    tripId: context.tripId,
    placeId: place.id,
    title: place.name,
    city: context.cityOrArea,
    country: context.destinationCountry || undefined,
    photoRef: undefined,
    lat: context.centerLat || undefined,
    lng: context.centerLng || undefined,
  });

  if (cacheResult.publicUrl) {
    place.image_url = cacheResult.publicUrl;
    place.photos = [cacheResult.publicUrl];
    return { photoRef: null, imageUrl: cacheResult.publicUrl };
  }

  return { photoRef: null, imageUrl: null };
}

/**
 * Validate that slot summaries have the correct structure
 * Only validates structure, doesn't generate content
 */
function validateSlotSummaries(itinerary: SmartItinerary): void {
  if (!itinerary?.days?.length) return;
  
  for (const day of itinerary.days) {
    for (const slot of day.slots) {
      // Accept both string (legacy) and structured (new) formats
      if (typeof slot.summary === 'string') {
        // Legacy format - valid
        continue;
      }
      
      if (typeof slot.summary === 'object' && slot.summary !== null) {
        // New structured format - validate required fields
        const summary = slot.summary as SlotSummary;
        if (
          typeof summary.block_title !== 'string' ||
          !Array.isArray(summary.what_to_do) ||
          typeof summary.local_insights !== 'string' ||
          typeof summary.move_between !== 'string' ||
          (summary.getting_around !== undefined && typeof summary.getting_around !== 'string') ||
          (summary.cost_note !== null && typeof summary.cost_note !== 'string') ||
          typeof summary.heads_up !== 'string'
        ) {
          console.warn(`[smart-itinerary] Slot ${slot.label} has invalid structured summary`);
        }
      } else {
        console.warn(`[smart-itinerary] Slot ${slot.label} missing summary`);
      }
    }
  }
}

/**
 * Count words in a string (simple heuristic)
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Extract n-grams (phrases) from text for repetition detection
 */
function extractNgrams(text: string, n: number = 3): Set<string> {
  const words = text.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const ngrams = new Set<string>();
  for (let i = 0; i <= words.length - n; i++) {
    const ngram = words.slice(i, i + n).join(' ');
    if (ngram.length > 10) { // Only consider meaningful phrases
      ngrams.add(ngram);
    }
  }
  return ngrams;
}

/**
 * Check if text contains repeated sentence structures
 */
function hasRepeatedStructures(text: string, otherTexts: string[]): boolean {
  const commonStarts = [
    'start your',
    'begin your',
    'move between',
    'refuel close',
    'after exploring',
    'next, head',
    'then, make',
    'don\'t forget',
    'be sure to',
    'make sure to',
  ];
  
  const textLower = text.toLowerCase();
  for (const start of commonStarts) {
    if (textLower.startsWith(start)) {
      // Check if other texts also start with this pattern
      const otherMatches = otherTexts.filter(t => t.toLowerCase().startsWith(start));
      if (otherMatches.length > 0) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Post-process slot summaries to remove generic ranges and ensure uniqueness
 */
function sanitizeSlotSummaries(itinerary: SmartItinerary): void {
  if (!itinerary?.days?.length) return;

  // Track used facts per day to prevent repetition
  const usedFactsPerDay = new Map<number, Set<string>>();
  // Track all slot summaries across the trip for cross-day repetition detection
  const allSlotSummaries: Array<{ dayIndex: number; slotIndex: number; summary: SlotSummary }> = [];

  // First pass: collect all summaries
  for (const day of itinerary.days) {
    for (let slotIdx = 0; slotIdx < day.slots.length; slotIdx++) {
      const slot = day.slots[slotIdx];
      if (typeof slot.summary === 'object' && slot.summary !== null) {
        allSlotSummaries.push({
          dayIndex: day.index,
          slotIndex: slotIdx,
          summary: slot.summary as SlotSummary,
        });
      }
    }
  }

  for (const day of itinerary.days) {
    const usedFacts = new Set<string>();
    usedFactsPerDay.set(day.index, usedFacts);

    for (const slot of day.slots) {
      // Skip legacy string format
      if (typeof slot.summary === 'string') {
        continue;
      }
      
      if (!slot.summary || typeof slot.summary !== 'object') {
        continue;
      }

      const summary = slot.summary as SlotSummary;

      // Enforce local_insights minimum length (200 words ≈ 800 characters)
      if (summary.local_insights) {
        const wordCount = countWords(summary.local_insights);
        if (wordCount < 200) {
          console.warn(`[smart-itinerary] Slot ${slot.label} local_insights too short (${wordCount} words, minimum 200). Keeping as-is but may need regeneration.`);
        }
      }

      // Remove generic cost ranges from cost_note
      if (summary.cost_note) {
        const genericPatterns = [
          /€?\d+\s*to\s*€?\d+/i,  // "€10 to €30"
          /\d+\s*-\s*€?\d+/i,      // "10-30"
          /€?\d+\s*-\s*€?\d+/i,    // "€10-€30"
          /€?\d+\s*–\s*€?\d+/i,    // "€10–€30" (en dash)
        ];
        
        const hasGenericRange = genericPatterns.some(pattern => 
          pattern.test(summary.cost_note!)
        );
        
        if (hasGenericRange) {
          // Check if this is a known ticketed attraction
          const hasKnownTicket = slot.places.some(p => 
            p.tags?.includes('museum') || 
            p.tags?.includes('attraction') ||
            p.name.toLowerCase().includes('museum') ||
            p.name.toLowerCase().includes('palace') ||
            p.name.toLowerCase().includes('cathedral') ||
            p.name.toLowerCase().includes('gallery') ||
            p.name.toLowerCase().includes('sagrada') ||
            p.name.toLowerCase().includes('colosseum') ||
            p.name.toLowerCase().includes('tower')
          );
          
          if (!hasKnownTicket) {
            summary.cost_note = null; // Remove generic range
          }
        }
      }

      // Check for duplicate heads_up within the day
      const headsUpKey = summary.heads_up.toLowerCase().trim();
      if (usedFacts.has(headsUpKey)) {
        // Generate a unique heads_up based on the first place
        summary.heads_up = `Tip: Check opening hours for ${slot.places[0]?.name || 'attractions'} in this area`;
      }
      usedFacts.add(headsUpKey);

      // Detect repeated phrases in local_insights across slots
      if (summary.local_insights) {
        const currentNgrams = extractNgrams(summary.local_insights, 4);
        const otherSummaries = allSlotSummaries.filter(
          s => !(s.dayIndex === day.index && s.slotIndex === day.slots.indexOf(slot))
        );
        
        let repeatedPhrases = 0;
        for (const other of otherSummaries) {
          if (other.summary.local_insights) {
            const otherNgrams = extractNgrams(other.summary.local_insights, 4);
            // Count overlapping n-grams
            for (const ngram of currentNgrams) {
              if (otherNgrams.has(ngram)) {
                repeatedPhrases++;
              }
            }
          }
        }
        
        // If too many repeated phrases, remove cost_note as a simple fix
        // (Prefer removal over rewriting to avoid hallucination)
        if (repeatedPhrases > 3 && summary.cost_note) {
          console.warn(`[smart-itinerary] Detected repetitive local_insights in slot ${slot.label}, removing cost_note`);
          summary.cost_note = null;
        }
      }

      // Detect repeated sentence structures
      const otherLocalInsights = allSlotSummaries
        .filter(s => !(s.dayIndex === day.index && s.slotIndex === day.slots.indexOf(slot)))
        .map(s => s.summary.local_insights)
        .filter(Boolean) as string[];
      
      if (summary.local_insights && hasRepeatedStructures(summary.local_insights, otherLocalInsights)) {
        // Remove cost_note if structure is too repetitive
        if (summary.cost_note) {
          console.warn(`[smart-itinerary] Detected repeated sentence structure in slot ${slot.label}, removing cost_note`);
          summary.cost_note = null;
        }
      }

      // Ensure what_to_do bullets reference actual POIs
      summary.what_to_do = summary.what_to_do.filter((bullet: string) => {
        // Check if bullet mentions at least one place from the slot
        return slot.places.some(place => 
          bullet.toLowerCase().includes(place.name.toLowerCase()) ||
          bullet.toLowerCase().includes(place.area.toLowerCase())
        );
      });

      // If no valid bullets remain, create minimal ones from place names
      if (summary.what_to_do.length === 0 && slot.places.length > 0) {
        summary.what_to_do = slot.places.slice(0, 2).map((p: ItineraryPlace) => 
          `Visit ${p.name}${p.area ? ` in ${p.area}` : ''}`
        );
      }
    }
  }
}

const replaceMdashes = (value: string): string =>
  value.replace(/[\u2013\u2014]/g, ' to ');

function replaceTilde(value: string): string {
  const withoutMdashes = replaceMdashes(value);
  const withoutTilde = withoutMdashes.replace(/~/g, 'about ');
  // Preserve paragraph breaks while tidying spacing around punctuation.
  return withoutTilde
    // Collapse repeated spaces/tabs but keep newlines intact
    .replace(/[ \t]{2,}/g, ' ')
    // Trim stray spaces before newlines to avoid accidental paragraph collapse
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    // Remove spaces before punctuation
    .replace(/[ \t]+([.,;:!?])/g, '$1');
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function sanitizeNoTilde<T>(input: T): T {
  if (typeof input === 'string') {
    return replaceTilde(input) as unknown as T;
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizeNoTilde(item)) as unknown as T;
  }
  if (input instanceof Date) {
    return input;
  }
  if (input && typeof input === 'object' && isPlainObject(input)) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeNoTilde(value as any);
    }
    return sanitized as unknown as T;
  }
  return input;
}


export async function POST(req: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  let profileId: string | undefined;
  let tripId: string | undefined;

  try {
    tripId = (await params).tripId;

    if (!tripId) {
      return NextResponse.json(
        { error: 'Missing trip id' },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Smart Itinerary API]', {
        path: '/api/trips/[tripId]/smart-itinerary',
        method: 'POST',
        error: authError?.message || 'Failed to get profile',
        tripId,
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has access to trip
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("id, owner_id")
      .eq("id", tripId)
      .single();

    if (tripError || !tripData) {
      console.error('[Smart Itinerary API]', {
        path: '/api/trips/[tripId]/smart-itinerary',
        method: 'POST',
        tripId,
        profileId,
        error: tripError?.message || 'Trip not found',
        errorCode: tripError?.code,
        context: 'trip_lookup',
      });
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    type TripQueryResult = {
      id: string
      owner_id: string
    }

    const trip = tripData as TripQueryResult;

    // Check if user is owner or member
    const { data: member } = await supabase
      .from("trip_members")
      .select("id")
      .eq("trip_id", tripId)
      .eq("user_id", profileId)
      .single();

    if (trip.owner_id !== profileId && !member) {
      console.error('[Smart Itinerary API]', {
        path: '/api/trips/[tripId]/smart-itinerary',
        method: 'POST',
        tripId,
        profileId,
        error: 'Forbidden: User does not have access to this trip',
        check_failed: trip.owner_id !== profileId ? 'not_owner' : 'not_member',
        trip_owner_id: trip.owner_id,
        is_member: !!member,
        context: 'authorization_check',
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    const authResult = await getProfileId(supabase);
    const { isProForThisTrip } = await getTripProStatus(supabase, authResult.clerkUserId, tripId);
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
    let language: Language = 'en';

    try {
      const body = await req.json().catch(() => ({}));
      mustIncludePlaceIds = body.must_include_place_ids || [];
      alreadyPlannedPlaceIds = body.already_planned_place_ids || [];
      preserveStructure = body.preserve_structure || false;
      language = body.language === 'es' ? 'es' : 'en';
    } catch {
      // Body parsing failed, continue with defaults
    }

    // 1. Load Trip Details (including personalization fields and place_id)
    const { data: tripDetailsData, error: tripDetailsError } = await supabase
      .from('trips')
      .select('id, title, start_date, end_date, destination_name, destination_city, destination_country, destination_place_id, center_lat, center_lng, travelers, origin_city_name, has_accommodation, accommodation_name, accommodation_address, arrival_transport_mode, arrival_time_local, interests')
      .eq('id', tripId)
      .single();

    if (tripDetailsError || !tripDetailsData) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    type TripDetailsQueryResult = {
      id: string
      title: string
      start_date: string
      end_date: string
      destination_name: string | null
      destination_city: string | null
      destination_country: string | null
      destination_place_id: string | null
      center_lat: number | null
      center_lng: number | null
      travelers: number | null
      origin_city_name: string | null
      has_accommodation: boolean | null
      accommodation_name: string | null
      accommodation_address: string | null
      arrival_transport_mode: string | null
      arrival_time_local: string | null
      interests: string[] | null
    }

    const tripDetails = tripDetailsData as TripDetailsQueryResult;
    const destinationCountry = tripDetails.destination_country;
    const centerLat = tripDetails.center_lat;
    const centerLng = tripDetails.center_lng;

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
      `Number of travelers: ${tripDetails.travelers || 1}`,
      tripDetails.origin_city_name ? `Origin city: ${tripDetails.origin_city_name}` : 'Origin city: unknown',
      tripDetails.has_accommodation && tripDetails.accommodation_name
        ? `Accommodation: ${tripDetails.accommodation_name}${tripDetails.accommodation_address ? ` (${tripDetails.accommodation_address})` : ''}`
        : 'Accommodation: not booked yet',
      tripDetails.arrival_transport_mode
        ? `Arrival: ${tripDetails.arrival_transport_mode}${tripDetails.arrival_time_local ? ` around ${tripDetails.arrival_time_local}` : ''} on the first day`
        : 'Arrival: unspecified',
      tripDetails.interests && tripDetails.interests.length > 0
        ? `Interests: ${tripDetails.interests.join(', ')}`
        : 'Interests: not specified',
    ].join('\n');

    // Extract city name from destination - ensure it's city-based, not landmark-based
    // CRITICAL: Priority 1) Use destination_city if available AND valid (not a landmark)
    // Priority 2) Use reverse geocoding if destination_name is a landmark
    // Priority 3) Extract from destination_name or title if possible
    let cityName = tripDetails.destination_city || tripDetails.destination_name || tripDetails.title;
    
    // Comprehensive landmark keywords list (including stadium, arena, etc.)
    const landmarkKeywords = [
      'market', 'museum', 'palace', 'cathedral', 'church', 'tower', 'bridge', 'park', 'garden', 
      'basilica', 'monument', 'basílica', 'sagrada', 'stadium', 'arena', 'coliseum', 'theater', 
      'theatre', 'opera', 'temple', 'mosque', 'synagogue', 'shrine', 'fort', 'castle', 'square',
      'plaza', 'fountain', 'memorial', 'zoo', 'aquarium', 'library', 'university', 'hospital',
      'station', 'airport', 'hotel', 'resort', 'mall', 'central market', 'sagrada família', 'mestalla'
    ];
    
    // Helper to check if a string is likely a landmark
    const isLikelyLandmark = (dest: string): boolean => {
      if (!dest) return false;
      const destLower = dest.toLowerCase();
      return landmarkKeywords.some(keyword => destLower.includes(keyword));
    };
    
    // Validate destination_city - if it's a landmark, ignore it and extract fresh
    if (tripDetails.destination_city && isLikelyLandmark(tripDetails.destination_city)) {
      console.warn(`[smart-itinerary] destination_city "${tripDetails.destination_city}" is a landmark. Will extract fresh city name.`);
      cityName = tripDetails.destination_name || tripDetails.title; // Fall back to destination_name or title
    }
    
    // If cityName is still a landmark (destination_city was a landmark OR destination_name is a landmark), try multiple extraction methods
    if (isLikelyLandmark(cityName) && (cityName === tripDetails.destination_name || cityName === tripDetails.destination_city)) {
      let extractedCity: string | null = null;
      
      // Method 1: Try reverse geocoding from coordinates (most reliable)
      if (tripDetails.center_lat && tripDetails.center_lng && GOOGLE_MAPS_API_KEY) {
        try {
          const { getCityFromLatLng } = await import('@/lib/google/places-server');
          extractedCity = await getCityFromLatLng(tripDetails.center_lat, tripDetails.center_lng);
          if (extractedCity && !isLikelyLandmark(extractedCity)) {
            console.log(`[smart-itinerary] Extracted city "${extractedCity}" from coordinates for landmark "${tripDetails.destination_name}"`);
            cityName = extractedCity;
            // Update the trip's destination_city in the database for future use
            await supabase
              .from('trips')
              // @ts-ignore - Supabase type inference issue
              .update({ destination_city: extractedCity })
              .eq('id', tripId);
          } else if (extractedCity) {
            console.warn(`[smart-itinerary] Reverse geocoding returned landmark "${extractedCity}". Trying place details method.`);
            extractedCity = null; // Reset to try next method
          }
        } catch (err) {
          console.error('[smart-itinerary] Error getting city from coordinates:', err);
        }
      }
      
      // Method 2: If reverse geocoding failed, try getting place details from destination_place_id
      if (!extractedCity && tripDetails.destination_place_id && GOOGLE_MAPS_API_KEY) {
        try {
          const { getPlaceDetails } = await import('@/lib/google/places-server');
          const placeDetails = await getPlaceDetails(tripDetails.destination_place_id);
          if (placeDetails?.formatted_address) {
            // Extract city from formatted_address (usually second-to-last component before country)
            const addressParts = placeDetails.formatted_address.split(',').map((s: string) => s.trim());
            if (addressParts.length >= 2) {
              // Try each part from the end, looking for one that's not a landmark
              for (let i = addressParts.length - 2; i >= 0; i--) {
                const candidate = addressParts[i];
                if (candidate && !isLikelyLandmark(candidate) && candidate.length > 2) {
                  extractedCity = candidate;
                  console.log(`[smart-itinerary] Extracted city "${extractedCity}" from place details address: "${placeDetails.formatted_address}"`);
                  cityName = extractedCity;
                  // Update the trip's destination_city
                  await supabase
                    .from('trips')
                    // @ts-ignore - Supabase type inference issue
                    .update({ destination_city: extractedCity })
                    .eq('id', tripId);
                  break;
                }
              }
            }
          }
        } catch (err) {
          console.error('[smart-itinerary] Error getting place details:', err);
        }
      }
      
      // Method 3: Final fallback - if still a landmark, try reverse geocoding from center_lat/lng one more time
      if (!extractedCity && isLikelyLandmark(cityName) && tripDetails.center_lat && tripDetails.center_lng && GOOGLE_MAPS_API_KEY) {
        try {
          const { getCityFromLatLng } = await import('@/lib/google/places-server');
          const cityFromCoords = await getCityFromLatLng(tripDetails.center_lat, tripDetails.center_lng);
          if (cityFromCoords && !isLikelyLandmark(cityFromCoords)) {
            console.log(`[smart-itinerary] Final attempt: Extracted city "${cityFromCoords}" from coordinates`);
            cityName = cityFromCoords;
            await supabase
              .from('trips')
              // @ts-ignore - Supabase type inference issue
              .update({ destination_city: cityFromCoords })
              .eq('id', tripId);
          }
        } catch (err) {
          console.error('[smart-itinerary] Error in final reverse geocoding attempt:', err);
        }
      }
      
      // CRITICAL: If we STILL have a landmark after all attempts, this is a critical error
      if (isLikelyLandmark(cityName)) {
        console.error(`[smart-itinerary] CRITICAL ERROR: Could not extract city from landmark "${cityName}" after all extraction methods. This will result in incorrect itinerary titles. Trip ID: ${tripId}`);
        // At this point, we'll have to rely on the AI prompt and title sanitization
        // But we should NOT pass a landmark to the AI - it will generate landmark-based titles
        // However, without a city name, we can't proceed. So we'll pass it anyway and rely on sanitization
      }
    }
    
    // Final validation: Ensure cityName is not still a landmark (should have been fixed above)
    if (isLikelyLandmark(cityName) && cityName === tripDetails.destination_name) {
      console.error(`[smart-itinerary] VALIDATION FAILED: cityName "${cityName}" is still a landmark. All extraction methods failed.`);
    }
    
    // Helper to sanitize and fix itinerary titles
    const sanitizeItineraryTitle = (title: string, cityName: string): string => {
      if (!title) return `${cityName} Trip`;
      
      const titleLower = title.toLowerCase();
      const cityLower = cityName.toLowerCase();
      
      // Remove "Trip" suffix if present to normalize
      let normalized = title.replace(/\s*(Trip|trip)$/i, '').trim();
      
      // If title already starts with city name, just add "Trip"
      if (titleLower.startsWith(cityLower) && !isLikelyLandmark(cityName)) {
        return `${cityName} Trip`;
      }
      
      // Check if title contains landmark patterns (use the same comprehensive list)
      const hasLandmarkKeyword = landmarkKeywords.some(keyword => titleLower.includes(keyword));
      
      if (hasLandmarkKeyword) {
        // CRITICAL: If title is a landmark without "of" pattern (e.g., "Mestalla Stadium Trip"),
        // just use the provided cityName directly - it should already be extracted from coordinates
        // Try to extract city from "X of Y" pattern first (e.g., "Central Market of Valencia" -> "Valencia")
        const ofPatterns = [
          /\bof\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)(?:\s*,|\s*$)/i,  // "of Valencia" or "of Valencia, Spain" - after normalization
          /\bof\s+([^,\s]+(?:\s+[^,\s]+)?)(?:\s*$|,)/i,  // More general: "of [city name]" followed by comma or end
          /\bof\s+(.+?)(?:\s*$|,)/i,  // Most general: "of [anything]" until end or comma
        ];
        
        let extractedCity: string | null = null;
        for (const pattern of ofPatterns) {
          const ofMatch = normalized.match(pattern);
          if (ofMatch && ofMatch[1]) {
            let candidate = ofMatch[1].trim();
            candidate = candidate.replace(/\s*(Trip|trip)$/i, '').trim();
            const candidateLower = candidate.toLowerCase();
            // Make sure it's not another landmark keyword
            if (candidate && !isLikelyLandmark(candidate)) {
              extractedCity = candidate;
              break;
            }
          }
        }
        
        // If no "of" pattern found, check comma-separated format
        if (!extractedCity && normalized.includes(',')) {
          const parts = normalized.split(',').map(s => s.trim());
          if (parts.length > 1) {
            const firstPartLower = parts[0].toLowerCase();
            if (isLikelyLandmark(parts[0])) {
              const cityCandidate = parts[1].trim();
              if (!isLikelyLandmark(cityCandidate)) {
                extractedCity = cityCandidate;
              }
            }
          }
        }
        
        // If we still couldn't extract, use the provided cityName (should be from reverse geocoding)
        if (extractedCity) {
          console.log(`[sanitizeItineraryTitle] Extracted city "${extractedCity}" from title "${title}"`);
          return `${extractedCity} Trip`;
        } else {
          // CRITICAL FALLBACK: If provided cityName is also a landmark, we can't use it
          // Try one more time to extract from the title itself
          if (isLikelyLandmark(cityName)) {
            // If the provided cityName is also a landmark, we're in trouble
            // Try to find any city name pattern in the normalized title
            // For patterns like "Mestalla Stadium", we need to know it's in Valencia
            // Since we can't extract without context, log error and use a safe fallback
            console.error(`[sanitizeItineraryTitle] CRITICAL: Both title "${title}" and cityName "${cityName}" are landmarks. Cannot extract city.`);
            
            // Try reverse geocoding from coordinates if available (but we should have done this already)
            // For now, if title contains known city patterns, try to extract
            // Otherwise, we'll have to rely on the AI not generating this title in the first place
            // The real fix is to ensure cityName is ALWAYS a valid city before calling this function
            
            // Emergency fallback: If title is "X Stadium Trip" or similar, try to extract context
            // But without coordinates or more context, we can't reliably extract the city
            // So we'll return the cityName anyway, but log a critical error
            return `${cityName} Trip`; // This will be wrong, but better than crashing
          } else {
            // Provided cityName is valid, use it
            console.warn(`[sanitizeItineraryTitle] Could not extract city from landmark title "${title}", using provided cityName: "${cityName}"`);
            return `${cityName} Trip`;
          }
        }
      }
      
      // If no landmark detected but title doesn't match city, use city name
      if (!titleLower.includes(cityLower)) {
        return `${cityName} Trip`;
      }
      
      // Title looks okay, just ensure "Trip" suffix
      return `${normalized} Trip`;
    };
    
    // cityName already extracted above with async extractCityName

    // CRITICAL VALIDATION: Ensure cityName is not a landmark before passing to AI
    // If it's still a landmark after all extraction attempts, try one final extraction method
    if (isLikelyLandmark(cityName)) {
      console.error(`[smart-itinerary] CRITICAL: cityName "${cityName}" is still a landmark after all extraction attempts. Attempting final extraction.`);
      
      // Final attempt 1: If we have destination_place_id, get place details and extract city from formatted_address
      if (tripDetails.destination_place_id && GOOGLE_MAPS_API_KEY && !cityName.includes('Valencia')) {
        try {
          const { getPlaceDetails } = await import('@/lib/google/places-server');
          const placeDetails = await getPlaceDetails(tripDetails.destination_place_id);
          if (placeDetails?.formatted_address) {
            const addressParts = placeDetails.formatted_address.split(',').map((s: string) => s.trim());
            console.log(`[smart-itinerary] Final extraction - address parts from place_id:`, addressParts);
            // Try each part from second-to-last backwards
            for (let i = addressParts.length - 2; i >= 0; i--) {
              const candidate = addressParts[i];
              if (candidate && candidate.length > 2 && !isLikelyLandmark(candidate)) {
                // Skip street names and numbers
                const hasNumber = /\d/.test(candidate);
                const streetKeywords = ['avenida', 'calle', 'street', 'avenue', 'road', 'boulevard', 'lane', 'plaza', 'square'];
                const isStreet = streetKeywords.some(keyword => candidate.toLowerCase().includes(keyword));
                
                if (!hasNumber && !isStreet) {
                  cityName = candidate;
                  console.log(`[smart-itinerary] Final extraction: Using "${cityName}" from place details formatted_address`);
                  // Update destination_city
                  await supabase
                    .from('trips')
                    // @ts-ignore - Supabase type inference issue
                    .update({ destination_city: cityName })
                    .eq('id', tripId);
                  break;
                }
              }
            }
          }
        } catch (err) {
          console.error('[smart-itinerary] Error in final place details extraction:', err);
        }
      }
      
      // Final attempt 2: If still a landmark and we have coordinates, try reverse geocoding ONE MORE TIME
      if (isLikelyLandmark(cityName) && tripDetails.center_lat && tripDetails.center_lng && GOOGLE_MAPS_API_KEY) {
        try {
          const { getCityFromLatLng } = await import('@/lib/google/places-server');
          const cityFromCoords = await getCityFromLatLng(tripDetails.center_lat, tripDetails.center_lng);
          if (cityFromCoords && !isLikelyLandmark(cityFromCoords)) {
            console.log(`[smart-itinerary] FINAL FINAL extraction: Using "${cityFromCoords}" from coordinates (was: "${cityName}")`);
            cityName = cityFromCoords;
            // Update destination_city
            await supabase
              .from('trips')
              // @ts-ignore - Supabase type inference issue
              .update({ destination_city: cityName })
              .eq('id', tripId);
          } else if (cityFromCoords) {
            console.error(`[smart-itinerary] FINAL FINAL extraction failed: Reverse geocoding returned landmark "${cityFromCoords}"`);
          }
        } catch (err) {
          console.error('[smart-itinerary] Error in final final reverse geocoding:', err);
        }
      }
      
      // If STILL a landmark after ALL attempts, this is a critical error
      if (isLikelyLandmark(cityName)) {
        console.error(`[smart-itinerary] CRITICAL ERROR: Could not extract city from landmark "${cityName}" after ALL extraction methods including final attempts. Trip ID: ${tripId}. This will likely result in an incorrect itinerary title.`);
        // At this point, we cannot proceed safely - we'll rely on AI prompt instructions and post-processing
        // But we should NOT use the landmark as the destination - we need a valid city name
      }
    }

    const tripMeta = {
      destination: cityName, // Use extracted city name (WARNING: May still be landmark if ALL extraction methods failed)
      dates: `${new Date(tripDetails.start_date).toDateString()} - ${new Date(tripDetails.end_date).toDateString()}`,
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

    const languageInstructions = language === 'es' 
      ? 'Eres un planificador de viajes experto. Responde siempre en español claro y natural para todos los campos de texto (títulos, resúmenes, descripciones, etc.).'
      : 'You are an expert travel planner. Always respond in natural English for all text fields (titles, summaries, descriptions, etc.).';

    const system = `
      ${languageInstructions}

      You are an expert travel planner. Generate a multi-day travel itinerary as JSON matching the SmartItinerary schema.

      RULES:
      ${structureInstructions}
      
      1. Trip Title:
         - CRITICAL PRIORITY #1 - ABSOLUTE REQUIREMENT: The trip title MUST ALWAYS be city-based ONLY (e.g., "Valencia Trip", "Barcelona Trip", "Madrid Trip", "Paris Trip")
         - NEVER EVER use a landmark, place, POI, stadium, arena, market, museum, or any specific location name in the title - THIS IS FORBIDDEN
         - NEVER use titles like "Central Market of Valencia Trip", "Mestalla Stadium Trip", "Sagrada Família Trip", "Basílica Trip", "Stadium Trip", or ANY landmark-based title
         - The destination provided in tripMeta ("${cityName}") might be a landmark or place - you MUST determine the city it's located in and use ONLY that city name
         - CRITICAL: If the destination is "Mestalla Stadium", you MUST use "Valencia Trip" (Mestalla Stadium is in Valencia)
         - CRITICAL: If the destination is "Central Market of Valencia", you MUST use "Valencia Trip" (extract the city name)
         - CRITICAL: If the destination is "Sagrada Família", you MUST use "Barcelona Trip" (Sagrada Família is in Barcelona)
         - The format MUST ALWAYS be: "[CityName] Trip" (e.g., "Valencia Trip", NEVER "Mestalla Stadium Trip", NEVER "Central Market of Valencia Trip")
         - If dates exist, you may optionally format as: "Valencia Trip" or "Valencia · Dec 19 to 20" (ALWAYS city-based, NEVER landmark-based)
         - Plan the ENTIRE itinerary for the WHOLE city - include many different areas, neighborhoods, landmarks, markets, museums, parks, and activities across the entire city
         - The itinerary must show diverse activities from across the entire city, not focus on one single landmark
         - Landmarks and places (like Mestalla Stadium, Central Market, etc.) are just individual activities within the larger city itinerary - they are NOT the trip destination
         - The title must reflect the ENTIRE city destination, not any single place or activity within it
         - CRITICAL: Even if the destination provided is a landmark (like "Mestalla Stadium"), you must create an itinerary for the entire city (Valencia), with that landmark being just one of many diverse activities across the city
      
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
         - Never use the tilde character "~" for approximations; write "about" or "around" instead.
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
        - In each slot's "summary": Return a structured object (NOT paragraphs) with:
          {
            "block_title": string,        // Specific anchor like "Buda Castle + Fisherman's Bastion" (mention actual POIs from this slot)
            "what_to_do": string[],      // 2-4 bullets, each MUST mention a specific POI/area from the slot's places array
            "local_insights": string,     // REQUIRED: 200-320 words (1-2 paragraphs) of practical, city-specific insights unique to this slot/time-of-day. Must be different from other slots - no generic filler or repeated advice.
            "move_between": string,       // 1 short sentence with specific transport (metro line/station names) or walk distance
            "getting_around": string,     // Optional: 1-2 sentences describing realistic transit mode for that specific area (e.g., "The area is best explored on foot, but Metro Line 3 connects nearby")
            "cost_note": string | null,   // Optional; ONLY include if truly relevant: well-known ticketed attractions (e.g., Sagrada Familia), transit passes, or very specific expenses tied to that slot. NEVER use generic ranges like "€10-€30"
            "heads_up": string            // 1 unique caution for this block; must NOT repeat any heads_up from other blocks in the same day OR across days
          }
          
          CRITICAL ANTI-REPETITION RULES (enforce strictly):
          - Within the same trip, do NOT repeat the same sentence structures across slots ("Start your morning…", "Move between stops…", "Refuel close by…")
          - Do NOT repeat the same generic advice ("book ahead", "avoid crowds", "carry cash") unless it's genuinely tied to that POI/area AND phrased completely differently
          - Avoid repeating the same price ranges every slot. Only include cost_note when:
              a) it's a well-known ticketed attraction (e.g., Sagrada Familia),
              b) or a transit pass, or
              c) a very specific expense tied to that slot.
            Otherwise omit cost_note entirely.
          - heads_up must be unique per slot AND not reused across days
          - local_insights must be 200-320 words and contain practical, city-specific information that differs meaningfully from other slots. No generic filler.
          - Each "what_to_do" bullet MUST reference at least one specific place from the slot's places array
          - If you cannot be specific, output fewer bullets rather than generic advice
          - Reference actual POI names, neighborhoods, and specific details from the places in this slot
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
         - In each place's "description" (2-4 sentences): Be specific and helpful with practical info, what makes it special, opening hours (with peak/quiet times), typical ticket/entry cost or free info, nearby food or coffee suggestions, and quick movement guidance (walk vs metro/bus with line/station names when relevant).
         - Use "visited" = false for all places.
         - Fill "tags" with relevant keywords.
         - CRITICAL: You MUST include the "cityOverview" field with structured practical information. This is a REQUIRED field, not optional.
         - The cityOverview should contain the same information as the summary but in a structured format for quick reference.
         - Extract information about airports, transportation, budget, best time to visit, neighborhoods, and advance planning from your knowledge of the destination.
         - Fill in all relevant sections of cityOverview based on the destination. If some information is not available, you may omit specific fields, but the cityOverview object itself must be present.
      
      3. EXACT JSON SCHEMA (you MUST return exactly this structure):
      {
        "title": string (CRITICAL: MUST be city-based only, e.g., "Valencia Trip" - NEVER include landmarks/places in title),
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
                "summary": {
                  "block_title": string,
                  "what_to_do": string[],
                  "local_insights": string (200-320 words, 1-2 paragraphs),
                  "move_between": string,
                  "getting_around": string (optional),
                  "cost_note": string | null,
                  "heads_up": string
                },
                "places": [
                  {
                    "id": string (UUID),
                    "name": string,
                    "description": string,
                    "area": string,
                    "neighborhood": string | null,
                    "photos": string[],
                    "visited": boolean (always false),
                    "tags": string[],
                    "place_id": string (optional, Google Places place_id - include when available for accurate photo fetching)
                  }
                ]
              }
            ]
          }
        ],
        "tripTips": string[],
        "cityOverview": {
          "gettingThere": {
            "airports": string[] (main airport names),
            "distanceToCity": string (e.g., "15 km from city center"),
            "transferOptions": string[] (e.g., ["AirTrain + Subway", "Taxi", "Airport Shuttle"])
          },
          "gettingAround": {
            "publicTransport": string (e.g., "Metro system with 12 lines, single ride €2.40"),
            "walkability": string (e.g., "Highly walkable, most attractions within 2-3 km"),
            "taxiRideshare": string (e.g., "Taxis available, Uber/Lyft operate, typical ride €10-20")
          },
          "budgetGuide": {
            "budgetDaily": string (e.g., "€40-60 per person"),
            "midRangeDaily": string (e.g., "€80-120 per person"),
            "luxuryDaily": string (e.g., "€200+ per person"),
            "transportPass": string (e.g., "7-day Metro pass €35")
          },
          "bestTimeToVisit": {
            "bestMonths": string (e.g., "April-June, September-October"),
            "shoulderSeason": string (e.g., "March, November"),
            "peakLowSeason": string (e.g., "Peak: July-August, Low: January-February")
          },
          "whereToStay": [
            {
              "neighborhood": string (e.g., "Gothic Quarter"),
              "description": string (e.g., "Historic center, walkable to major sights, vibrant nightlife")
            }
          ],
          "advancePlanning": {
            "bookEarly": string[] (e.g., ["Popular museums", "Restaurant reservations", "Day trips"]),
            "spontaneous": string[] (e.g., ["Local markets", "Street food", "Neighborhood walks"])
          }
        } (REQUIRED - extract structured practical info from the summary and your knowledge of the destination)
      }
      
      3a. Place Identification:
         - CRITICAL: Include "place_id" (Google Places place_id) for each place when available
         - The place_id enables accurate photo fetching and prevents wrong images
         - If you know the Google place_id for a place, always include it in the place object
         - This is especially important for well-known places, landmarks, restaurants, and attractions
         - Example: If planning "Sagrada Família", include its Google place_id if known
         - If place_id is not available, you may omit it, but photo fetching will be less reliable
      
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
    
    // CRITICAL: Add explicit instruction if destination might still be a landmark
    if (isLikelyLandmark(cityName)) {
      userPrompt += `\n\nCRITICAL WARNING: The destination "${cityName}" appears to be a landmark, not a city. You MUST determine which city this landmark is located in and use ONLY that city name for the trip title. For example:\n`;
      userPrompt += `- If destination is "Mestalla Stadium", use "Valencia Trip" (Mestalla Stadium is in Valencia, Spain)\n`;
      userPrompt += `- If destination is "Central Market of Valencia", use "Valencia Trip" (extract the city name)\n`;
      userPrompt += `- If destination is "Sagrada Família", use "Barcelona Trip" (Sagrada Família is in Barcelona, Spain)\n`;
      userPrompt += `- If destination is "Eiffel Tower", use "Paris Trip" (Eiffel Tower is in Paris, France)\n`;
      userPrompt += `NEVER use the landmark name in the title. ALWAYS use the city name only.\n\n`;
    }
    
    userPrompt += `Generate the full itinerary.`;

    console.log('[smart-itinerary] generating itinerary for trip', tripId);

    // Use the extracted city name (already processed above)
    const destination = cityName; // Use extracted cityName from tripMeta
    const cityOrArea = destination;

    // Create a streaming response using Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        let controllerClosed = false;
        
        // Helper to safely close the controller
        const safeClose = () => {
          if (!controllerClosed) {
            try {
              controller.close();
              controllerClosed = true;
            } catch (err: any) {
              // Controller might already be closed (e.g., client disconnected)
              if (err?.code !== 'ERR_INVALID_STATE' && !(err instanceof TypeError)) {
                throw err;
              }
              controllerClosed = true;
            }
          }
        };
        
        let accumulatedText = '';
        let cleanTitle = '';
        let cleanSummary = '';
        let cleanCityOverview: any = undefined;
        
        try {
          let lastSentDayIndex = -1;
          let sentDayIndices = new Set<number>(); // Track sent day indices to prevent duplicates
          let sentDayUpdatedIndices = new Set<number>(); // One day-updated per day index to avoid duplicate emissions
          let validatedItinerary: SmartItinerary | null = null;
          let titleSent = false;
          let summarySent = false;
          let cityOverviewSent = false;
          let cityOverviewExtracted = false; // Track if cityOverview was extracted from stream (even if missing)

          // PHASE 1A: Generate title and summary first, emit immediately so UI can show intro
          console.log('[smart-itinerary] Phase 1A: Generating title/summary');
          const phase1aSchema = z.object({
            title: z.string(),
            summary: z.string(),
          });
          const phase1aSystem = `
            ${languageInstructions}

            You are an expert travel planner. Generate ONLY the title and summary for a trip.

            RULES:
            1. Trip Title:
               - CRITICAL PRIORITY #1 - ABSOLUTE REQUIREMENT: The trip title MUST ALWAYS be city-based ONLY (e.g., "Valencia Trip", "Barcelona Trip", "Madrid Trip", "Paris Trip")
               - NEVER EVER use a landmark, place, POI, stadium, arena, market, museum, or any specific location name in the title - THIS IS FORBIDDEN
               - The destination provided might be a landmark - you MUST determine which city it's located in and use ONLY that city name
               - The format MUST ALWAYS be: "[CityName] Trip"
            
            2. Summary:
               - CRITICAL: The "summary" field is the most important briefing text. It must include ALL of the following information in a comprehensive, detailed paragraph:
                 * Airport-to-city transportation: Provide EXACT details including the specific train/bus line name or number, departure station name and location, destination station name, duration, frequency, and approximate cost.
                 * Weather conditions and clothing recommendations: Describe the typical weather during the trip dates and what clothing/accessories travelers should pack.
                 * Seasonal activities and events: List specific events, festivals, markets, or seasonal activities happening during the trip dates.
                 * Local holidays and festivals: Mention any public holidays, cultural celebrations, or special events during the trip dates.
                 * Practical city-specific tips: Include information about local customs, tipping culture, best times to visit attractions, common scams to avoid, useful apps, currency, and any other practical information.
               - Never use the tilde character "~" for approximations; write "about" or "around" instead.

            OUTPUT ONLY JSON: { "title": string, "summary": string }
          `;
          const phase1aUserPrompt = `Trip details:\n${JSON.stringify(tripMeta)}\n\nGenerate ONLY the title and summary for this trip.`;
          const phase1aResult = await generateObject({
            model: openai('gpt-4o-mini'),
            system: phase1aSystem,
            prompt: phase1aUserPrompt,
            schema: phase1aSchema,
            temperature: 0.7,
          });
          const phase1aData = phase1aResult.object;
          const sanitizedTitle = sanitizeItineraryTitle(phase1aData.title, destination);
          cleanTitle = sanitizeNoTilde(sanitizedTitle);
          sendSSE(controller, 'title', cleanTitle);
          titleSent = true;
          cleanSummary = sanitizeNoTilde(phase1aData.summary);
          console.log('[smart-itinerary] Phase 1A: Emitting summary event');
          sendSSE(controller, 'summary', cleanSummary);
          summarySent = true;

          // PHASE 1B: Generate cityOverview in a second call, then emit
          console.log('[smart-itinerary] Phase 1B: Generating cityOverview');
          const phase1bSchema = z.object({
            cityOverview: z.object({
              gettingThere: z.object({
                airports: z.array(z.string()),
                distanceToCity: z.string(),
                transferOptions: z.array(z.string()),
              }),
              gettingAround: z.object({
                publicTransport: z.string(),
                walkability: z.string(),
                taxiRideshare: z.string(),
              }),
              budgetGuide: z.object({
                budgetDaily: z.string(),
                midRangeDaily: z.string(),
                luxuryDaily: z.string(),
                transportPass: z.string(),
              }),
              bestTimeToVisit: z.object({
                bestMonths: z.string(),
                shoulderSeason: z.string(),
                peakLowSeason: z.string(),
              }),
              whereToStay: z.array(z.object({
                neighborhood: z.string(),
                description: z.string(),
              })),
              advancePlanning: z.object({
                bookEarly: z.array(z.string()),
                spontaneous: z.array(z.string()),
              }),
            }),
          });
          const phase1bSystem = `
            ${languageInstructions}

            You are an expert travel planner. The trip title and summary have already been generated. Generate ONLY the cityOverview with structured practical information.

            RULES:
            - CRITICAL: You MUST include the "cityOverview" field with structured practical information. This is a REQUIRED field.
            - Extract information about airports, transportation, budget, best time to visit, neighborhoods, and advance planning from your knowledge of the destination.
            - Fill in all relevant sections based on the destination.

            OUTPUT ONLY JSON matching this schema:
            {
              "cityOverview": {
                "gettingThere": { "airports": string[], "distanceToCity": string, "transferOptions": string[] },
                "gettingAround": { "publicTransport": string, "walkability": string, "taxiRideshare": string },
                "budgetGuide": { "budgetDaily": string, "midRangeDaily": string, "luxuryDaily": string, "transportPass": string },
                "bestTimeToVisit": { "bestMonths": string, "shoulderSeason": string, "peakLowSeason": string },
                "whereToStay": [{ "neighborhood": string, "description": string }],
                "advancePlanning": { "bookEarly": string[], "spontaneous": string[] }
              }
            }
          `;
          const phase1bUserPrompt = `Trip details:\n${JSON.stringify(tripMeta)}\n\nGenerate ONLY the cityOverview (structured practical info) for this trip.`;
          const phase1bResult = await generateObject({
            model: openai('gpt-4o-mini'),
            system: phase1bSystem,
            prompt: phase1bUserPrompt,
            schema: phase1bSchema,
            temperature: 0.7,
          });
          cleanCityOverview = sanitizeNoTilde(phase1bResult.object.cityOverview);
          console.log('[smart-itinerary] Phase 1B: Emitting cityOverview event');
          sendSSE(controller, 'cityOverview', cleanCityOverview);
          cityOverviewSent = true;
          cityOverviewExtracted = true;

          console.log('[smart-itinerary] Phase 1 complete, starting Phase 2 (days generation)');

          // PHASE 2: Generate days progressively (streaming)
          // Update system prompt for Phase 2 to focus on days only
          const phase2System = `
            ${languageInstructions}

            You are an expert travel planner. Generate ONLY the days array for a travel itinerary.

            RULES:
            ${structureInstructions}
            
            IMPORTANT: The title, summary, and cityOverview have already been generated. You ONLY need to generate the days array.

            For each day:
            - Include id (UUID), index (1-based), date (ISO), title, theme, areaCluster, photos (empty array), overview, slots
            - Each slot should have label ("morning" | "afternoon" | "evening"), summary (structured object), and places array
            - Slot summary structure: { block_title, what_to_do (string[]), local_insights (200-320 words), move_between, getting_around (optional), cost_note (optional), heads_up }
            - Each place should have id (UUID), name, description, area, neighborhood (optional), photos (empty array), visited (false), tags, place_id (optional)

            OUTPUT ONLY JSON with this structure:
            {
              "days": [
                {
                  "id": string (UUID),
                  "index": number,
                  "date": string (ISO),
                  "title": string,
                  "theme": string,
                  "areaCluster": string,
                  "photos": [],
                  "overview": string,
                  "slots": [
                    {
                      "label": "morning" | "afternoon" | "evening",
                      "summary": { ... },
                      "places": [ ... ]
                    }
                  ]
                }
              ],
              "tripTips": string[]
            }
          `;

          const result = await streamText({
            model: openai('gpt-4o-mini'),
            system: phase2System,
            prompt: userPrompt + `\n\nIMPORTANT: The title, summary, and cityOverview have already been generated. Generate ONLY the days array and tripTips.`,
            temperature: 0.7,
          });

          // Process Phase 2 stream (days only)
          for await (const chunk of result.textStream) {
            accumulatedText += chunk;
            
            // Try to parse what we have so far (Phase 2 only generates days)
            const partial = extractCompleteObjects(accumulatedText);
            
            // Send days as they become complete - deduplicate by index to prevent duplicate Day 1
            // Note: cityOverview is already sent in Phase 1, so we can emit days immediately
            for (let i = lastSentDayIndex + 1; i < partial.days.length; i++) {
              const day = partial.days[i];
              // Check if day looks complete (has all required fields)
              // CRITICAL: Also check if we've already sent a day with this index
              if (day.id && day.index !== undefined && day.slots && Array.isArray(day.slots) && day.slots.length > 0) {
                // Skip if we've already sent a day with this index (prevents duplicate Day 1)
                if (sentDayIndices.has(day.index)) {
                  console.warn(`[smart-itinerary] Skipping duplicate day with index ${day.index} (ID: ${day.id})`);
                  lastSentDayIndex = i; // Still advance to avoid reprocessing
                  continue;
                }
                
                // Validate the day structure
                try {
                  // Send the day immediately (without photos for now) - progressive emission
                  const sanitizedDay = sanitizeNoTilde(day);
                  if (process.env.NODE_ENV === 'development') {
                    console.log(`[smart-itinerary] Emitting day ${day.index} event (progressive, cityOverview sent: ${cityOverviewSent}, extracted: ${cityOverviewExtracted})`);
                  }
                  sendSSE(controller, 'day', sanitizedDay);
                  sentDayIndices.add(day.index); // Track that we've sent this index
                  lastSentDayIndex = i;
                  // Only one day-updated per day index (avoid duplicate emissions from stream re-emits)
                  if (sentDayUpdatedIndices.has(day.index)) continue;
                  sentDayUpdatedIndices.add(day.index);
                  // Start fetching photos asynchronously in background
                  (async () => {
                    try {
                      const enrichedDay = { ...sanitizeNoTilde(day) };
                      const allPlaces = enrichedDay.slots.flatMap((slot: ItinerarySlot) => slot.places);
                      
                      // Step 1: Resolve/refresh place_ids (including invalid ones)
                      const idStats = await resolveMissingPlaceIds(allPlaces, cityOrArea);
                      
                      // Step 2: Enrich media (photo_reference or cached image)
                      let photoRefAdds = 0;
                      let cachedImages = 0;
                      for (const place of allPlaces) {
                        const result = await enrichPlaceMedia(place, {
                          cityOrArea,
                          tripId: tripId as string,
                          destinationCountry,
                          centerLat,
                          centerLng,
                        });
                        if (result.photoRef) photoRefAdds++;
                        if (result.imageUrl) cachedImages++;
                      }
                      
                      // Step 3: Apply safety guard to prevent duplicate photos for different places
                      await applyPhotoReferenceSafetyGuard(allPlaces, {
                        cityOrArea,
                        tripId: tripId as string,
                        destinationCountry,
                        centerLat,
                        centerLng,
                      });
                      
                      // Step 4: Build day photos from unique photo_references
                      enrichedDay.photos = deduplicateAndBuildPhotoUrls(allPlaces, 4);
                      
                      // Send updated day with photos
                      sendSSE(controller, 'day-updated', sanitizeNoTilde(enrichedDay));
                      console.log('[smart-itinerary] day-updated media stats', {
                        tripId,
                        dayIndex: enrichedDay.index,
                        refreshedPlaceIds: idStats.refreshed,
                        invalidPlaceIds: idStats.invalidated,
                        photoRefsAdded: photoRefAdds,
                        cachedImages,
                      });
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
                
                // Merge Phase 1 data (title, summary, cityOverview) with Phase 2 data (days, tripTips)
                const mergedData = {
                  title: cleanTitle, // Use Phase 1 title
                  summary: cleanSummary, // Use Phase 1 summary
                  cityOverview: cleanCityOverview, // Use Phase 1 cityOverview
                  days: parsed.days || [],
                  tripTips: parsed.tripTips || [],
                };
                
                validatedItinerary = smartItinerarySchema.parse(mergedData) as SmartItinerary;
                
                // Deduplicate days by index before sending (safety check)
                const deduplicatedDays = new Map<number, any>();
                for (const day of validatedItinerary.days) {
                  if (day.index !== undefined) {
                    // Keep the last occurrence of each index
                    deduplicatedDays.set(day.index, day);
                  }
                }
                validatedItinerary.days = Array.from(deduplicatedDays.values()).sort((a, b) => a.index - b.index);
                validatedItinerary = sanitizeNoTilde(validatedItinerary) as SmartItinerary;
                
                // Ensure all days were sent - check by index, not array position
                for (const day of validatedItinerary.days) {
                  if (day.index !== undefined && !sentDayIndices.has(day.index)) {
                    sendSSE(controller, 'day', sanitizeNoTilde(day));
                    sentDayIndices.add(day.index);
                  }
                }
                
                // Send tripTips if we have them
                if (validatedItinerary.tripTips && validatedItinerary.tripTips.length > 0) {
                  sendSSE(controller, 'tripTips', sanitizeNoTilde(validatedItinerary.tripTips));
                }
                
                // cityOverview was already sent in Phase 1, no need to send again
                
                // Final enrichment pass for any remaining photos
                const allPlaces = validatedItinerary.days.flatMap(day => 
                  day.slots.flatMap(slot => slot.places)
                );
                
                // Sanitize slot summaries to remove generic ranges and ensure uniqueness
                sanitizeSlotSummaries(validatedItinerary);

                // Step 1: Resolve/refresh place_ids (includes invalid ones)
                const idStats = await resolveMissingPlaceIds(allPlaces, cityOrArea);
                
                // Step 2: Enrich media (photo_reference or cached image)
                let photoRefAdds = 0;
                let cachedImages = 0;
                for (const place of allPlaces) {
                  const result = await enrichPlaceMedia(place, {
                    cityOrArea,
                    tripId: tripId as string,
                    destinationCountry,
                    centerLat,
                    centerLng,
                  });
                  if (result.photoRef) photoRefAdds++;
                  if (result.imageUrl) cachedImages++;
                }
                
                // Step 3: Apply safety guard to prevent duplicate photos for different places
                await applyPhotoReferenceSafetyGuard(allPlaces, {
                  cityOrArea,
                  tripId: tripId as string,
                  destinationCountry,
                  centerLat,
                  centerLng,
                });
                
                // DIAGNOSTIC LOGGING: Count items with place_id and photo_reference/image_url
                const placeIdCount = allPlaces.filter(p => p.place_id).length;
                const photoRefCount = allPlaces.filter(p => p.photo_reference).length;
                const cachedImageCount = allPlaces.filter(p => p.image_url).length;
                console.log('[smart-itinerary] Diagnostic counts:', {
                  totalPlaces: allPlaces.length,
                  placesWithPlaceId: placeIdCount,
                  placesWithPhotoReference: photoRefCount,
                  placesWithCachedImage: cachedImageCount,
                  refreshedPlaceIds: idStats.refreshed,
                  invalidPlaceIds: idStats.invalidated,
                  photoRefsAdded: photoRefAdds,
                  cachedImagesAdded: cachedImages,
                  tripId
                });
                
                // Step 4: Build day photos from unique media (cached URL preferred)
                for (const day of validatedItinerary.days) {
                  const dayPlaces = day.slots.flatMap(slot => slot.places);
                  day.photos = deduplicateAndBuildPhotoUrls(dayPlaces, 4);
                }
                validatedItinerary = sanitizeNoTilde(validatedItinerary) as SmartItinerary;
                
                // Save to Supabase (trip-level row so GET/backfill find it)
                const { error: saveError } = await (supabase
                  .from('smart_itineraries') as any)
                  .upsert(
                    {
                      trip_id: tripId,
                      trip_segment_id: null,
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

                  try {
                    await trySendTripReadyEmail({
                      supabase,
                      tripId: tripId as string,
                    });
                  } catch (emailError) {
                    console.error('[smart-itinerary] Failed to send trip ready email:', emailError);
                  }
                  
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
                  if (mustIncludePlaceIds.length > 0 && profileId && tripId) {
                    try {
                      await clearLikedPlacesAfterRegeneration(tripId as string, profileId as string);
                      console.log('[smart-itinerary] cleared liked places after regeneration');
                    } catch (err) {
                      console.error('[smart-itinerary] error clearing liked places:', err);
                    }
                  }
                  
                  // Send final complete message
                  sendSSE(controller, 'complete', sanitizeNoTilde(validatedItinerary));
                }
              } catch (parseError: any) {
                // Log detailed error information for debugging
                const errorDetails = {
                  error: parseError?.message || String(parseError),
                  stack: parseError?.stack,
                  name: parseError?.name,
                  zodIssues: parseError?.issues || parseError?.errors,
                  accumulatedTextLength: accumulatedText?.length,
                  accumulatedTextPreview: accumulatedText?.substring(0, 1000), // First 1000 chars for debugging
                };
                console.error('[smart-itinerary] Error parsing/validating final JSON:', errorDetails);
                
                // Try to save partial itinerary so backfill can run
                try {
                  let days: any[] = [];
                  try {
                    const parsed = JSON.parse(accumulatedText);
                    if (parsed?.days && Array.isArray(parsed.days)) days = parsed.days;
                  } catch {
                    const partial = extractCompleteObjects(accumulatedText);
                    if (partial?.days?.length) days = partial.days;
                  }
                  const validDays = days.filter((d: any) => d?.id != null && d?.index != null && Array.isArray(d?.slots));
                  if (validDays.length > 0) {
                    const partialItinerary: SmartItinerary = {
                      title: cleanTitle || 'Trip',
                      summary: cleanSummary || '',
                      days: validDays,
                      tripTips: [],
                    };
                    const { error: saveErr } = await upsertSmartItinerary(tripId as string, partialItinerary);
                    if (!saveErr) console.log('[smart-itinerary] Saved partial itinerary on parse error');
                  }
                } catch (partialSaveErr: any) {
                  console.warn('[smart-itinerary] Could not save partial itinerary:', partialSaveErr?.message);
                }
                
                sendSSE(controller, 'error', { 
                  message: 'Failed to parse itinerary',
                  details: parseError.message 
                });
              }
            }
          }
          
          // If we didn't get complete JSON, try to parse what we have
          if (!validatedItinerary && accumulatedText) {
            let parsed: any = null;
            try {
              parsed = JSON.parse(accumulatedText);
              
              // Merge Phase 1 data (title, summary, cityOverview) with Phase 2 data (days, tripTips)
              const mergedData = {
                title: cleanTitle, // Use Phase 1 title
                summary: cleanSummary, // Use Phase 1 summary
                cityOverview: cleanCityOverview, // Use Phase 1 cityOverview
                days: parsed.days || [],
                tripTips: parsed.tripTips || [],
              };
              
              // Deduplicate days by index before validation
              if (mergedData.days && Array.isArray(mergedData.days)) {
                const indexMap = new Map<number, any>();
                for (const day of mergedData.days) {
                  if (day.index !== undefined) {
                    indexMap.set(day.index, day);
                  }
                }
                mergedData.days = Array.from(indexMap.values()).sort((a, b) => a.index - b.index);
              }
              
              validatedItinerary = smartItinerarySchema.parse(mergedData) as SmartItinerary;
              validatedItinerary = sanitizeNoTilde(validatedItinerary);
              
              // Enrich photos
              const allPlaces = validatedItinerary.days.flatMap(day => 
                day.slots.flatMap(slot => slot.places)
              );
              
              // Sanitize slot summaries to remove generic ranges and ensure uniqueness
              sanitizeSlotSummaries(validatedItinerary);

              // Step 1: Resolve/refresh place_ids
              const idStats = await resolveMissingPlaceIds(allPlaces, cityOrArea);
              
              // Step 2: Enrich media (photo_reference or cached image)
              let photoRefAdds = 0;
              let cachedImages = 0;
              for (const place of allPlaces) {
                const result = await enrichPlaceMedia(place, {
                  cityOrArea,
                  tripId: tripId as string,
                  destinationCountry,
                  centerLat,
                  centerLng,
                });
                if (result.photoRef) photoRefAdds++;
                if (result.imageUrl) cachedImages++;
              }
              
              // Step 3: Apply safety guard to prevent duplicate photos for different places
              await applyPhotoReferenceSafetyGuard(allPlaces, {
                cityOrArea,
                tripId: tripId as string,
                destinationCountry,
                centerLat,
                centerLng,
              });
              
              // DIAGNOSTIC LOGGING: Count items with place_id and photo_reference
              const placeIdCount = allPlaces.filter(p => p.place_id).length;
              const photoRefCount = allPlaces.filter(p => p.photo_reference).length;
              const cachedImageCount = allPlaces.filter(p => p.image_url).length;
              console.log('[smart-itinerary] Diagnostic counts (fallback parse):', {
                totalPlaces: allPlaces.length,
                placesWithPlaceId: placeIdCount,
                placesWithPhotoReference: photoRefCount,
                placesWithCachedImage: cachedImageCount,
                refreshedPlaceIds: idStats.refreshed,
                invalidPlaceIds: idStats.invalidated,
                photoRefsAdded: photoRefAdds,
                cachedImagesAdded: cachedImages,
                tripId
              });
              
              // Step 4: Build day photos from unique media (cached URL preferred)
              for (const day of validatedItinerary.days) {
                const dayPlaces = day.slots.flatMap(slot => slot.places);
                day.photos = deduplicateAndBuildPhotoUrls(dayPlaces, 4);
              }
              
              // Save (trip-level row so GET/backfill find it)
              const { error: saveError } = await (supabase
                .from('smart_itineraries') as any)
                .upsert(
                  {
                    trip_id: tripId,
                    trip_segment_id: null,
                    content: validatedItinerary,
                    updated_at: new Date().toISOString()
                  },
                  { onConflict: 'trip_id' },
                );
              
              if (!saveError) {
                try {
                  await trySendTripReadyEmail({
                    supabase,
                    tripId: tripId as string,
                  });
                } catch (emailError) {
                  console.error('[smart-itinerary] Failed to send trip ready email:', emailError);
                }

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
                
                sendSSE(controller, 'complete', sanitizeNoTilde(validatedItinerary));
              } else {
                sendSSE(controller, 'error', { message: 'Failed to save itinerary' });
              }
            } catch (err: any) {
              // Log detailed error information for debugging
              const errorDetails = {
                error: err?.message || String(err),
                stack: err?.stack,
                name: err?.name,
                zodIssues: err?.issues || err?.errors,
                accumulatedTextLength: accumulatedText?.length,
                accumulatedTextPreview: accumulatedText?.substring(0, 1000), // First 1000 chars for debugging
                parsedData: parsed ? JSON.stringify(parsed).substring(0, 500) : 'null', // Preview of parsed data
              };
              console.error('[smart-itinerary] Final parse error:', errorDetails);
              
              // Try to save partial itinerary so backfill can run
              try {
                let days: any[] = [];
                try {
                  const parsedErr = JSON.parse(accumulatedText);
                  if (parsedErr?.days && Array.isArray(parsedErr.days)) days = parsedErr.days;
                } catch {
                  const partial = extractCompleteObjects(accumulatedText);
                  if (partial?.days?.length) days = partial.days;
                }
                const validDays = days.filter((d: any) => d?.id != null && d?.index != null && Array.isArray(d?.slots));
                if (validDays.length > 0) {
                  const partialItinerary: SmartItinerary = {
                    title: cleanTitle || 'Trip',
                    summary: cleanSummary || '',
                    days: validDays,
                    tripTips: [],
                  };
                  const { error: saveErr } = await upsertSmartItinerary(tripId as string, partialItinerary);
                  if (!saveErr) console.log('[smart-itinerary] Saved partial itinerary on final parse error');
                }
              } catch (partialSaveErr: any) {
                console.warn('[smart-itinerary] Could not save partial itinerary:', partialSaveErr?.message);
              }
              
              sendSSE(controller, 'error', { 
                message: 'Failed to parse itinerary',
                details: err.message 
              });
            }
          }
          
          // cityOverview was already sent in Phase 1, so we don't need the missing sentinel
          // But keep it for backwards compatibility if Phase 1 somehow failed
          if (!cityOverviewSent && !cityOverviewExtracted) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[smart-itinerary] Phase 1 cityOverview was not sent - this should not happen');
            }
            sendSSE(controller, 'cityOverview_missing', null);
            cityOverviewExtracted = true;
          }
          
          safeClose();
        } catch (err: any) {
          console.error('[smart-itinerary] Stream error:', err);
          // Try to save partial itinerary so backfill can run
          try {
            if (accumulatedText) {
              const partial = extractCompleteObjects(accumulatedText);
              const validDays = (partial?.days || []).filter((d: any) => d?.id != null && d?.index != null && Array.isArray(d?.slots));
              if (validDays.length > 0) {
                const partialItinerary: SmartItinerary = {
                  title: cleanTitle || 'Trip',
                  summary: cleanSummary || '',
                  days: validDays,
                  tripTips: [],
                };
                const { error: saveErr } = await upsertSmartItinerary(tripId as string, partialItinerary);
                if (!saveErr) console.log('[smart-itinerary] Saved partial itinerary on stream error');
              }
            }
          } catch (partialSaveErr: any) {
            console.warn('[smart-itinerary] Could not save partial itinerary:', partialSaveErr?.message);
          }
          sendSSE(controller, 'error', { 
            message: 'Streaming error',
            details: err.message 
          });
          safeClose();
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
  let profileId: string | undefined;
  let tripId: string | undefined;

  try {
    tripId = (await params).tripId;
    const url = new URL(req.url);
    const rawMode = url.searchParams.get('mode') ?? 'load';
    const mode = (rawMode === 'load' || String(rawMode).toLowerCase().startsWith('load')) ? 'load' : rawMode;
    if (mode !== 'load') {
      return NextResponse.json({ error: 'unsupported-mode' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Smart Itinerary API]', {
        path: '/api/trips/[tripId]/smart-itinerary',
        method: 'GET',
        error: authError?.message || 'Failed to get profile',
        tripId,
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has access to trip
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("id, owner_id")
      .eq("id", tripId)
      .single();

    if (tripError || !tripData) {
      console.error('[Smart Itinerary API]', {
        path: '/api/trips/[tripId]/smart-itinerary',
        method: 'GET',
        tripId,
        profileId,
        error: tripError?.message || 'Trip not found',
        errorCode: tripError?.code,
        context: 'trip_lookup',
      });
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    type TripQueryResult = {
      id: string
      owner_id: string
    }

    const trip = tripData as TripQueryResult;

    // Check if user is owner or member
    const { data: member } = await supabase
      .from("trip_members")
      .select("id")
      .eq("trip_id", tripId)
      .eq("user_id", profileId)
      .single();

    if (trip.owner_id !== profileId && !member) {
      console.error('[Smart Itinerary API]', {
        path: '/api/trips/[tripId]/smart-itinerary',
        method: 'GET',
        tripId,
        profileId,
        error: 'Forbidden: User does not have access to this trip',
        check_failed: trip.owner_id !== profileId ? 'not_owner' : 'not_member',
        trip_owner_id: trip.owner_id,
        is_member: !!member,
        context: 'authorization_check',
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Load itinerary from database (trip-level only; same contract as getSmartItinerary)
    const { data, error } = await supabase
      .from('smart_itineraries')
      .select('content')
      .eq('trip_id', tripId)
      .is('trip_segment_id', null)
      .maybeSingle();

    if (error) {
      console.error('[smart-itinerary GET] supabase error', error);
      return NextResponse.json({ error: 'db-error' }, { status: 500 });
    }

    type ItineraryQueryResult = {
      content: any
    }

    const dataTyped = data as ItineraryQueryResult | null;

    if (!dataTyped?.content) {
      return NextResponse.json({ error: 'not-found' }, { status: 404 });
    }

    const itinerary = dataTyped.content as SmartItinerary;

    if (process.env.NODE_ENV === 'development') {
      console.log('[smart-itinerary GET] cityOverview check:', {
        hasCityOverview: !!itinerary.cityOverview,
        needsRegeneration: !itinerary.cityOverview
      });
    }

    // Merge activities from activities table into the smart itinerary
    // Get all days in the itinerary
    const dayIds = itinerary.days.map(day => day.id);

    if (dayIds.length > 0) {
      // Load all activities for these days
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select(`
          id,
          day_id,
          title,
          image_url,
          place:places(
            id,
            name,
            address,
            lat,
            lng,
            external_id
          )
        `)
        .in('day_id', dayIds)
        .order('order_number', { ascending: true });

      if (!activitiesError && activitiesData) {
        type ActivityWithPlace = {
          id: string;
          day_id: string;
          title: string;
          image_url: string | null;
          place: {
            id: string;
            name: string;
            address: string | null;
            lat: number | null;
            lng: number | null;
            external_id: string | null;
          } | null;
        };

        const activities = activitiesData as ActivityWithPlace[];

        // Group activities by day_id
        const activitiesByDay = new Map<string, ActivityWithPlace[]>();
        for (const activity of activities) {
          if (!activitiesByDay.has(activity.day_id)) {
            activitiesByDay.set(activity.day_id, []);
          }
          activitiesByDay.get(activity.day_id)!.push(activity);
        }

        // Add activities to the appropriate day and slot in the itinerary
        for (const day of itinerary.days) {
          const dayActivities = activitiesByDay.get(day.id) || [];
          
          if (dayActivities.length > 0) {
            // Find or create the "afternoon" slot (default slot for manually added activities)
            let afternoonSlot = day.slots.find(slot => slot.label.toLowerCase() === 'afternoon');
            
            // If no afternoon slot, use the first available slot or create one
            if (!afternoonSlot && day.slots.length > 0) {
              afternoonSlot = day.slots[0];
            } else if (!afternoonSlot) {
              // Create afternoon slot if no slots exist
              afternoonSlot = {
                label: 'afternoon',
                summary: '',
                places: [],
              };
              day.slots.push(afternoonSlot);
            }

            // Convert activities to ItineraryPlace format and add to slot
            for (const activity of dayActivities) {
              const place = activity.place;
              
              // Extract area from address (second-to-last component before country)
              let area = 'Unknown';
              let neighborhood: string | null = null;
              if (place?.address) {
                const addressParts = place.address.split(',').map(p => p.trim());
                if (addressParts.length > 1) {
                  area = addressParts[addressParts.length - 2] || 'Unknown';
                  if (addressParts.length > 2) {
                    neighborhood = addressParts[addressParts.length - 3] || null;
                  }
                } else {
                  area = addressParts[0] || 'Unknown';
                }
              }

              // Convert activity to ItineraryPlace
              const itineraryPlace: ItineraryPlace = {
                id: activity.id, // Use activity ID as the place ID
                name: activity.title, // Use activity title as the place name
                description: place?.name || activity.title, // Use place name or activity title as description
                area,
                neighborhood,
                photos: activity.image_url ? [activity.image_url] : [],
                visited: false,
                tags: [],
                place_id: place?.external_id || undefined, // Google Places place_id if available
                image_url: activity.image_url || null, // Stable image URL from Supabase Storage
              };

              // Check if this place already exists in the slot (by activity ID to avoid duplicates)
              const exists = afternoonSlot.places.some(p => p.id === activity.id);
              if (!exists) {
                afternoonSlot.places.push(itineraryPlace);
              }
            }
          }
        }
      }
    }

    console.log('[smart-itinerary] loaded from DB with merged activities');

    // Return the merged SmartItinerary
    return NextResponse.json(
      itinerary,
      { status: 200 }
    );
  } catch (err) {
    console.error('[smart-itinerary GET] unexpected error', err);
    return NextResponse.json({ error: 'server-error' }, { status: 500 });
  }
}
