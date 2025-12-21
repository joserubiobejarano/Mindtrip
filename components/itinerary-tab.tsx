"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Users, MoreVertical, Trash2, Loader2, MapPin, Check, X, ChevronLeft, ChevronRight, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useTrip } from "@/hooks/use-trip";
import { useTripSegments } from "@/hooks/use-trip-segments";
import { format, addDays, differenceInDays } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { ShareTripDialog } from "@/components/share-trip-dialog";
import { TripMembersDialog } from "@/components/trip-members-dialog";
import { DeleteTripDialog } from "@/components/delete-trip-dialog";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { SmartItinerary, ItineraryDay, ItineraryPlace, ItinerarySlot } from "@/types/itinerary";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ExploreDeck } from "@/components/explore/ExploreDeck";
import { ExploreFilters } from "@/components/explore/ExploreFilters";
import type { ExploreFilters as ExploreFiltersType } from "@/lib/google/explore-places";
import { isPastDay } from "@/lib/utils/date-helpers";
import { getDayActivityCount, MAX_ACTIVITIES_PER_DAY } from "@/lib/supabase/smart-itineraries";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getUsageLimits } from "@/lib/supabase/usage-limits";
import { resolvePlacePhotoSrc, isPhotoSrcUsable, isGooglePhotoReference } from "@/lib/placePhotos";

type ItineraryStatus = 'idle' | 'loading' | 'generating' | 'loaded' | 'error';

interface ItineraryTabProps {
  tripId: string;
  userId: string;
  selectedDayId?: string | null;
  onSelectDay?: (dayId: string) => void;
  onActivitySelect?: (activityId: string) => void;
  isActive?: boolean;
}

// Helper function to convert text to bullet points, avoiding splits on decimals
function textToBulletPoints(text: string): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  // Split on periods that likely end sentences, NOT decimals
  // Pattern: period preceded by non-digit, followed by space and uppercase letter
  const rawSentences = normalized.split(/(?<=[^\d])\.(?=\s+[A-ZÀ-ÖØ-Þ])/g);
  return rawSentences
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      // Ensure each bullet ends with a period
      return s.endsWith('.') ? s : s + '.';
    });
}

// Helper to check if image src is a places proxy that needs unoptimized rendering
const isPlacesProxy = (src?: string | null): boolean => {
  return typeof src === "string" && src.startsWith("/api/places/photo");
}


// Simple affiliate button component
function AffiliateButton({ kind, day }: { kind: string, day: ItineraryDay }) {
  // Fallback or placeholder logic for affiliates since we removed the specific AffiliateSuggestion type from explicit Day interface in new schema
  // But we can check if we want to add hardcoded or dynamic ones. 
  // For now, adhering to instruction "AffiliateButton kind=..."
  // I will create a simple button.
  
  const labels: Record<string, string> = {
    hotel: "Find hotels",
    tour: "Book tours",
    sim: "Get eSim",
    insurance: "Travel Insurance",
    transport: "Transport"
  };

  return (
    <Button variant="outline" size="sm" className="text-xs h-8 bg-slate-50 text-slate-700 border-slate-200">
      {labels[kind] || kind}
    </Button>
  );
}

export function ItineraryTab({
  tripId,
  userId,
  selectedDayId,
  onSelectDay,
  onActivitySelect,
  isActive = true,
}: ItineraryTabProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  
  const [smartItinerary, setSmartItinerary] = useState<SmartItinerary | null>(null);
  const [status, setStatus] = useState<ItineraryStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [isBackfillingImages, setIsBackfillingImages] = useState(false);
  const [backfillReport, setBackfillReport] = useState<any>(null);
  const [showBackfillReport, setShowBackfillReport] = useState(false);
  
  // Day-level Explore state
  const [dayExploreOpen, setDayExploreOpen] = useState(false);
  const [selectedDayForExplore, setSelectedDayForExplore] = useState<{ dayId: string; slot?: 'morning' | 'afternoon' | 'evening'; areaCluster?: string } | null>(null);
  const [dayExploreFilters, setDayExploreFilters] = useState<ExploreFiltersType>({});
  
  const router = useRouter();
  const { addToast } = useToast();
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const didAutoBackfillRef = useRef<boolean>(false);
  const triggerAutoBackfillRef = useRef<(() => Promise<void>) | null>(null);
  const { data: trip, isLoading: tripLoading } = useTrip(tripId);
  const { data: segments = [], isLoading: segmentsLoading } = useTripSegments(tripId);
  const [daysWithSegments, setDaysWithSegments] = useState<Map<string, string>>(new Map()); // day date -> segment_id
  const { user } = useUser();
  const supabase = createClient();

  // Fetch subscription status
  const { data: subscriptionStatus } = useQuery({
    queryKey: ["subscription-status", user?.id],
    queryFn: async () => {
      if (!user?.id) return { isPro: false };
      const response = await fetch('/api/user/subscription-status');
      if (!response.ok) return { isPro: false };
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch trip member data with usage counts
  const { data: tripMember, isLoading: tripMemberLoading } = useQuery({
    queryKey: ["trip-member-usage", tripId, user?.id],
    queryFn: async () => {
      if (!user?.id || !tripId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[DEBUG] tripMember query: missing user.id or tripId', { userId: user?.id, tripId });
        }
        return null;
      }
      
      // Get profileId from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .maybeSingle();

      if (profileError && process.env.NODE_ENV === 'development') {
        console.error("[DEBUG] Error fetching profile:", profileError);
      }

      type ProfileQueryResult = { id: string } | null;
      const typedProfile = profile as ProfileQueryResult;
      
      if (!typedProfile || !typedProfile.id) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[DEBUG] tripMember query: profile not found', { clerkUserId: user.id });
        }
        return null;
      }

      // Get trip member with usage counts
      const { data: member, error } = await supabase
        .from("trip_members")
        .select("id, change_count, search_add_count, swipe_count")
        .eq("trip_id", tripId)
        .eq("user_id", typedProfile.id)
        .maybeSingle();

      if (error) {
        // PGRST116 means no rows found, which is OK (user might not be a member yet)
        if (error.code !== 'PGRST116') {
          console.error("Error fetching trip member:", error);
        } else if (process.env.NODE_ENV === 'development') {
          console.log('[DEBUG] tripMember query: user not a member yet (PGRST116)', { tripId, profileId: typedProfile.id });
        }
        // Return null with default counts of 0
        return null;
      }

      type TripMemberQueryResult = {
        id: string;
        change_count: number;
        search_add_count: number;
        swipe_count: number;
      } | null;
      
      const result = (member as TripMemberQueryResult);
      if (process.env.NODE_ENV === 'development') {
        console.log('[DEBUG] tripMember query: loaded', { 
          tripId, 
          profileId: typedProfile.id,
          member: result ? {
            id: result.id,
            change_count: result.change_count,
            search_add_count: result.search_add_count,
            swipe_count: result.swipe_count,
          } : null
        });
      }
      
      return result;
    },
    enabled: !!user?.id && !!tripId,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1, // Only retry once on error
  });

  // Get usage limits
  const isPro = subscriptionStatus?.isPro || false;
  const usageLimits = getUsageLimits(isPro);
  // Default to 0 if tripMember is null/undefined (user not a member or query still loading)
  // This ensures buttons are enabled until we know the actual counts
  const changeCount = tripMember?.change_count ?? 0;
  const searchAddCount = tripMember?.search_add_count ?? 0;
  
  // Log usage limits for debugging (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG] Usage limits:', {
      isPro,
      tripMemberLoading,
      tripMember: tripMember ? 'loaded' : 'not_loaded',
      changeCount,
      searchAddCount,
      usageLimits,
    });
  }

  // Helper function to get button disabled reason (dev-only)
  const getButtonDisabledReason = useCallback((
    type: 'change' | 'add',
    dayIsPast: boolean,
    dayIsAtCapacity: boolean,
    dayActivityCount: number,
    isLoading?: boolean,
    dayId?: string,
    placeId?: string
  ): string[] => {
    const reasons: string[] = [];
    
  // Development mode only
    
    if (isLoading) {
      reasons.push("loading");
    }
    if (dayIsPast) {
      reasons.push("past_day");
    }
    
    // Capacity check removed for 'change' type - capacity should NOT block changing activities
    // Capacity is only shown as a non-blocking warning badge in the UI
    
    if (type === 'change') {
      if (changeCount >= usageLimits.change.limit) {
        reasons.push(`limits_reached_change (${changeCount}/${usageLimits.change.limit === Infinity ? '∞' : usageLimits.change.limit})`);
      }
      if (!placeId) {
        reasons.push("missing_activity_id");
      }
    } else if (type === 'add') {
      // For 'add' type, only check searchAddCount limit, NOT capacity
      if (searchAddCount >= usageLimits.searchAdd.limit) {
        reasons.push(`limits_reached_add (${searchAddCount}/${usageLimits.searchAdd.limit === Infinity ? '∞' : usageLimits.searchAdd.limit})`);
      }
      if (!dayId) {
        reasons.push("missing_dayId");
      }
    }
    
    if (!tripId) {
      reasons.push("missing_tripId");
    }
    // Only require tripMember if user is not the owner
    // Owner has access even if not in trip_members table
    const isOwner = trip && trip.owner_id === user?.id;
    if (!tripMember && user?.id && !isOwner) {
      reasons.push("missing_trip_access");
    }
    
    // Log detailed debug info (development only)
    if (process.env.NODE_ENV === 'development' && reasons.length > 0) {
      console.log(`[DEBUG] Button disabled (${type}):`, {
        dayId,
        placeId,
        dayIsPast,
        dayIsAtCapacity,
        dayActivityCount,
        capacityLimit: MAX_ACTIVITIES_PER_DAY,
        capacityCurrent: dayActivityCount,
        changeCount,
        searchAddCount,
        usageLimits,
        tripLoading,
        tripMember: tripMember ? 'loaded' : 'not_loaded',
        reasons,
      });
    }
    
    // Log capacity values once per render (development only)
    if (process.env.NODE_ENV === 'development' && dayId) {
      console.log(`[DEBUG] Capacity check:`, {
        dayId,
        dayActivityCount,
        limit: MAX_ACTIVITIES_PER_DAY,
        current: dayActivityCount,
        isAtCapacity: dayIsAtCapacity,
      });
    }
    
    return reasons;
  }, [changeCount, searchAddCount, usageLimits, tripId, tripMember, user?.id, tripLoading, trip]);

  const generateSmartItinerary = useCallback(async () => {
    if (!isActive) return;
    if (!tripId) {
      console.warn('[itinerary-tab] generateSmartItinerary: missing tripId');
      setStatus('error');
      setError('Missing trip id.');
      return;
    }

    console.log('[itinerary-tab] generateSmartItinerary: POST /smart-itinerary for trip', tripId);
    setError(null);
    setStatus('generating');

    try {
      const res = await fetch(`/api/trips/${tripId}/smart-itinerary`, {
        method: 'POST',
      });

      console.log('[itinerary-tab] generateSmartItinerary: POST status', res.status);

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        console.error('[itinerary-tab] generateSmartItinerary: POST error body', body);
        
        // Handle regeneration limit reached error
        if (body?.error === 'regeneration_limit_reached') {
          addToast({
            title: 'Too many changes today',
            description: body.message || 'You\'ve tweaked this itinerary a lot already 😅 Take some time to enjoy your trip, and try changes again tomorrow.',
            variant: 'destructive',
          });
          setStatus('error');
          setError('Regeneration limit reached');
          return;
        }
        
        throw new Error(body?.error || `Generation failed with status ${res.status}`);
      }

      // Check if response is streaming (SSE)
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('text/event-stream')) {
        // Handle streaming response
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        
        if (!reader) {
          throw new Error('No response body');
        }

        // Initialize partial itinerary
        let partialItinerary: Partial<SmartItinerary> = {
          title: '',
          summary: '',
          days: [],
          tripTips: [],
        };
        
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          // Process complete SSE messages (lines ending with \n\n)
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                console.log('[itinerary-tab] received SSE message:', data.type);
                
                switch (data.type) {
                  case 'title':
                    partialItinerary.title = data.data;
                    setSmartItinerary(prev => prev ? { ...prev, title: data.data } : { ...partialItinerary } as SmartItinerary);
                    break;
                    
                  case 'summary':
                    partialItinerary.summary = data.data;
                    setSmartItinerary(prev => prev ? { ...prev, summary: data.data } : { ...partialItinerary } as SmartItinerary);
                    break;
                    
                  case 'day':
                    // Add or update day
                    const dayIndex = partialItinerary.days?.findIndex(d => d.id === data.data.id) ?? -1;
                    if (dayIndex >= 0) {
                      partialItinerary.days![dayIndex] = data.data;
                    } else {
                      partialItinerary.days = [...(partialItinerary.days || []), data.data];
                    }
                    setSmartItinerary(prev => {
                      const base = prev || {
                        title: partialItinerary.title || '',
                        summary: partialItinerary.summary || '',
                        days: [],
                        tripTips: partialItinerary.tripTips || [],
                      };
                      const existingDayIndex = base.days.findIndex(d => d.id === data.data.id);
                      if (existingDayIndex >= 0) {
                        const newDays = [...base.days];
                        newDays[existingDayIndex] = data.data;
                        return { ...base, days: newDays };
                      }
                      return { ...base, days: [...base.days, data.data] };
                    });
                    break;
                    
                  case 'day-updated':
                    // Update day with photos
                    setSmartItinerary(prev => {
                      if (!prev) return null;
                      const dayIndex = prev.days.findIndex(d => d.id === data.data.id);
                      if (dayIndex >= 0) {
                        const newDays = [...prev.days];
                        newDays[dayIndex] = data.data;
                        return { ...prev, days: newDays };
                      }
                      return prev;
                    });
                    break;
                    
                  case 'tripTips':
                    partialItinerary.tripTips = data.data;
                    setSmartItinerary(prev => prev ? { ...prev, tripTips: data.data } : { ...partialItinerary } as SmartItinerary);
                    break;
                    
                  case 'complete':
                    // Final complete itinerary - validate before setting state
                    try {
                      const completeData = data.data;
                      
                      // Log the payload for debugging (sanitize if too large)
                      const payloadPreview = completeData ? JSON.stringify(completeData).substring(0, 500) : 'null/undefined';
                      console.log('[itinerary-tab] complete message received, payload preview:', payloadPreview);
                      
                      // Validate structure before setting state
                      if (!completeData) {
                        console.error('[itinerary-tab] complete: data.data is null/undefined');
                        setError('Received incomplete itinerary data. Please try again.');
                        setStatus('error');
                        break;
                      }
                      
                      // Ensure days is an array
                      if (!Array.isArray(completeData.days)) {
                        console.error('[itinerary-tab] complete: days is not an array', {
                          days: completeData.days,
                          type: typeof completeData.days,
                          fullPayload: completeData
                        });
                        setError('Invalid itinerary format: days must be an array. Please try regenerating.');
                        setStatus('error');
                        break;
                      }
                      
                      // Ensure tripTips is an array (default to empty if missing)
                      const validatedData = {
                        ...completeData,
                        tripTips: Array.isArray(completeData.tripTips) ? completeData.tripTips : [],
                      };
                      
                      setSmartItinerary(validatedData);
                      setStatus('loaded');
                      // Trigger auto-backfill after itinerary is loaded
                      setTimeout(() => triggerAutoBackfillRef.current?.(), 500);
                    } catch (parseErr: any) {
                      console.error('[itinerary-tab] complete: error validating/parsing complete data', {
                        error: parseErr,
                        message: parseErr?.message,
                        stack: parseErr?.stack,
                        dataReceived: data.data
                      });
                      setError('Failed to parse complete itinerary. Please try regenerating.');
                      setStatus('error');
                    }
                    break;
                    
                  case 'error':
                    console.error('[itinerary-tab] SSE error:', data.data);
                    // If we have partial data, show it but also show the error
                    setSmartItinerary(prev => {
                      if (prev && prev.days && prev.days.length > 0) {
                        setError(data.data.message || 'An error occurred while generating. Some days may be incomplete.');
                        setStatus('loaded'); // Show partial data
                        return prev;
                      } else {
                        setError(data.data.message || 'An error occurred');
                        setStatus('error');
                        return null;
                      }
                    });
                    break;
                }
              } catch (err) {
                console.error('[itinerary-tab] Error parsing SSE message:', err, line);
              }
            }
          }
        }
        
        // If we completed without error, mark as loaded
        // Check if we have partial data
        setSmartItinerary(prev => {
          if (prev && prev.days && prev.days.length > 0) {
            setStatus('loaded');
            return prev;
          } else {
            // No data received, treat as error
            setError('No itinerary data was received');
            setStatus('error');
            return null;
          }
        });
      } else {
        // Fallback: non-streaming response (for backwards compatibility)
        const json = await res.json();
        console.log('[itinerary-tab] generateSmartItinerary: received itinerary from POST', json);
        
        // Validate structure before setting state
        try {
          if (!json) {
            console.error('[itinerary-tab] generateSmartItinerary: received null/undefined data');
            setError('Invalid itinerary data received. Please try again.');
            setStatus('error');
            return;
          }
          
          // Ensure days is an array
          if (!Array.isArray(json.days)) {
            console.error('[itinerary-tab] generateSmartItinerary: days is not an array', {
              days: json.days,
              type: typeof json.days,
              fullPayload: json
            });
            setError('Invalid itinerary format: days must be an array. Please try again.');
            setStatus('error');
            return;
          }
          
          // Ensure tripTips is an array (default to empty if missing)
          const validatedData = {
            ...json,
            tripTips: Array.isArray(json.tripTips) ? json.tripTips : [],
          };
          
          setSmartItinerary(validatedData);
          setStatus('loaded');
          // Trigger auto-backfill after itinerary is loaded
          setTimeout(() => triggerAutoBackfillRef.current?.(), 500);
        } catch (parseErr: any) {
          console.error('[itinerary-tab] generateSmartItinerary: error validating non-streaming data', {
            error: parseErr,
            message: parseErr?.message,
            dataReceived: json
          });
          setError('Failed to parse itinerary. Please try again.');
          setStatus('error');
        }
      }
    } catch (err) {
      console.error('[itinerary-tab] generateSmartItinerary error', err);
      setError('Failed to generate itinerary. Please try again.');
      setStatus('error');
    }
  }, [tripId, addToast, isActive]);

  const loadOrGenerate = useCallback(async () => {
    if (!isActive) return;
    if (!tripId) {
      console.warn('[itinerary-tab] loadOrGenerate: missing tripId');
      return;
    }

    console.log('[itinerary-tab] loadOrGenerate: start for trip', tripId);
    setStatus('loading');
    setError(null);

    try {
      const res = await fetch(`/api/trips/${tripId}/smart-itinerary?mode=load`);
      console.log('[itinerary-tab] loadOrGenerate: GET /smart-itinerary?mode=load status', res.status);

      // CASE 1: no itinerary yet → trigger generation
      if (res.status === 404) {
        console.log('[itinerary-tab] no itinerary found, starting generation…');
        setStatus('generating');
        await generateSmartItinerary();
        return;
      }

      // CASE 2: other errors
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[itinerary-tab] loadOrGenerate: error loading itinerary', { status: res.status, error: errorData.error });
        addToast({
          variant: 'destructive',
          title: 'Failed to load itinerary',
          description: errorData.error || 'Please try again.',
        });
        throw new Error(`Failed to load itinerary: ${res.status}`);
      }

      // CASE 3: we have data
      const json = await res.json();
      console.log('[itinerary-tab] loadOrGenerate: loaded itinerary from DB', json);
      
      // Validate structure before setting state
      try {
        if (!json) {
          console.error('[itinerary-tab] loadOrGenerate: received null/undefined data');
          setError('Invalid itinerary data received. Please try regenerating.');
          setStatus('error');
          return;
        }
        
        // Ensure days is an array
        if (!Array.isArray(json.days)) {
          console.error('[itinerary-tab] loadOrGenerate: days is not an array', {
            days: json.days,
            type: typeof json.days,
            fullPayload: json
          });
          setError('Invalid itinerary format: days must be an array. Please try regenerating.');
          setStatus('error');
          return;
        }
        
        // Ensure tripTips is an array (default to empty if missing)
        const validatedData = {
          ...json,
          tripTips: Array.isArray(json.tripTips) ? json.tripTips : [],
        };
        
        // GET handler now returns bare SmartItinerary directly
        setSmartItinerary(validatedData);
        setStatus('loaded');
      } catch (parseErr: any) {
        console.error('[itinerary-tab] loadOrGenerate: error validating loaded data', {
          error: parseErr,
          message: parseErr?.message,
          dataReceived: json
        });
        setError('Failed to parse loaded itinerary. Please try regenerating.');
        setStatus('error');
      }
    } catch (err) {
      console.error('[itinerary-tab] loadOrGenerate error', err);
      setError('Failed to load itinerary. Please try again.');
      setStatus('error');
    }
  }, [tripId, generateSmartItinerary, addToast, isActive]);

  const triggerAutoBackfill = useCallback(async () => {
    // Prevent duplicate calls
    if (didAutoBackfillRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[itinerary-tab] triggerAutoBackfill: already ran, skipping');
      }
      return;
    }

    if (!tripId) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[itinerary-tab] triggerAutoBackfill: missing tripId');
      }
      return;
    }

    // Mark as running to prevent duplicates
    didAutoBackfillRef.current = true;
    setIsBackfillingImages(true);

    if (process.env.NODE_ENV === 'development') {
      addToast({
        title: 'Fetching images...',
        description: 'Loading place photos for your itinerary',
        variant: 'default',
      });
    }

    try {
      const response = await fetch(`/api/trips/${tripId}/itinerary/backfill-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dryRun: false,
          limit: 50,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Backfill failed with status ${response.status}`);
      }

      const result = await response.json();

      if (process.env.NODE_ENV === 'development') {
        console.log('[itinerary-tab] triggerAutoBackfill: success', {
          scanned: result.scanned,
          updated: result.updated,
          notFound: result.notFound,
          errors: result.errors,
        });

        addToast({
          title: 'Images updated',
          description: `Updated ${result.updated || 0} place${result.updated !== 1 ? 's' : ''} with photos`,
          variant: 'success',
        });
      }

      // Refresh itinerary data to show new images
      await loadOrGenerate();
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[itinerary-tab] triggerAutoBackfill: error', error);
      }
      // Don't show error toast - this is a background process
      // Don't break the UI - just log and continue
    } finally {
      setIsBackfillingImages(false);
    }
  }, [tripId, addToast, loadOrGenerate]);

  // Store triggerAutoBackfill in ref so generateSmartItinerary can call it
  useEffect(() => {
    triggerAutoBackfillRef.current = triggerAutoBackfill;
  }, [triggerAutoBackfill]);

  // Check if any places need photos
  const hasPlacesNeedingPhotos = useCallback((): boolean => {
    if (!smartItinerary?.days) return false;
    
    for (const day of smartItinerary.days) {
      for (const slot of day.slots || []) {
        for (const place of slot.places || []) {
          if (!place.place_id) continue;
          const hasPhoto = place.photos && 
                          Array.isArray(place.photos) && 
                          place.photos.length > 0 && 
                          isPhotoSrcUsable(place.photos[0]);
          if (!hasPhoto) return true;
        }
      }
    }
    return false;
  }, [smartItinerary]);

  // Backfill images for places missing photos (legacy - writes to DB)
  const handleBackfillImages = useCallback(async () => {
    if (!tripId || isBackfillingImages) return;

    setIsBackfillingImages(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/itinerary/backfill-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun: false, limit: 20 }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'Failed to backfill images');
      }

      const result = await response.json();
      
      addToast({
        title: 'Images updated',
        description: `Updated ${result.updated} place${result.updated !== 1 ? 's' : ''} with photos.`,
        variant: 'success',
      });

      // Refetch itinerary to show updated images
      await loadOrGenerate();
    } catch (error: any) {
      console.error('[itinerary-tab] Error backfilling images:', error);
      addToast({
        title: 'Error',
        description: error.message || 'Failed to backfill images',
        variant: 'destructive',
      });
    } finally {
      setIsBackfillingImages(false);
    }
  }, [tripId, isBackfillingImages, addToast, loadOrGenerate]);

  // Backfill images in debug mode (dry run, no DB writes)
  const handleBackfillImagesDebug = useCallback(async () => {
    if (!tripId || isBackfillingImages) return;

    setIsBackfillingImages(true);
    setBackfillReport(null);
    try {
      const response = await fetch(`/api/trips/${tripId}/itinerary/backfill-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun: true, limit: 10 }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'Failed to backfill images');
      }

      const result = await response.json();
      setBackfillReport(result);
      setShowBackfillReport(true);
      
      addToast({
        title: 'Debug report generated',
        description: `Scanned ${result.scanned} places. See report below.`,
        variant: 'success',
      });
    } catch (error: any) {
      console.error('[itinerary-tab] Error backfilling images (debug):', error);
      addToast({
        title: 'Error',
        description: error.message || 'Failed to backfill images',
        variant: 'destructive',
      });
    } finally {
      setIsBackfillingImages(false);
    }
  }, [tripId, isBackfillingImages, addToast]);

  // Backfill images in write mode (writes to DB)
  const handleBackfillImagesWrite = useCallback(async () => {
    if (!tripId || isBackfillingImages) return;

    setIsBackfillingImages(true);
    setBackfillReport(null);
    try {
      const response = await fetch(`/api/trips/${tripId}/itinerary/backfill-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun: false, limit: 20 }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'Failed to backfill images');
      }

      const result = await response.json();
      setBackfillReport(result);
      setShowBackfillReport(true);
      
      addToast({
        title: 'Images updated',
        description: `Updated ${result.updated} place${result.updated !== 1 ? 's' : ''} with photos.`,
        variant: 'success',
      });

      // Refetch itinerary to show updated images
      await loadOrGenerate();
    } catch (error: any) {
      console.error('[itinerary-tab] Error backfilling images (write):', error);
      addToast({
        title: 'Error',
        description: error.message || 'Failed to backfill images',
        variant: 'destructive',
      });
    } finally {
      setIsBackfillingImages(false);
    }
  }, [tripId, isBackfillingImages, addToast, loadOrGenerate]);

  // Load days with segment info
  useEffect(() => {
    if (!isActive) return;
    if (tripId && segments.length > 0) {
      const supabase = createClient();
      supabase
        .from('days')
        .select('id, date, trip_segment_id')
        .eq('trip_id', tripId)
        .then(({ data: daysData }) => {
          type DayQueryResult = {
            id: string
            date: string
            trip_segment_id: string | null
          }

          const days = (daysData || []) as DayQueryResult[];

          if (days) {
            const daySegmentMap = new Map<string, string>();
            days.forEach(day => {
              if (day.trip_segment_id) {
                daySegmentMap.set(day.date, day.trip_segment_id);
              }
            });
            setDaysWithSegments(daySegmentMap);
          }
        });
    }
  }, [tripId, segments, isActive]);

  // 1. Load existing or start generation
  useEffect(() => {
    if (!isActive) return;
    // Reset backfill ref when tripId changes
    didAutoBackfillRef.current = false;
    loadOrGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, isActive]);

  // Initialize expanded days with first day expanded
  useEffect(() => {
    if (smartItinerary?.days && smartItinerary.days.length > 0 && expandedDays.size === 0) {
      setExpandedDays(new Set([smartItinerary.days[0].id]));
    }
  }, [smartItinerary, expandedDays.size]);

  // Handle manual updates (visited, remove)
  // Since we have slots now, finding the place is a bit deeper.
  const handleUpdatePlace = async (dayId: string, placeId: string, updates: { visited?: boolean, remove?: boolean }) => {
    if (!isActive) return;
    if (!smartItinerary) return;

    // Optimistic Update
    const newItinerary = { ...smartItinerary };
    const day = newItinerary.days.find(d => d.id === dayId);
    if (!day) return;

    let found = false;
    for (const slot of day.slots) {
       if (updates.remove) {
         const initialLen = slot.places.length;
         slot.places = slot.places.filter(p => p.id !== placeId);
         if (slot.places.length < initialLen) found = true;
       } else if (updates.visited !== undefined) {
         const place = slot.places.find(p => p.id === placeId);
         if (place) {
           place.visited = updates.visited;
           found = true;
         }
       }
       if (found) break;
    }
    
    setSmartItinerary(newItinerary);

    // API Call
    try {
      const response = await fetch(`/api/trips/${tripId}/smart-itinerary/place`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayId,
          placeId,
          ...updates
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle past-day locked error
        if (errorData.error === 'past_day_locked') {
          // Rollback optimistic update
          setSmartItinerary(smartItinerary);
          addToast({
            variant: 'destructive',
            title: 'Cannot modify past day',
            description: errorData.message || 'You cannot modify days that are already in the past.',
          });
          return;
        }

        throw new Error(errorData.error || 'Failed to update');
      }
    } catch (error) {
      console.error("Failed to sync place update", error);
      // Rollback optimistic update
      setSmartItinerary(smartItinerary);
      addToast({ variant: "destructive", title: "Failed to save change" });
    }
  };

  // Handle replacing an activity with a similar one
  const handleReplaceActivity = async (dayId: string, placeId: string) => {
    if (!isActive) return;
    if (!smartItinerary) return;

    // Show loading state
    addToast({
      title: 'Finding replacement...',
      description: 'Looking for a similar place nearby',
      variant: 'default',
    });

    try {
      const response = await fetch(`/api/trips/${tripId}/activities/${placeId}/replace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (errorData.error === 'past_day_locked') {
          addToast({
            variant: 'destructive',
            title: 'Cannot modify past day',
            description: errorData.message || 'You cannot modify days that are already in the past.',
          });
          return;
        }

        if (errorData.error === 'no_replacement_found') {
          addToast({
            variant: 'destructive',
            title: 'No replacement found',
            description: errorData.message || 'We couldn\'t find a good alternative nearby. Try Explore to discover more places.',
          });
          return;
        }

        throw new Error(errorData.error || 'Failed to replace activity');
      }

      const result = await response.json();

      // Reload itinerary to show the updated place
      await loadOrGenerate();

      addToast({
        title: 'Activity replaced',
        description: `Changed to ${result.activity.name}`,
        variant: 'success',
      });
    } catch (error) {
      console.error("Failed to replace activity", error);
      addToast({
        variant: 'destructive',
        title: 'Failed to replace activity',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  // Lightbox logic
  const openLightbox = (image: string, allImages: string[]) => {
    setSelectedImage(image);
    setLightboxImages(allImages);
  };

  const nextImage = () => {
    if (!selectedImage) return;
    const idx = lightboxImages.indexOf(selectedImage);
    const nextIdx = (idx + 1) % lightboxImages.length;
    setSelectedImage(lightboxImages[nextIdx]);
  };
  
  const prevImage = () => {
    if (!selectedImage) return;
    const idx = lightboxImages.indexOf(selectedImage);
    const prevIdx = (idx - 1 + lightboxImages.length) % lightboxImages.length;
    setSelectedImage(lightboxImages[prevIdx]);
  };
  
  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setSettingsMenuOpen(false);
      }
    };
    if (settingsMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [settingsMenuOpen]);


  if (tripLoading) return <div className="p-6">Loading...</div>;
  if (!trip) return <div className="p-6">Trip not found</div>;

  // Helper components for loading and error states
  const LoadingCard = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <Card className="bg-amber-50 border-amber-100 text-slate-800 max-w-4xl mx-auto mt-6 mb-8">
      <CardHeader>{title}</CardHeader>
      <CardContent className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{subtitle}</span>
        </div>
      </CardContent>
    </Card>
  );

  const ErrorCard = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <Card className="bg-red-50 border-red-200 text-slate-800 max-w-4xl mx-auto mt-6 mb-8">
      <CardHeader>
        <CardTitle className="text-red-900">We couldn&apos;t load your itinerary</CardTitle>
        <CardDescription className="text-red-700">{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onRetry}
          variant="outline" 
          className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
        >
          Retry
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex-shrink-0">
            <Image 
              src="/icon.svg" 
              alt="Kruno logo" 
              width={32} 
              height={32} 
              className="hover:opacity-80 transition-opacity"
            />
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Patrick Hand', cursive" }}>{trip.title}</h1>
            <p className="text-sm text-gray-500">
              {format(new Date(trip.start_date), "MMM d")} - {format(new Date(trip.end_date), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setMembersDialogOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              Tripmates
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShareDialogOpen(true)}>
              <Share2 className="h-4 w-4" />
            </Button>
            {trip.owner_id === userId && (
              <div className="relative" ref={settingsMenuRef}>
                <Button variant="ghost" size="icon" onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
                {settingsMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-20">
                    <button
                      onClick={() => { setSettingsMenuOpen(false); setDeleteDialogOpen(true); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" /> Delete trip
                    </button>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1267px] mx-auto px-4 py-8">
          
          {/* Loading State */}
          {status === 'loading' && (
            <LoadingCard
              title="We're crafting your itinerary…"
              subtitle="Loading your saved plan…"
            />
          )}

          {/* Generating State - only show if we have no partial data */}
          {status === 'generating' && (!smartItinerary || !smartItinerary.days || smartItinerary.days.length === 0) && (
            <LoadingCard
              title="We're crafting your itinerary…"
              subtitle="Designing your days and finding great spots…"
            />
          )}

          {/* Error State */}
          {status === 'error' && (
            <ErrorCard
              message={error ?? 'Something went wrong.'}
              onRetry={loadOrGenerate}
            />
          )}

          {/* Itinerary (loaded or generating with partial data) */}
          {(status === 'loaded' || (status === 'generating' && smartItinerary)) && smartItinerary && (
            <>
              {/* Safety guard: check if days is a valid array */}
              {!Array.isArray(smartItinerary.days) ? (
                <ErrorCard
                  message="There was a problem with your itinerary. Please try generating it again."
                  onRetry={loadOrGenerate}
                />
              ) : (
                <div className="space-y-8 pb-10">
                  {/* Trip Summary */}
                  {(smartItinerary.title || smartItinerary.summary || (smartItinerary.tripTips && smartItinerary.tripTips.length > 0)) && (
                    <div className="space-y-4 mb-10 max-w-4xl mx-auto">
                      <div className="flex items-center justify-center gap-3">
                        {smartItinerary.title && (
                          <h2 className="text-3xl font-bold text-slate-900 text-center" style={{ fontFamily: "'Patrick Hand', cursive" }}>{smartItinerary.title}</h2>
                        )}
                        {process.env.NODE_ENV === 'development' && hasPlacesNeedingPhotos() && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleBackfillImagesDebug}
                              disabled={isBackfillingImages}
                              className="text-xs"
                            >
                              {isBackfillingImages ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Running...
                                </>
                              ) : (
                                'Backfill Images (debug)'
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleBackfillImagesWrite}
                              disabled={isBackfillingImages}
                              className="text-xs"
                            >
                              {isBackfillingImages ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Writing...
                                </>
                              ) : (
                                'Backfill Images (write)'
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                      {process.env.NODE_ENV === 'development' && backfillReport && (
                        <div className="mt-4 border rounded-lg bg-slate-50">
                          <button
                            onClick={() => setShowBackfillReport(!showBackfillReport)}
                            className="w-full px-4 py-2 flex items-center justify-between text-sm font-medium text-slate-700 hover:bg-slate-100"
                          >
                            <span>Backfill Report (scanned: {backfillReport.scanned}, updated: {backfillReport.updated}, notFound: {backfillReport.notFound}, errors: {backfillReport.errors})</span>
                            {showBackfillReport ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                          {showBackfillReport && (
                            <div className="p-4 border-t bg-white">
                              <pre className="text-xs overflow-auto max-h-96 bg-slate-50 p-4 rounded border">
                                {JSON.stringify(backfillReport, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                      {smartItinerary.summary && (
                        <div className="prose prose-neutral max-w-none text-slate-900 text-left">
                          <ul className="list-disc pl-5 space-y-2 text-base leading-relaxed">
                            {textToBulletPoints(smartItinerary.summary).map((point, idx) => (
                              <li key={idx} className="font-normal">
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {smartItinerary.tripTips && smartItinerary.tripTips.length > 0 && (
                        <div className="mt-6 text-left max-w-3xl mx-auto">
                          <h3 className="text-lg font-bold text-slate-900 mb-3" style={{ fontFamily: "'Patrick Hand', cursive" }}>Trip Tips &amp; Notes</h3>
                          <ul className="list-disc pl-5 space-y-2 text-base text-slate-700 leading-relaxed">
                            {smartItinerary.tripTips.map((tip, i) => (
                              <li key={i}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Days - Grouped by segments if multi-city */}
                  <div className="space-y-12">
                    {smartItinerary.days && smartItinerary.days.length > 0 ? (() => {
                      // Group days by segment if multi-city
                      if (segments.length > 1) {
                        const groupedDays: Array<{ segment: typeof segments[0] | null; days: ItineraryDay[] }> = [];
                        let currentSegment: typeof segments[0] | null = null;
                        let currentDays: ItineraryDay[] = [];

                        smartItinerary.days.forEach((day, index) => {
                          const daySegmentId = daysWithSegments.get(day.date);
                          const segment = daySegmentId ? segments.find(s => s.id === daySegmentId) : null;

                          // If segment changed, save previous group and start new one
                          if (segment && segment.id !== currentSegment?.id) {
                            if (currentSegment && currentDays.length > 0) {
                              groupedDays.push({ segment: currentSegment, days: currentDays });
                            }
                            currentSegment = segment;
                            currentDays = [day];

                            // Check if we need a travel day
                            if (groupedDays.length > 0 && currentSegment) {
                              const prevSegment = groupedDays[groupedDays.length - 1].segment;
                              if (prevSegment) {
                                const prevEnd = new Date(prevSegment.end_date);
                                const currentStart = new Date(currentSegment.start_date);
                                const daysBetween = differenceInDays(currentStart, prevEnd);
                                if (daysBetween === 1) {
                                  // Insert travel day
                                  const travelDay: ItineraryDay = {
                                    id: `travel-${prevSegment.id}-${currentSegment.id}`,
                                    index: day.index - 0.5,
                                    date: format(prevEnd, 'yyyy-MM-dd'),
                                    title: `Travel: ${prevSegment.city_name} → ${currentSegment.city_name}`,
                                    theme: 'Travel',
                                    areaCluster: '',
                                    photos: [],
                                    overview: `Travel day from ${prevSegment.city_name} to ${currentSegment.city_name}`,
                                    slots: [],
                                  };
                                  currentDays = [travelDay, day];
                                }
                              }
                            }
                          } else {
                            currentDays.push(day);
                          }
                        });

                        // Add last group
                        if (currentSegment && currentDays.length > 0) {
                          groupedDays.push({ segment: currentSegment, days: currentDays });
                        }

                        // Render grouped days
                        return groupedDays.map((group, groupIdx) => (
                          <div key={group.segment?.id || `no-segment-${groupIdx}`} className="space-y-8">
                            {group.segment && (
                              <div className="border-b-2 border-slate-200 pb-2">
                                <h3 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                                  {group.segment.city_name}
                                </h3>
                                <p className="text-sm text-slate-600 mt-1">
                                  {format(new Date(group.segment.start_date), "MMM d")} – {format(new Date(group.segment.end_date), "MMM d")} 
                                  {' '}({differenceInDays(new Date(group.segment.end_date), new Date(group.segment.start_date)) + 1} nights)
                                </p>
                              </div>
                            )}
                            {group.days.map((day) => {
                  // Gather all photos from day.photos (already deduplicated by backend)
                  // Fallback to collecting from places if day.photos is empty
                  const dayImages = (day.photos && day.photos.length > 0) 
                    ? day.photos.map(photo => resolvePlacePhotoSrc(photo)).filter((src): src is string => src !== null)
                    : day.slots.flatMap(s => s.places.map(p => resolvePlacePhotoSrc(p))).filter((src): src is string => src !== null);
                  
                  // Deduplicate by URL to ensure unique images
                  // CRITICAL: Filter out invalid URLs (null, undefined, empty strings)
                  const validDayImages = dayImages.filter((img): img is string => 
                    isPhotoSrcUsable(img)
                  );
                  const uniqueDayImages = Array.from(new Set(validDayImages));
                  const bannerImages = uniqueDayImages.slice(0, 4);
                  const isExpanded = expandedDays.has(day.id);

                  // Debug logging (development only) - first 5 activities per day
                  if (process.env.NODE_ENV === "development") {
                    const allPlaces = day.slots.flatMap(s => s.places);
                    const first5Places = allPlaces.slice(0, 5);
                    first5Places.forEach((place, idx) => {
                      const photoSrc = resolvePlacePhotoSrc(place);
                      // Check if any raw photo field contains a valid photo reference
                      const rawPhotoFields = {
                        photo_reference: place.photo_reference,
                        photos: place.photos,
                        photo: (place as any).photo,
                        placePhotos: (place as any).placePhotos,
                        place: (place as any).place,
                      };
                      const rawPhotoValues = [
                        place.photo_reference,
                        ...(Array.isArray(place.photos) ? place.photos : []),
                        (place as any).photo,
                        (place as any).placePhotos,
                        (place as any).place?.photo_reference,
                        (place as any).place?.photos,
                      ].filter(Boolean);
                      const hasValidRef = rawPhotoValues.some((val) => 
                        typeof val === 'string' && isGooglePhotoReference(val)
                      );
                      console.log(`[Itinerary] Day ${day.id} Activity ${idx + 1}: ${place.name} | raw: ${JSON.stringify(rawPhotoFields)} | resolved: ${photoSrc || 'null'} | validRef: ${hasValidRef}`);
                    });
                  }

                  return (
                    <Card 
                      key={day.id} 
                      id={`day-${day.id}`}
                      className={`overflow-hidden border shadow-sm transition-all ${selectedDayId === day.id ? 'ring-2 ring-primary' : ''}`}
                    >
                      <CardHeader 
                        className="bg-gray-50 border-b pb-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDays(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(day.id)) {
                              newSet.delete(day.id);
                            } else {
                              newSet.add(day.id);
                            }
                            return newSet;
                          });
                          onSelectDay?.(day.id);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                              Day {day.index} – {day.title}
                            </CardTitle>
                            <CardDescription className="text-base font-medium text-slate-600 mt-1">
                              {day.theme} • {format(new Date(day.date), "EEEE, MMMM d")}
                            </CardDescription>
                          </div>
                          <div className="flex items-center">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-slate-600" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-slate-600" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      {isExpanded && (
                        <>
                          {/* Image Gallery */}
                          {(() => {
                            // Filter out failed images and only show valid ones
                            // CRITICAL: Validate that img is truthy, non-empty string before rendering
                            const validImages = bannerImages.filter((img, idx): img is string => {
                              const imageKey = `${day.id}-banner-${idx}`;
                              return !failedImages.has(imageKey) && isPhotoSrcUsable(img);
                            });

                            if (validImages.length === 0) {
                              return null; // Don't render empty gallery
                            }

                            return (
                              <div className="w-full flex gap-0.5 bg-gray-100 overflow-hidden rounded-t-xl">
                                {validImages.map((img, idx) => {
                                  const imageKey = `${day.id}-banner-${idx}`;
                                  // Double-check validation before rendering Image
                                  if (!isPhotoSrcUsable(img)) {
                                    return null;
                                  }
                                  const shouldUnoptimize = isPlacesProxy(img);
                                  if (process.env.NODE_ENV === 'development' && idx === 0) {
                                    console.debug('[ItineraryTab] Banner image:', { src: img, unoptimized: shouldUnoptimize });
                                  }
                                  return (
                                    <div 
                                      key={imageKey} 
                                      className="relative flex-1 min-w-0 aspect-[4/3] cursor-pointer hover:opacity-90 transition-opacity bg-gray-200 overflow-hidden"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (img) {
                                          openLightbox(img, dayImages.filter((img): img is string => isPhotoSrcUsable(img)));
                                        }
                                      }}
                                    >
                                      <Image 
                                        src={img} 
                                        alt={day.title ? `${day.title} photo ${idx + 1}` : `Trip photo ${idx + 1}`} 
                                        fill
                                        sizes="(max-width: 768px) 25vw, 25vw"
                                        unoptimized={shouldUnoptimize}
                                        className="object-cover"
                                        onError={() => {
                                          setFailedImages(prev => new Set(prev).add(imageKey));
                                        }}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          <CardContent className="p-6 space-y-6">
                        {/* Day Overview as Bullet Points */}
                        {day.overview && (
                          <div className="prose prose-neutral max-w-none text-slate-900">
                            <ul className="list-disc pl-5 space-y-2 text-base leading-relaxed">
                              {textToBulletPoints(day.overview).map((point, idx) => (
                                <li key={idx} className="font-normal">
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        

                        {/* Slots */}
                        <div className="space-y-8 mt-6">
                          {day.slots.map((slot, slotIdx) => {
                            const slotType = slot.label.toLowerCase() as 'morning' | 'afternoon' | 'evening';
                            const areaCluster = slot.places[0]?.area || slot.places[0]?.neighborhood || day.areaCluster;
                            const dayIsPast = isPastDay(day.date);
                            const dayActivityCount = smartItinerary ? getDayActivityCount(smartItinerary, day.id) : 0;
                            const dayIsAtCapacity = dayActivityCount >= MAX_ACTIVITIES_PER_DAY;
                            
                            return (
                              <div key={slotIdx} className="space-y-4">
                                <div className="pt-4 border-t border-gray-200">
                                  {/* Moment of day label and summary */}
                                  <div className="flex flex-col gap-2 pb-4">
                                    <div className="flex justify-center md:justify-center">
                                      <span className="text-sm uppercase tracking-wide text-slate-600 font-bold" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                                        {slot.label}
                                      </span>
                                    </div>
                                    <p className="text-sm md:text-base text-slate-800 leading-relaxed text-center md:text-left">
                                      {slot.summary}
                                    </p>
                                  </div>
                                  
                                  {/* Activities */}
                                  <div className="grid gap-4">
                                    {slot.places.map((place, placeIndex) => {
                                      // Use shared photo resolver
                                      const photoSrc = resolvePlacePhotoSrc(place);
                                      const imageKey = `${day.id}-${slotIdx}-${place.place_id ?? place.id ?? placeIndex}-photo`;
                                      
                                      return (
                                      <div 
                                        key={`${day.id}:${slotIdx}:${placeIndex}`} 
                                        className={`flex items-start gap-4 p-4 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer ${place.visited ? 'bg-slate-50 opacity-75' : 'bg-white'}`}
                                        onClick={(e) => {
                                          onActivitySelect?.(place.id);
                                        }}
                                      >
                                        <div className="flex-shrink-0 relative w-full sm:w-24 h-48 sm:h-24 rounded-md overflow-hidden bg-gray-200">
                                          {photoSrc && !failedImages.has(imageKey) ? (() => {
                                            const shouldUnoptimize = isPlacesProxy(photoSrc);
                                            if (process.env.NODE_ENV === 'development' && placeIndex === 0 && slotIdx === 0) {
                                              console.debug('[ItineraryTab] Place activity image:', { src: photoSrc, placeName: place.name, unoptimized: shouldUnoptimize });
                                            }
                                            return (
                                              <Image 
                                                src={photoSrc} 
                                                alt={`Photo for ${place.name}`}
                                                fill
                                                sizes="(max-width: 640px) 100vw, 96px"
                                                unoptimized={shouldUnoptimize}
                                                className="object-cover"
                                                key={imageKey}
                                                onError={() => {
                                                  console.warn(`[Itinerary] Photo failed to load for place: ${place.name} (ID: ${place.id}, place_id: ${place.place_id || 'none'}, photo_reference: ${place.photo_reference || 'none'})`);
                                                  // Mark this specific image as failed - never reuse another place's image
                                                  setFailedImages(prev => new Set(prev).add(imageKey));
                                                }}
                                              />
                                            );
                                          })() : (
                                            // Placeholder: Show when no photo or photo failed to load
                                            // NEVER reuse another place's image as fallback
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                                              <MapPin className="h-8 w-8 mb-1" />
                                              {place.tags && place.tags[0] && (
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wide px-2">
                                                  {place.tags[0]}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                            <h4 className="font-bold text-lg text-slate-900" style={{ fontFamily: "'Patrick Hand', cursive" }}>{place.name}</h4>
                                            <div className="shrink-0 flex flex-col sm:flex-row items-end sm:items-center gap-2">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleUpdatePlace(day.id, place.id, { visited: !place.visited });
                                                }}
                                                className={`rounded-full gap-1.5 ${
                                                  place.visited
                                                    ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                    : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                }`}
                                              >
                                                {place.visited && <Check className="h-3 w-3" />}
                                                {place.visited ? "Visited" : "Mark as visited"}
                                              </Button>
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  console.log('[Itinerary] Change clicked', { dayId: day.id, activityId: place.id });
                                                  const isDisabled = dayIsPast || changeCount >= usageLimits.change.limit;
                                                  if (isDisabled) return;
                                                  router.push(`/trips/${tripId}?tab=explore&mode=replace&day=${day.id}&activity=${place.id}`);
                                                }}
                                                disabled={dayIsPast || changeCount >= usageLimits.change.limit}
                                                title={
                                                  (() => {
                                                    const reasons = getButtonDisabledReason('change', dayIsPast, dayIsAtCapacity, dayActivityCount, tripLoading, day.id, place.id);
                                                    if (reasons.length > 0) {
                                                      return `Disabled: ${reasons.join(', ')}`;
                                                    }
                                                    return dayIsPast
                                                      ? "This day has already passed, so you can't modify it anymore."
                                                      : changeCount >= usageLimits.change.limit
                                                      ? `You've reached the change limit (${changeCount}/${usageLimits.change.limit === Infinity ? '∞' : usageLimits.change.limit}). ${isPro ? 'Try saving your favorites or adjusting your filters.' : 'Unlock Kruno Pro to see more places.'}`
                                                      : undefined;
                                                  })()
                                                }
                                                className={`rounded-full ${
                                                  dayIsPast || changeCount >= usageLimits.change.limit
                                                    ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                                                    : "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                                                }`}
                                              >
                                                Change
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (dayIsPast) return;
                                                  handleUpdatePlace(day.id, place.id, { remove: true });
                                                }}
                                                disabled={dayIsPast}
                                                title={dayIsPast ? "This day has already passed, so you can't modify it anymore." : undefined}
                                                className={`rounded-full ${
                                                  dayIsPast
                                                    ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                                                    : "border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                                                }`}
                                              >
                                                Remove
                                              </Button>
                                            </div>
                                          </div>
                                          <p className="text-slate-700 text-sm mt-2 leading-relaxed line-clamp-2">
                                            {place.description}
                                          </p>
                                          {place.area && (
                                            <span className="inline-block mt-2 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                              {place.area}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      )
                                    })}
                                  </div>
                                  
                                  {/* Add activities button - moved below activities */}
                                  <div className="mt-4 flex w-full sm:w-auto justify-start">
                                    <Button
                                      type="button"
                                      variant="default"
                                      size="sm"
                                      onClick={() => {
                                        console.log('[Itinerary] Add clicked', { dayId: day.id, slot: slotType });
                                        // Remove dayIsAtCapacity check - capacity should NOT block adding activities
                                        const isDisabled = dayIsPast || searchAddCount >= usageLimits.searchAdd.limit;
                                        if (isDisabled) return;
                                        router.push(`/trips/${tripId}?tab=explore&mode=add&day=${day.id}&slot=${slotType}`);
                                      }}
                                      disabled={dayIsPast || searchAddCount >= usageLimits.searchAdd.limit}
                                      title={
                                        (() => {
                                          const reasons = getButtonDisabledReason('add', dayIsPast, dayIsAtCapacity, dayActivityCount, tripLoading, day.id);
                                          if (reasons.length > 0) {
                                            return `Disabled: ${reasons.join(', ')}`;
                                          }
                                          return dayIsPast
                                            ? "This day has already passed, so you can't modify it anymore."
                                            : searchAddCount >= usageLimits.searchAdd.limit
                                            ? `You've reached the add limit (${searchAddCount}/${usageLimits.searchAdd.limit === Infinity ? '∞' : usageLimits.searchAdd.limit}). ${isPro ? 'Try saving your favorites or adjusting your filters.' : 'Unlock Kruno Pro to see more places.'}`
                                            : dayIsAtCapacity
                                            ? `This day is already quite full. We recommend no more than ${MAX_ACTIVITIES_PER_DAY} activities per day.`
                                            : undefined;
                                        })()
                                      }
                                      className={`text-xs min-h-[44px] touch-manipulation ${
                                        dayIsPast || searchAddCount >= usageLimits.searchAdd.limit
                                          ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                                          : "bg-primary hover:bg-primary/90 text-white"
                                      }`}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      <span className="hidden sm:inline">Add {slot.label.toLowerCase()} activities</span>
                                      <span className="sm:hidden">Add</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Affiliate Buttons - Moved below activities */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                          <div className="flex flex-wrap gap-3">
                            <AffiliateButton kind="hotel" day={day} />
                            <AffiliateButton kind="tour" day={day} />
                            <AffiliateButton kind="sim" day={day} />
                          </div>
                        </div>

                          </CardContent>
                        </>
                      )}
                    </Card>
                            );
                          })}
                          </div>
                        ))
                      } else {
                        // Single-city trip: render days normally (show city name once at top if single segment)
                        const singleSegment = segments.length === 1 ? segments[0] : null;
                        return (
                          <>
                            {singleSegment && (
                              <div className="border-b-2 border-slate-200 pb-2 mb-8">
                                <h3 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                                  {singleSegment.city_name}
                                </h3>
                              </div>
                            )}
                            {smartItinerary.days.map((day) => {
                  // Gather all photos from day.photos (already deduplicated by backend)
                  // Fallback to collecting from places if day.photos is empty
                  const dayImages = (day.photos && day.photos.length > 0) 
                    ? day.photos.map(photo => resolvePlacePhotoSrc(photo)).filter((src): src is string => src !== null)
                    : day.slots.flatMap(s => s.places.map(p => resolvePlacePhotoSrc(p))).filter((src): src is string => src !== null);
                  
                  // Deduplicate by URL to ensure unique images
                  // CRITICAL: Filter out invalid URLs (null, undefined, empty strings)
                  const validDayImages = dayImages.filter((img): img is string => 
                    isPhotoSrcUsable(img)
                  );
                  const uniqueDayImages = Array.from(new Set(validDayImages));
                  const bannerImages = uniqueDayImages.slice(0, 4);
                  const isExpanded = expandedDays.has(day.id);

                  // Debug logging (development only) - first 5 activities per day
                  if (process.env.NODE_ENV === "development") {
                    const allPlaces = day.slots.flatMap(s => s.places);
                    const first5Places = allPlaces.slice(0, 5);
                    first5Places.forEach((place, idx) => {
                      const photoSrc = resolvePlacePhotoSrc(place);
                      // Check if any raw photo field contains a valid photo reference
                      const rawPhotoFields = {
                        photo_reference: place.photo_reference,
                        photos: place.photos,
                        photo: (place as any).photo,
                        placePhotos: (place as any).placePhotos,
                        place: (place as any).place,
                      };
                      const rawPhotoValues = [
                        place.photo_reference,
                        ...(Array.isArray(place.photos) ? place.photos : []),
                        (place as any).photo,
                        (place as any).placePhotos,
                        (place as any).place?.photo_reference,
                        (place as any).place?.photos,
                      ].filter(Boolean);
                      const hasValidRef = rawPhotoValues.some((val) => 
                        typeof val === 'string' && isGooglePhotoReference(val)
                      );
                      console.log(`[Itinerary] Day ${day.id} Activity ${idx + 1}: ${place.name} | raw: ${JSON.stringify(rawPhotoFields)} | resolved: ${photoSrc || 'null'} | validRef: ${hasValidRef}`);
                    });
                  }

                  return (
                    <Card 
                      key={day.id} 
                      id={`day-${day.id}`}
                      className={`overflow-hidden border shadow-sm transition-all ${selectedDayId === day.id ? 'ring-2 ring-primary' : ''}`}
                    >
                      <CardHeader 
                        className="bg-gray-50 border-b pb-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDays(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(day.id)) {
                              newSet.delete(day.id);
                            } else {
                              newSet.add(day.id);
                            }
                            return newSet;
                          });
                          onSelectDay?.(day.id);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                              Day {day.index} – {day.title}
                            </CardTitle>
                            <CardDescription className="text-base font-medium text-slate-600 mt-1">
                              {day.theme} • {format(new Date(day.date), "EEEE, MMMM d")}
                            </CardDescription>
                          </div>
                          <div className="flex items-center">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-slate-600" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-slate-600" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      {isExpanded && (
                        <>
                          {/* Image Gallery */}
                          {(() => {
                            // Filter out failed images and only show valid ones
                            // CRITICAL: Validate that img is truthy, non-empty string before rendering
                            const validImages = bannerImages.filter((img, idx): img is string => {
                              const imageKey = `${day.id}-banner-${idx}`;
                              return !failedImages.has(imageKey) && isPhotoSrcUsable(img);
                            });

                            if (validImages.length === 0) {
                              return null; // Don't render empty gallery
                            }

                            return (
                              <div className="w-full flex gap-0.5 bg-gray-100 overflow-hidden rounded-t-xl">
                                {validImages.map((img, idx) => {
                                  const imageKey = `${day.id}-banner-${idx}`;
                                  // Double-check validation before rendering Image
                                  if (!isPhotoSrcUsable(img)) {
                                    return null;
                                  }
                                  const shouldUnoptimize = isPlacesProxy(img);
                                  if (process.env.NODE_ENV === 'development' && idx === 0) {
                                    console.debug('[ItineraryTab] Banner image (collapsed):', { src: img, unoptimized: shouldUnoptimize });
                                  }
                                  return (
                                    <div 
                                      key={imageKey} 
                                      className="relative flex-1 min-w-0 aspect-[4/3] cursor-pointer hover:opacity-90 transition-opacity bg-gray-200 overflow-hidden"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (img) {
                                          openLightbox(img, dayImages.filter((img): img is string => isPhotoSrcUsable(img)));
                                        }
                                      }}
                                    >
                                      <Image 
                                        src={img} 
                                        alt={day.title ? `${day.title} photo ${idx + 1}` : `Trip photo ${idx + 1}`} 
                                        fill
                                        sizes="(max-width: 768px) 25vw, 25vw"
                                        unoptimized={shouldUnoptimize}
                                        className="object-cover"
                                        onError={() => {
                                          setFailedImages(prev => new Set(prev).add(imageKey));
                                        }}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          <CardContent className="p-6 space-y-6">
                        {/* Day Overview as Bullet Points */}
                        {day.overview && (
                          <div className="prose prose-neutral max-w-none text-slate-900">
                            <ul className="list-disc pl-5 space-y-2 text-base leading-relaxed">
                              {textToBulletPoints(day.overview).map((point, idx) => (
                                <li key={idx} className="font-normal">
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        

                        {/* Slots */}
                        <div className="space-y-8 mt-6">
                          {day.slots.map((slot, slotIdx) => {
                            const slotType = slot.label.toLowerCase() as 'morning' | 'afternoon' | 'evening';
                            const areaCluster = slot.places[0]?.area || slot.places[0]?.neighborhood || day.areaCluster;
                            const dayIsPast = isPastDay(day.date);
                            const dayActivityCount = smartItinerary ? getDayActivityCount(smartItinerary, day.id) : 0;
                            const dayIsAtCapacity = dayActivityCount >= MAX_ACTIVITIES_PER_DAY;
                            
                            return (
                              <div key={slotIdx} className="space-y-4">
                                <div className="pt-4 border-t border-gray-200">
                                  {/* Moment of day label and summary */}
                                  <div className="flex flex-col gap-2 pb-4">
                                    <div className="flex justify-center md:justify-center">
                                      <span className="text-sm uppercase tracking-wide text-slate-600 font-bold" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                                        {slot.label}
                                      </span>
                                    </div>
                                    <p className="text-sm md:text-base text-slate-800 leading-relaxed text-center md:text-left">
                                      {slot.summary}
                                    </p>
                                  </div>
                                  
                                  {/* Activities */}
                                  <div className="grid gap-4">
                                    {slot.places.map((place, placeIndex) => {
                                      // Use shared photo resolver
                                      const photoSrc = resolvePlacePhotoSrc(place);
                                      const imageKey = `${day.id}-${slotIdx}-${place.place_id ?? place.id ?? placeIndex}-photo`;
                                      
                                      return (
                                      <div 
                                        key={`${day.id}:${slotIdx}:${placeIndex}`} 
                                        className={`flex items-start gap-4 p-4 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer ${place.visited ? 'bg-slate-50 opacity-75' : 'bg-white'}`}
                                        onClick={(e) => {
                                          onActivitySelect?.(place.id);
                                        }}
                                      >
                                        <div className="flex-shrink-0 relative w-full sm:w-24 h-48 sm:h-24 rounded-md overflow-hidden bg-gray-200">
                                          {photoSrc && !failedImages.has(imageKey) ? (() => {
                                            const shouldUnoptimize = isPlacesProxy(photoSrc);
                                            if (process.env.NODE_ENV === 'development' && placeIndex === 0 && slotIdx === 0) {
                                              console.debug('[ItineraryTab] Place activity image:', { src: photoSrc, placeName: place.name, unoptimized: shouldUnoptimize });
                                            }
                                            return (
                                              <Image 
                                                src={photoSrc} 
                                                alt={`Photo for ${place.name}`}
                                                fill
                                                sizes="(max-width: 640px) 100vw, 96px"
                                                unoptimized={shouldUnoptimize}
                                                className="object-cover"
                                                key={imageKey}
                                                onError={() => {
                                                  console.warn(`[Itinerary] Photo failed to load for place: ${place.name} (ID: ${place.id}, place_id: ${place.place_id || 'none'}, photo_reference: ${place.photo_reference || 'none'})`);
                                                  // Mark this specific image as failed - never reuse another place's image
                                                  setFailedImages(prev => new Set(prev).add(imageKey));
                                                }}
                                              />
                                            );
                                          })() : (
                                            // Placeholder: Show when no photo or photo failed to load
                                            // NEVER reuse another place's image as fallback
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                                              <MapPin className="h-8 w-8 mb-1" />
                                              {place.tags && place.tags[0] && (
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wide px-2">
                                                  {place.tags[0]}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                            <h4 className="font-bold text-lg text-slate-900" style={{ fontFamily: "'Patrick Hand', cursive" }}>{place.name}</h4>
                                            <div className="shrink-0 flex flex-col sm:flex-row items-end sm:items-center gap-2">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleUpdatePlace(day.id, place.id, { visited: !place.visited });
                                                }}
                                                className={`rounded-lg ${
                                                  place.visited
                                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                                }`}
                                              >
                                                {place.visited ? (
                                                  <>
                                                    <Check className="h-3 w-3 inline mr-1" />
                                                    Visited
                                                  </>
                                                ) : (
                                                  "Mark visited"
                                                )}
                                              </Button>
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  console.log('[Itinerary] Change clicked', { dayId: day.id, activityId: place.id });
                                                  const isDisabled = dayIsPast || changeCount >= usageLimits.change.limit;
                                                  if (isDisabled) return;
                                                  router.push(`/trips/${tripId}?tab=explore&mode=replace&day=${day.id}&activity=${place.id}`);
                                                }}
                                                disabled={dayIsPast || changeCount >= usageLimits.change.limit}
                                                title={
                                                  (() => {
                                                    const reasons = getButtonDisabledReason('change', dayIsPast, dayIsAtCapacity, dayActivityCount, tripLoading, day.id, place.id);
                                                    if (reasons.length > 0) {
                                                      return `Disabled: ${reasons.join(', ')}`;
                                                    }
                                                    return dayIsPast
                                                      ? "This day has already passed, so you can't modify it anymore."
                                                      : changeCount >= usageLimits.change.limit
                                                      ? `You've reached the change limit (${changeCount}/${usageLimits.change.limit === Infinity ? '∞' : usageLimits.change.limit}). ${isPro ? 'Try saving your favorites or adjusting your filters.' : 'Unlock Kruno Pro to see more places.'}`
                                                      : undefined;
                                                  })()
                                                }
                                                className={`rounded-lg ${
                                                  dayIsPast || changeCount >= usageLimits.change.limit
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                                                }`}
                                              >
                                                Change
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (dayIsPast) return;
                                                  handleUpdatePlace(day.id, place.id, { remove: true });
                                                }}
                                                disabled={dayIsPast}
                                                title={dayIsPast ? "This day has already passed, so you can't modify it anymore." : undefined}
                                                className={`rounded-lg ${
                                                  dayIsPast
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                                }`}
                                              >
                                                <X className="h-3 w-3 inline mr-1" />
                                                Remove
                                              </Button>
                                            </div>
                                          </div>
                                          <p className="text-sm text-slate-600 mt-1">{place.description}</p>
                                          {place.area && (
                                            <span className="inline-block mt-2 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                                              {place.area}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      )
                                    })}
                                  </div>
                                  
                                  {/* Add activities button - moved below activities */}
                                  <div className="mt-4 flex w-full sm:w-auto justify-start">
                                    <Button
                                      type="button"
                                      variant="default"
                                      size="sm"
                                      onClick={() => {
                                        console.log('[Itinerary] Add clicked', { dayId: day.id, slot: slotType });
                                        // Remove dayIsAtCapacity check - capacity should NOT block adding activities
                                        const isDisabled = dayIsPast || searchAddCount >= usageLimits.searchAdd.limit;
                                        if (isDisabled) return;
                                        router.push(`/trips/${tripId}?tab=explore&mode=add&day=${day.id}&slot=${slotType}`);
                                      }}
                                      disabled={dayIsPast || searchAddCount >= usageLimits.searchAdd.limit}
                                      title={
                                        (() => {
                                          const reasons = getButtonDisabledReason('add', dayIsPast, dayIsAtCapacity, dayActivityCount, tripLoading, day.id);
                                          if (reasons.length > 0) {
                                            return `Disabled: ${reasons.join(', ')}`;
                                          }
                                          return dayIsPast
                                            ? "This day has already passed, so you can't modify it anymore."
                                            : searchAddCount >= usageLimits.searchAdd.limit
                                            ? `You've reached the add limit (${searchAddCount}/${usageLimits.searchAdd.limit === Infinity ? '∞' : usageLimits.searchAdd.limit}). ${isPro ? 'Try saving your favorites or adjusting your filters.' : 'Unlock Kruno Pro to see more places.'}`
                                            : dayIsAtCapacity
                                            ? `This day is already quite full. We recommend no more than ${MAX_ACTIVITIES_PER_DAY} activities per day.`
                                            : undefined;
                                        })()
                                      }
                                      className={`text-xs min-h-[44px] touch-manipulation ${
                                        dayIsPast || searchAddCount >= usageLimits.searchAdd.limit
                                          ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                                          : "bg-primary hover:bg-primary/90 text-white"
                                      }`}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      <span className="hidden sm:inline">Add {slot.label.toLowerCase()} activities</span>
                                      <span className="sm:hidden">Add</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Affiliate Buttons - Moved below activities */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                          <div className="flex flex-wrap gap-3">
                            <AffiliateButton kind="hotel" day={day} />
                            <AffiliateButton kind="tour" day={day} />
                            <AffiliateButton kind="sim" day={day} />
                          </div>
                        </div>

                          </CardContent>
                        </>
                      )}
                    </Card>
                      );
                    })}
                          </>
                        );
                      }
                    })() : null}
                    
                    {/* Loading placeholder for days still being generated */}
                    {status === 'generating' && (
                      <Card className="bg-gray-50 border-gray-200">
                        <CardHeader className="bg-gray-50 border-b pb-4">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            <CardTitle className="text-lg font-medium text-gray-500">
                              Generating more days...
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <p className="text-sm text-gray-500">We&apos;re crafting the rest of your itinerary...</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>



                </div>
              )}
            </>
          )}

          {/* Fallback: if status is loaded but no itinerary (shouldn't happen, but safety check) */}
          {status === 'loaded' && !smartItinerary && (
            <ErrorCard
              message="No itinerary yet. Try generating it again."
              onRetry={loadOrGenerate}
            />
          )}

          {/* Fallback: if status is idle (shouldn't happen after mount, but safety check) */}
          {status === 'idle' && (
            <LoadingCard
              title="We're crafting your itinerary…"
              subtitle="Preparing…"
            />
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ShareTripDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} tripId={tripId} />
      <TripMembersDialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen} tripId={tripId} userId={userId} />
      <DeleteTripDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={async () => { await fetch(`/api/trips/${tripId}`, { method: 'DELETE' }); router.push('/trips'); }} tripTitle={trip.title} />
      
      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-black/90 border-none sm:rounded-none overflow-hidden flex items-center justify-center">
          <DialogTitle className="sr-only">Image Lightbox</DialogTitle>
          {selectedImage && (() => {
            const shouldUnoptimize = isPlacesProxy(selectedImage);
            if (process.env.NODE_ENV === 'development') {
              console.debug('[ItineraryTab] Lightbox image:', { src: selectedImage, unoptimized: shouldUnoptimize });
            }
            return (
              <div className="relative w-full h-full flex items-center justify-center" style={{ height: '80vh' }}>
                <Image 
                  src={selectedImage} 
                  alt="Fullscreen" 
                  fill
                  sizes="90vw"
                  unoptimized={shouldUnoptimize}
                  className="object-contain"
                />
                
                {lightboxImages.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70">
                      <ChevronLeft className="h-8 w-8" />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70">
                      <ChevronRight className="h-8 w-8" />
                    </button>
                  </>
                )}
                
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/20 rounded-full"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Day-Level Explore Drawer */}
      <Sheet open={dayExploreOpen} onOpenChange={setDayExploreOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col overflow-hidden">
          <SheetHeader className="p-4 border-b flex-shrink-0">
            <SheetTitle className="text-xl font-bold" style={{ fontFamily: "'Patrick Hand', cursive" }}>
              {selectedDayForExplore?.slot 
                ? `Add activities to ${selectedDayForExplore.slot}`
                : 'Add activities to this day'}
            </SheetTitle>
          </SheetHeader>
          
          {/* Filters Section */}
          <div className="px-6 py-4 border-b border-sage/20 flex-shrink-0">
            <ExploreFilters filters={dayExploreFilters} onFiltersChange={setDayExploreFilters} />
          </div>
          
          {/* Explore Deck */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {selectedDayForExplore && (
              <ExploreDeck
                tripId={tripId}
                mode="day"
                dayId={selectedDayForExplore.dayId}
                slot={selectedDayForExplore.slot}
                areaCluster={selectedDayForExplore.areaCluster}
                filters={dayExploreFilters}
                onAddToDay={(placeIds) => {
                  // This will be handled by the ExploreDeck in day mode
                  setDayExploreOpen(false);
                  // Reload itinerary to show new places
                  loadOrGenerate();
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
