"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Users, MoreVertical, Trash2, Loader2, MapPin, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTrip } from "@/hooks/use-trip";
import { useTripSegments } from "@/hooks/use-trip-segments";
import { format, addDays, differenceInDays } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { ShareTripDialog } from "@/components/share-trip-dialog";
import { TripMembersDialog } from "@/components/trip-members-dialog";
import { DeleteTripDialog } from "@/components/delete-trip-dialog";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import { useLanguage } from "@/components/providers/language-provider";
import { SmartItinerary, ItineraryDay, ItineraryPlace, ItinerarySlot, SlotSummary } from "@/types/itinerary";
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
import { DayAccordionHeader } from "@/components/day-accordion-header";
import { CityOverviewCards } from "@/components/city-overview-cards";

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

/** Normalize URL for deduplication (pathname + host, or path only for relative). */
function normalizeImageUrlForDedup(url: string): string {
  try {
    const u = url.startsWith('/') ? new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://example.com') : new URL(url);
    return u.origin + u.pathname;
  } catch {
    return url;
  }
}

/** Get up to 4 unique banner image URLs for a day, with normalized deduplication. */
function getDayBannerImages(day: ItineraryDay): string[] {
  const raw = (day.photos && day.photos.length > 0)
    ? day.photos.map(photo => resolvePlacePhotoSrc(photo)).filter((src): src is string => src !== null)
    : day.slots.flatMap(s => s.places.map(p => resolvePlacePhotoSrc(p))).filter((src): src is string => src !== null);
  const valid = raw.filter((img): img is string => isPhotoSrcUsable(img));
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const img of valid) {
    const norm = normalizeImageUrlForDedup(img);
    if (seen.has(norm)) continue;
    seen.add(norm);
    unique.push(img);
    if (unique.length >= 4) break;
  }
  return unique;
}

// Simple affiliate button component
function AffiliateButton({ kind, day, t }: { kind: string, day: ItineraryDay, t: (key: string) => string }) {
  // Fallback or placeholder logic for affiliates since we removed the specific AffiliateSuggestion type from explicit Day interface in new schema
  // But we can check if we want to add hardcoded or dynamic ones. 
  // For now, adhering to instruction "AffiliateButton kind=..."
  // I will create a simple button.
  
  const labels: Record<string, string> = {
    hotel: t('itinerary_affiliate_hotels'),
    tour: t('itinerary_affiliate_tours'),
    sim: t('itinerary_affiliate_sim'),
    insurance: t('itinerary_affiliate_insurance'),
    transport: t('itinerary_affiliate_transport')
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
  
  // Draft state for progressive rendering - updates immediately on SSE events
  const [draft, setDraft] = useState<Partial<SmartItinerary>>({});
  
  // Track City Overview readiness to control rendering order
  const [overviewState, setOverviewState] = useState<'pending' | 'ready' | 'missing'>('pending');
  const [bufferedDays, setBufferedDays] = useState<ItineraryDay[]>([]);
  // Use ref to track overviewState in SSE handlers to avoid closure issues
  const overviewStateRef = useRef<'pending' | 'ready' | 'missing'>('pending');
  
  // Keep ref in sync with state
  useEffect(() => {
    overviewStateRef.current = overviewState;
  }, [overviewState]);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  // Track the single open day ID (null means all days are collapsed)
  // Collapsible behavior allows users to collapse all days for better overview
    const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const hasInitializedRef = useRef(false);
  const [isBackfillingImages, setIsBackfillingImages] = useState(false);
  
  // Day-level Explore state
  const [dayExploreOpen, setDayExploreOpen] = useState(false);
  const [selectedDayForExplore, setSelectedDayForExplore] = useState<{ dayId: string; slot?: 'morning' | 'afternoon' | 'evening'; areaCluster?: string } | null>(null);
  const [dayExploreFilters, setDayExploreFilters] = useState<ExploreFiltersType>({});
  
  const router = useRouter();
  const { addToast } = useToast();
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const didAutoBackfillRef = useRef<boolean>(false);
  const triggerAutoBackfillRef = useRef<(() => Promise<void>) | null>(null);
  const lastLoadedTripIdRef = useRef<string | null>(null);
  const lastLoadedItineraryRef = useRef<SmartItinerary | null>(null);
  const { data: trip, isLoading: tripLoading } = useTrip(tripId);
  const { data: segments = [], isLoading: segmentsLoading } = useTripSegments(tripId);
  const [daysWithSegments, setDaysWithSegments] = useState<Map<string, string>>(new Map()); // day date -> segment_id
  const { user } = useUser();
  const { language, t } = useLanguage();
  const supabase = createClient();

  // Helper function to translate slot labels (Morning/Afternoon/Evening)
  const translateSlotLabel = (slotLabel: string): string => {
    const normalized = slotLabel.toLowerCase();
    if (normalized === 'morning') return t('itinerary_morning');
    if (normalized === 'afternoon') return t('itinerary_afternoon');
    if (normalized === 'evening') return t('itinerary_evening');
    return slotLabel; // Fallback to original if unknown
  };

  // Render slot summaries with paragraph spacing preserved
  const renderSlotSummary = (summary?: string | SlotSummary) => {
    if (!summary) return null;
    
    // Handle legacy string format (backward compatibility)
    if (typeof summary === 'string') {
      const paragraphs = summary
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(Boolean);
      const content = paragraphs.length > 0 ? paragraphs : [summary.trim()];
      
      return (
        <div className="mt-5 mb-8 space-y-5 text-base md:text-lg text-slate-800 leading-7 text-center md:text-left">
          {content.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      );
    }
    
    // New structured format
    return (
      <div className="mt-5 mb-8 space-y-4 text-base md:text-lg text-slate-800 text-center md:text-left">
        {/* Block Title */}
        <h3 className="text-lg font-semibold text-slate-900 mb-3">
          {summary.block_title}
        </h3>
        
        {/* What to Do - Bullets */}
        <ul className="space-y-2 mb-4 list-none">
          {summary.what_to_do.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-slate-600 mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        
        {/* Local Insights - as paragraphs */}
        {summary.local_insights && (
          <div className="text-slate-700 mb-4 leading-relaxed">
            {summary.local_insights.split(/\n\s*\n/).map((paragraph, idx) => (
              <p key={idx} className="mb-3 last:mb-0">
                {paragraph.trim()}
              </p>
            ))}
          </div>
        )}
        
        {/* Getting Around (optional field for transit mode in area) */}
        {summary.getting_around && (
          <div className="text-slate-700 mb-3">
            <span className="font-medium">Getting around: </span>
            {summary.getting_around}
          </div>
        )}
        
        {/* Move Between (transport between stops) */}
        <div className="text-slate-700 mb-3">
          <span className="font-medium">Move between stops: </span>
          {summary.move_between}
        </div>
        
        {/* Cost Note (if present) */}
        {summary.cost_note && (
          <div className="text-slate-700 mb-3">
            <span className="font-medium">Cost: </span>
            {summary.cost_note}
          </div>
        )}
        
        {/* Heads Up */}
        <div className="text-slate-700 italic border-l-2 border-slate-300 pl-3">
          <span className="font-medium">Heads up: </span>
          {summary.heads_up}
        </div>
      </div>
    );
  };

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
      setError(t('itinerary_error_missing_trip_id'));
      return;
    }

    console.log('[itinerary-tab] generateSmartItinerary: POST /smart-itinerary for trip', tripId);
    setError(null);
    setStatus('generating');
    // Reset overview state for new generation
    setOverviewState('pending');
    setBufferedDays([]);
    // Reset draft state for new generation
    setDraft({});

    try {
      const res = await fetch(`/api/trips/${tripId}/smart-itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          language,
        }),
      });

      console.log('[itinerary-tab] generateSmartItinerary: POST status', res.status);

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        console.error('[itinerary-tab] generateSmartItinerary: POST error body', body);
        
        // Handle regeneration limit reached error
        if (body?.error === 'regeneration_limit_reached') {
          addToast({
            title: t('itinerary_toast_too_many_changes'),
            description: body.message || t('itinerary_toast_tweaked_lot'),
            variant: 'destructive',
          });
          setStatus('error');
          setError(t('itinerary_error_regeneration_limit'));
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
          cityOverview: undefined,
        };
        
        // Track first day received for dev logging
        let firstDayReceived = false;
        
        let buffer = '';
        let streamErrorOccurred = false;

        try {
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
                    setDraft(prev => ({ ...prev, title: data.data }));
                    setSmartItinerary(prev => prev ? { ...prev, title: data.data } : { ...partialItinerary } as SmartItinerary);
                    break;
                    
                  case 'summary':
                    partialItinerary.summary = data.data;
                    if (process.env.NODE_ENV === 'development') {
                      console.log('[itinerary-tab] SSE summary received:', new Date().toISOString());
                    }
                    setDraft(prev => ({ ...prev, summary: data.data }));
                    setSmartItinerary(prev => prev ? { ...prev, summary: data.data } : { ...partialItinerary } as SmartItinerary);
                    break;
                    
                  case 'day':
                    // Buffer days if overviewState is pending, otherwise add immediately
                    const dayData = data.data;
                    
                    // Dev log for first day
                    if (!firstDayReceived && process.env.NODE_ENV === 'development') {
                      console.log('[itinerary-tab] SSE first day received:', new Date().toISOString(), { dayIndex: dayData.index });
                      firstDayReceived = true;
                    }
                    
                    // Update draft immediately
                    setDraft(prev => {
                      const existingDays = prev.days || [];
                      const dayIndex = existingDays.findIndex(d => d.id === dayData.id);
                      if (dayIndex >= 0) {
                        const newDays = [...existingDays];
                        newDays[dayIndex] = dayData;
                        return { ...prev, days: newDays };
                      }
                      return { ...prev, days: [...existingDays, dayData] };
                    });
                    
                    if (overviewStateRef.current === 'pending') {
                      // Buffer the day - don't render yet
                      setBufferedDays(prev => {
                        // Check if day already exists in buffer
                        const existingIndex = prev.findIndex(d => d.id === dayData.id || d.index === dayData.index);
                        if (existingIndex >= 0) {
                          const newBuffer = [...prev];
                          newBuffer[existingIndex] = dayData;
                          return newBuffer;
                        }
                        return [...prev, dayData];
                      });
                      break;
                    }
                    
                    // Overview is ready or missing - add day immediately
                    // Add or update day - deduplicate by both ID and index to prevent duplicate Day 1
                    const dayIndex = partialItinerary.days?.findIndex(d => d.id === dayData.id) ?? -1;
                    
                    // Also check if a day with the same index already exists (different ID)
                    const existingDayByIndex = partialItinerary.days?.find(d => d.index === dayData.index && d.id !== dayData.id);
                    
                    if (dayIndex >= 0) {
                      // Update existing day with same ID
                      partialItinerary.days![dayIndex] = dayData;
                    } else if (existingDayByIndex) {
                      // Replace day with same index but different ID (deduplicate)
                      const existingIndex = partialItinerary.days!.findIndex(d => d.index === dayData.index);
                      if (existingIndex >= 0) {
                        console.warn(`[itinerary-tab] Replacing duplicate day with index ${dayData.index} (old ID: ${existingDayByIndex.id}, new ID: ${dayData.id})`);
                        partialItinerary.days![existingIndex] = dayData;
                      } else {
                        partialItinerary.days = [...(partialItinerary.days || []), dayData];
                      }
                    } else {
                      partialItinerary.days = [...(partialItinerary.days || []), dayData];
                    }
                    
                    setSmartItinerary(prev => {
                      const base = prev || {
                        title: partialItinerary.title || '',
                        summary: partialItinerary.summary || '',
                        days: [],
                        tripTips: partialItinerary.tripTips || [],
                      };
                      
                      // Deduplicate by ID first
                      const existingDayIndexById = base.days.findIndex(d => d.id === dayData.id);
                      if (existingDayIndexById >= 0) {
                        const newDays = [...base.days];
                        newDays[existingDayIndexById] = dayData;
                        // Ensure no duplicate indices after update
                        const indexMap = new Map<number, any>();
                        for (const day of newDays) {
                          if (day.index !== undefined) {
                            // Keep the most recent occurrence of each index
                            indexMap.set(day.index, day);
                          }
                        }
                        return { ...base, days: Array.from(indexMap.values()).sort((a, b) => a.index - b.index) };
                      }
                      
                      // Check for duplicate index (different ID) - deduplicate
                      const existingDayByIndex2 = base.days.find(d => d.index === dayData.index && d.id !== dayData.id);
                      if (existingDayByIndex2 && dayData.index !== undefined) {
                        console.warn(`[itinerary-tab] Replacing duplicate day with index ${dayData.index} (old ID: ${existingDayByIndex2.id}, new ID: ${dayData.id})`);
                        const newDays = base.days.filter(d => d.index !== dayData.index || d.id === dayData.id);
                        newDays.push(dayData);
                        // Sort by index
                        return { ...base, days: newDays.sort((a, b) => a.index - b.index) };
                      }
                      
                      // No duplicate, add normally but ensure no duplicate indices
                      const newDays = [...base.days, dayData];
                      const indexMap = new Map<number, any>();
                      for (const day of newDays) {
                        if (day.index !== undefined) {
                          // Keep the most recent occurrence of each index
                          indexMap.set(day.index, day);
                        }
                      }
                      return { ...base, days: Array.from(indexMap.values()).sort((a, b) => a.index - b.index) };
                    });
                    break;
                    
                  case 'day-updated':
                    // Update day with photos; match by id first, then by day index to avoid missing last-day updates
                    setSmartItinerary(prev => {
                      if (!prev) return null;
                      const incoming = data.data as ItineraryDay;
                      if (!incoming?.id || !Array.isArray(incoming.slots)) return prev;
                      let idx = prev.days.findIndex(d => d.id === incoming.id);
                      if (idx < 0 && incoming.index !== undefined) {
                        idx = prev.days.findIndex(d => d.index === incoming.index);
                      }
                      const newDays = [...prev.days];
                      if (idx >= 0) {
                        newDays[idx] = incoming;
                      } else {
                        // Day not yet in state (e.g. day-updated arrived before day event); add it
                        newDays.push(incoming);
                        newDays.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
                      }
                      return { ...prev, days: newDays };
                    });
                    break;
                    
                  case 'tripTips':
                    partialItinerary.tripTips = data.data;
                    setSmartItinerary(prev => prev ? { ...prev, tripTips: data.data } : { ...partialItinerary } as SmartItinerary);
                    break;
                    
                  case 'cityOverview':
                    if (process.env.NODE_ENV === 'development') {
                      console.log('[itinerary-tab] SSE cityOverview received:', new Date().toISOString());
                    }
                    partialItinerary.cityOverview = data.data;
                    setDraft(prev => ({ ...prev, cityOverview: data.data }));
                    setOverviewState('ready');
                    
                    // Flush buffered days into main state
                    setBufferedDays(currentBuffer => {
                      setSmartItinerary(prev => {
                        const base = prev || {
                          title: partialItinerary.title || '',
                          summary: partialItinerary.summary || '',
                          days: [],
                          tripTips: partialItinerary.tripTips || [],
                          cityOverview: data.data,
                        };
                        
                        // Merge buffered days with existing days
                        const allDays = [...(base.days || []), ...currentBuffer];
                        
                        // Deduplicate by index and sort
                        const indexMap = new Map<number, ItineraryDay>();
                        for (const day of allDays) {
                          if (day.index !== undefined) {
                            // Keep the most recent occurrence of each index
                            indexMap.set(day.index, day);
                          }
                        }
                        
                        return {
                          ...base,
                          cityOverview: data.data,
                          days: Array.from(indexMap.values()).sort((a, b) => a.index - b.index),
                        };
                      });
                      
                      // Return empty array to clear buffer
                      return [];
                    });
                    break;
                    
                  case 'cityOverview_missing':
                    console.log('[itinerary-tab] Received cityOverview_missing sentinel (backwards compatibility)');
                    setOverviewState('missing');
                    
                    // Flush buffered days into main state
                    setBufferedDays(currentBuffer => {
                      setSmartItinerary(prev => {
                        if (!prev) return null;
                        
                        // Merge buffered days with existing days
                        const allDays = [...(prev.days || []), ...currentBuffer];
                        
                        // Deduplicate by index and sort
                        const indexMap = new Map<number, ItineraryDay>();
                        for (const day of allDays) {
                          if (day.index !== undefined) {
                            // Keep the most recent occurrence of each index
                            indexMap.set(day.index, day);
                          }
                        }
                        
                        return {
                          ...prev,
                          days: Array.from(indexMap.values()).sort((a, b) => a.index - b.index),
                        };
                      });
                      
                      // Return empty array to clear buffer
                      return [];
                    });
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
                        setError(t('itinerary_error_incomplete_data'));
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
                        setError(t('itinerary_error_invalid_format'));
                        setStatus('error');
                        break;
                      }
                      
                      // Deduplicate days by index to prevent duplicate Day 1
                      const deduplicatedDays = new Map<number, any>();
                      for (const day of completeData.days) {
                        if (day.index !== undefined) {
                          // Keep the last occurrence of each index (most complete version)
                          deduplicatedDays.set(day.index, day);
                        }
                      }
                      const sortedDays = Array.from(deduplicatedDays.values()).sort((a, b) => a.index - b.index);
                      
                      // Ensure tripTips is an array (default to empty if missing)
                      const validatedData = {
                        ...completeData,
                        days: sortedDays,
                        tripTips: Array.isArray(completeData.tripTips) ? completeData.tripTips : [],
                      };
                      
                      // Merge buffered days with validated days
                      setBufferedDays(currentBuffer => {
                        const allDays = [...(validatedData.days || []), ...currentBuffer];
                        
                        // Deduplicate by index and sort
                        const indexMap = new Map<number, ItineraryDay>();
                        for (const day of allDays) {
                          if (day.index !== undefined) {
                            // Keep the most recent occurrence of each index
                            indexMap.set(day.index, day);
                          }
                        }
                        
                        const finalData = {
                          ...validatedData,
                          days: Array.from(indexMap.values()).sort((a, b) => a.index - b.index),
                        };
                        
                        // Merge draft into final data (don't overwrite with empty object)
                        setDraft(prev => {
                          // Merge draft fields that might not be in finalData
                          return {
                            ...prev,
                            ...finalData,
                            // Preserve draft days if they exist and finalData doesn't have them
                            days: finalData.days.length > 0 ? finalData.days : (prev.days || []),
                          };
                        });
                        
                        setSmartItinerary(finalData);
                        setStatus('loaded');
                        lastLoadedTripIdRef.current = tripId;
                        lastLoadedItineraryRef.current = finalData;

                        // Mark overview state
                        if (validatedData.cityOverview) {
                          setOverviewState('ready');
                        } else {
                          setOverviewState('missing');
                        }
                        
                        // Return empty array to clear buffer
                        return [];
                      });
                      
                      // Trigger auto-backfill after itinerary is saved (delay so DB write is visible)
                      setTimeout(() => triggerAutoBackfillRef.current?.(), 3000);
                    } catch (parseErr: any) {
                      console.error('[itinerary-tab] complete: error validating/parsing complete data', {
                        error: parseErr,
                        message: parseErr?.message,
                        stack: parseErr?.stack,
                        dataReceived: data.data
                      });
                      setError(t('itinerary_error_failed_parse'));
                      setStatus('error');
                    }
                    break;
                    
                  case 'error':
                    const errorData = data.data;
                    
                    // Helper to check if object is empty
                    const isEmptyObject = (obj: any): boolean => {
                      if (!obj || typeof obj !== 'object') return false;
                      try {
                        return Object.keys(obj).length === 0;
                      } catch {
                        return false;
                      }
                    };
                    
                    // Safely extract error message - ensure it's always a string
                    let errorMessage: string;
                    if (typeof errorData === 'string') {
                      errorMessage = errorData;
                    } else if (errorData?.message && typeof errorData.message === 'string') {
                      errorMessage = errorData.message;
                    } else if (errorData && typeof errorData === 'object') {
                      // Check if it's an empty object first
                      if (isEmptyObject(errorData)) {
                        errorMessage = 'Failed to generate itinerary';
                      } else {
                        // Try to extract meaningful error message from validation errors
                        const details = errorData.details || errorData.zodIssues;
                        if (details && typeof details === 'string') {
                          // Parse validation error details if it's a JSON string
                          try {
                            const parsedDetails = JSON.parse(details);
                            if (Array.isArray(parsedDetails) && parsedDetails.length > 0) {
                              const firstError = parsedDetails[0];
                              if (firstError.code === 'too_small' && firstError.minimum) {
                                errorMessage = `Validation error: ${firstError.type || 'field'} must be at least ${firstError.minimum} characters`;
                              } else if (firstError.message) {
                                errorMessage = firstError.message;
                              } else {
                                errorMessage = errorData.message || 'Failed to parse itinerary';
                              }
                            } else {
                              errorMessage = errorData.message || 'Failed to parse itinerary';
                            }
                          } catch {
                            // If parsing fails, use the details string or message
                            errorMessage = errorData.message || details || 'Failed to parse itinerary';
                          }
                        } else if (details && Array.isArray(details) && details.length > 0) {
                          const firstError = details[0];
                          if (firstError.code === 'too_small' && firstError.minimum) {
                            errorMessage = `Validation error: ${firstError.type || 'field'} must be at least ${firstError.minimum} characters`;
                          } else if (firstError.message) {
                            errorMessage = firstError.message;
                          } else {
                            errorMessage = errorData.message || 'Failed to parse itinerary';
                          }
                        } else {
                          // Try to stringify if it's an object, but provide fallback
                          try {
                            const stringified = JSON.stringify(errorData);
                            errorMessage = errorData.message || `Error: ${stringified}`;
                          } catch {
                            errorMessage = errorData.message || 'Failed to generate itinerary';
                          }
                        }
                      }
                    } else {
                      errorMessage = 'Failed to generate itinerary';
                    }
                    
                    const errorDetails = errorData?.details || errorData?.zodIssues;
                    
                    // Log with better structure for debugging - only log if there's meaningful data
                    const logData: Record<string, any> = {
                      message: errorMessage,
                    };
                    
                    // Only add properties if they have meaningful values
                    if (errorDetails !== undefined && errorDetails !== null && !isEmptyObject(errorDetails)) {
                      logData.details = errorDetails;
                    }
                    if (errorData !== undefined && errorData !== null && !isEmptyObject(errorData)) {
                      // Only include rawErrorData if it's not empty
                      if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
                        logData.rawErrorData = errorData;
                        try {
                          const stringified = typeof errorData === 'object' 
                            ? JSON.stringify(errorData) 
                            : String(errorData);
                          if (stringified !== '{}') {
                            logData.errorDataStringified = stringified;
                          }
                        } catch (e) {
                          // Skip if stringification fails
                        }
                      }
                    }
                    
                    // Only log if we have meaningful data to show
                    if (Object.keys(logData).length > 1 || logData.message !== 'Failed to generate itinerary') {
                      console.error('[itinerary-tab] SSE error:', logData);
                    } else {
                      // For empty objects, log a simpler message
                      console.error('[itinerary-tab] SSE error: Failed to generate itinerary');
                    }
                    
                    // If we have partial data, show it but also show the error
                    setSmartItinerary(prev => {
                      if (prev && prev.days && prev.days.length > 0) {
                        setError(errorMessage);
                        setStatus('loaded'); // Show partial data
                        lastLoadedTripIdRef.current = tripId;
                        lastLoadedItineraryRef.current = prev;
                        setTimeout(() => triggerAutoBackfillRef.current?.(), 3000);
                        return prev;
                      } else {
                        setError(errorMessage);
                        setStatus('error');
                        return null;
                      }
                    });
                    break;
                }
              } catch (err) {
                console.error('[itinerary-tab] Error parsing SSE message:', err, line);
                streamErrorOccurred = true;
              }
            }
          } // end for loop
        } // end while loop
        } catch (readerError: any) {
          console.error('[itinerary-tab] SSE stream reading error:', {
            error: readerError,
            message: readerError?.message,
            stack: readerError?.stack,
            hasPartialData: partialItinerary.days && partialItinerary.days.length > 0
          });
          streamErrorOccurred = true;
          
          // If we have partial data, show it but also show the error
          if (partialItinerary.days && partialItinerary.days.length > 0) {
            setSmartItinerary(partialItinerary as SmartItinerary);
            setError(readerError?.message || 'Stream interrupted while generating itinerary');
            setStatus('loaded');
            lastLoadedTripIdRef.current = tripId;
            lastLoadedItineraryRef.current = partialItinerary as SmartItinerary;
            setTimeout(() => triggerAutoBackfillRef.current?.(), 3000);
          } else {
            setError(readerError?.message || 'Failed to read itinerary stream');
            setStatus('error');
          }
        } finally {
          // Ensure reader is released
          try {
            reader.releaseLock();
          } catch (e) {
            // Reader may already be released
          }
        }
        
        // If we completed without error and no stream error occurred, mark as loaded
        if (!streamErrorOccurred) {
          // Check if we have partial data
          setSmartItinerary(prev => {
            if (prev && prev.days && prev.days.length > 0) {
              setStatus('loaded');
              lastLoadedTripIdRef.current = tripId;
              lastLoadedItineraryRef.current = prev;
              return prev;
            } else {
              // No data received, treat as error
              setError(t('itinerary_error_no_data'));
              setStatus('error');
              return null;
            }
          });
        }
      } else {
        // Fallback: non-streaming response (for backwards compatibility)
        const json = await res.json();
        console.log('[itinerary-tab] generateSmartItinerary: received itinerary from POST', json);
        
        // Validate structure before setting state
        try {
          if (!json) {
            console.error('[itinerary-tab] generateSmartItinerary: received null/undefined data');
            setError(t('itinerary_error_invalid_data'));
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
            setError(t('itinerary_error_invalid_format'));
            setStatus('error');
            return;
          }
          
          // Deduplicate days by index to prevent duplicate Day 1 (non-streaming fallback)
          const deduplicatedDays = new Map<number, any>();
          for (const day of json.days) {
            if (day.index !== undefined) {
              // Keep the last occurrence of each index (most complete version)
              deduplicatedDays.set(day.index, day);
            }
          }
          const sortedDays = Array.from(deduplicatedDays.values()).sort((a, b) => a.index - b.index);
          
          // Ensure tripTips is an array (default to empty if missing)
          const validatedData = {
            ...json,
            days: sortedDays,
            tripTips: Array.isArray(json.tripTips) ? json.tripTips : [],
          };
          
          setSmartItinerary(validatedData);
          setStatus('loaded');
          lastLoadedTripIdRef.current = tripId;
          lastLoadedItineraryRef.current = validatedData;
          // Mark overview as ready if present, or confirmed missing if not
                      if (validatedData.cityOverview) {
                        setOverviewState('ready');
                      } else {
                        setOverviewState('missing');
                      }
                      setBufferedDays([]);
          // Trigger auto-backfill after itinerary is loaded
          setTimeout(() => triggerAutoBackfillRef.current?.(), 3000);
        } catch (parseErr: any) {
          console.error('[itinerary-tab] generateSmartItinerary: error validating non-streaming data', {
            error: parseErr,
            message: parseErr?.message,
            dataReceived: json
          });
          setError(t('itinerary_error_failed_parse'));
          setStatus('error');
        }
      }
    } catch (err) {
      console.error('[itinerary-tab] generateSmartItinerary error', err);
      setError(t('itinerary_error_failed_generate'));
      setStatus('error');
    }
  }, [tripId, addToast, isActive, t, language]);

  const loadOrGenerate = useCallback(async () => {
    if (!isActive) return;
    if (!tripId) {
      console.warn('[itinerary-tab] loadOrGenerate: missing tripId');
      return;
    }

    console.log('[itinerary-tab] loadOrGenerate: start for trip', tripId);
    setStatus('loading');
    setError(null);
    // Reset overview state when loading
    setOverviewState('pending');
    setBufferedDays([]);

    try {
      const res = await fetch(`/api/trips/${tripId}/smart-itinerary?mode=load`);

      // CASE 1: no itinerary yet → use in-memory data if we have it, else trigger generation
      if (res.status === 404) {
        const existing = lastLoadedItineraryRef.current;
        if (
          lastLoadedTripIdRef.current === tripId &&
          existing?.days &&
          Array.isArray(existing.days) &&
          existing.days.length > 0
        ) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[itinerary-tab] 404 but have in-memory itinerary for this trip, keeping it');
          }
          setSmartItinerary(existing);
          setStatus('loaded');
          setOverviewState(existing.cityOverview ? 'ready' : 'missing');
          return;
        }
        if (process.env.NODE_ENV === 'development') {
          console.log('[itinerary-tab] No itinerary found (404), starting generation…');
        }
        setStatus('generating');
        await generateSmartItinerary();
        return;
      }

      // CASE 2: other errors - log once and fall back to generation
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        // Only log error details once, don't spam console
        console.error('[itinerary-tab] loadOrGenerate: error loading itinerary', { 
          status: res.status, 
          error: errorData.error,
          tripId 
        });
        // Don't show toast for 404 - it's expected. Only show for other errors.
        if (res.status !== 404) {
          addToast({
            variant: 'destructive',
            title: t('itinerary_toast_failed_load'),
            description: errorData.error || t('itinerary_toast_please_try_again'),
          });
        }
        // Fall back to generation instead of throwing - ensures SSE can still work
        console.log('[itinerary-tab] Falling back to generation due to load error');
        setStatus('generating');
        await generateSmartItinerary();
        return;
      }

      // CASE 3: we have data
      const json = await res.json();
      console.log('[itinerary-tab] loadOrGenerate: loaded itinerary from DB', json);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[itinerary-tab] cityOverview check:', {
          hasCityOverview: !!json.cityOverview,
          cityOverviewKeys: json.cityOverview ? Object.keys(json.cityOverview) : [],
          needsRegeneration: !json.cityOverview
        });
        if (!json.cityOverview) {
          console.warn('[itinerary-tab] cityOverview missing - itinerary needs to be regenerated to see City Overview cards');
        }
      }
      
      // Validate structure before setting state
      try {
        if (!json) {
          console.error('[itinerary-tab] loadOrGenerate: received null/undefined data');
          setError(t('itinerary_error_invalid_data'));
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
          setError(t('itinerary_error_invalid_format'));
          setStatus('error');
          return;
        }
        
        // Deduplicate days by index to prevent duplicate Day 1 (database load)
        const deduplicatedDays = new Map<number, any>();
        for (const day of json.days) {
          if (day.index !== undefined) {
            // Keep the last occurrence of each index (most complete version)
            deduplicatedDays.set(day.index, day);
          }
        }
        const sortedDays = Array.from(deduplicatedDays.values()).sort((a, b) => a.index - b.index);
        
        // Ensure tripTips is an array (default to empty if missing)
        const validatedData = {
          ...json,
          days: sortedDays,
          tripTips: Array.isArray(json.tripTips) ? json.tripTips : [],
        };
        
        // GET handler now returns bare SmartItinerary directly
        setSmartItinerary(validatedData);
        setStatus('loaded');
        lastLoadedTripIdRef.current = tripId;
        lastLoadedItineraryRef.current = validatedData;

        // Handle cityOverview: if present, mark as ready; if missing, mark as confirmed missing
        if (validatedData.cityOverview) {
          setOverviewState('ready');
        } else {
          setOverviewState('missing');
        }
        setBufferedDays([]);
        // Trigger backfill when loading from DB (delay so DB is ready; didAutoBackfillRef prevents double-run)
        setTimeout(() => triggerAutoBackfillRef.current?.(), 3000);
        
        // Dev-only log: verify image_url values exist in fetched data
        if (process.env.NODE_ENV === 'development') {
          const samplePlace = validatedData.days?.[0]?.slots?.[0]?.places?.[0];
          if (samplePlace) {
            console.log('[itinerary-tab] loadOrGenerate: sample place after fetch', {
              placeName: samplePlace.name,
              hasImageUrl: !!samplePlace.image_url,
              imageUrl: samplePlace.image_url ? samplePlace.image_url.substring(0, 80) + '...' : null,
              hasPhotos: !!samplePlace.photos && Array.isArray(samplePlace.photos) && samplePlace.photos.length > 0,
              photosLength: Array.isArray(samplePlace.photos) ? samplePlace.photos.length : 0,
            });
          }
        }
      } catch (parseErr: any) {
        console.error('[itinerary-tab] loadOrGenerate: error validating loaded data', {
          error: parseErr,
          message: parseErr?.message,
          dataReceived: json
        });
        setError(t('itinerary_error_failed_parse_loaded'));
        setStatus('error');
      }
    } catch (err) {
      console.error('[itinerary-tab] loadOrGenerate error', err);
      setError(t('itinerary_error_failed_load'));
      setStatus('error');
    }
  }, [tripId, generateSmartItinerary, addToast, isActive, t]);

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

    const MAX_BACKFILL_RUNS = 5;
    const DELAY_BETWEEN_RUNS_MS = 1500;
    const MAX_404_RETRIES = 2;
    const DELAY_404_MS = 2000;

    try {
      let runCount = 0;
      let hasMore = true;
      let retry404Count = 0;

      while (hasMore && runCount < MAX_BACKFILL_RUNS) {
        runCount++;
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
          if (response.status === 404 && retry404Count < MAX_404_RETRIES) {
            retry404Count++;
            runCount--;
            if (process.env.NODE_ENV === 'development') {
              console.log('[itinerary-tab] triggerAutoBackfill: 404 (itinerary may not be saved yet), retrying in', DELAY_404_MS, 'ms', { retry: retry404Count });
            }
            await new Promise((r) => setTimeout(r, DELAY_404_MS));
            continue;
          }
          // Reset so backfill can retry on next load when user returns/refreshes
          if (response.status === 404) {
            didAutoBackfillRef.current = false;
          }
          throw new Error(errorData.error || `Backfill failed with status ${response.status}`);
        }

        const result = await response.json();
        hasMore = result.hasMore === true;

        if (process.env.NODE_ENV === 'development') {
          console.log('[itinerary-tab] triggerAutoBackfill: run', runCount, {
            scanned: result.scanned,
            updated: result.updated,
            notFound: result.notFound,
            errors: result.errors,
            hasMore,
          });
        }

        if (hasMore && runCount < MAX_BACKFILL_RUNS) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_RUNS_MS));
        }
      }

      // Refresh itinerary data to show new images
      // Add small delay to ensure DB write has propagated
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadOrGenerate();

      if (process.env.NODE_ENV === 'development') {
        console.log('[itinerary-tab] triggerAutoBackfill: completed', runCount, 'runs, refreshed itinerary');
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[itinerary-tab] triggerAutoBackfill: error', error);
      }
      // Don't show error toast - this is a background process
      // Don't break the UI - just log and continue
    } finally {
      setIsBackfillingImages(false);
    }
  }, [tripId, loadOrGenerate]);

  // Store triggerAutoBackfill in ref so generateSmartItinerary can call it
  useEffect(() => {
    triggerAutoBackfillRef.current = triggerAutoBackfill;
  }, [triggerAutoBackfill]);

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

  // 1. Load existing or start generation (skip when returning to tab if already loaded for this trip)
  useEffect(() => {
    if (!isActive) return;
    if (lastLoadedTripIdRef.current === tripId) return;
    didAutoBackfillRef.current = false;
    loadOrGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, isActive]);

  // Initialize expanded days with first day expanded (only once on initial load)
  // This allows users to collapse all days without forcing another to open
  useEffect(() => {
    if (smartItinerary?.days && smartItinerary.days.length > 0 && !hasInitializedRef.current) {
      setExpandedDays([smartItinerary.days[0].id]);
      hasInitializedRef.current = true;
    }
  }, [smartItinerary]);

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
            title: t('itinerary_toast_cannot_modify_past'),
            description: errorData.message || t('itinerary_toast_cannot_modify_past_desc'),
          });
          return;
        }

        throw new Error(errorData.error || 'Failed to update');
      }
    } catch (error) {
      console.error("Failed to sync place update", error);
      // Rollback optimistic update
      setSmartItinerary(smartItinerary);
      addToast({ variant: "destructive", title: t('itinerary_toast_failed_save') });
    }
  };

  // Handle replacing an activity with a similar one
  const handleReplaceActivity = async (dayId: string, placeId: string) => {
    if (!isActive) return;
    if (!smartItinerary) return;

    // Show loading state
    addToast({
      title: t('itinerary_toast_finding_replacement'),
      description: t('itinerary_toast_looking_similar'),
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
            title: t('itinerary_toast_cannot_modify_past'),
            description: errorData.message || t('itinerary_toast_cannot_modify_past_desc'),
          });
          return;
        }

        if (errorData.error === 'no_replacement_found') {
          addToast({
            variant: 'destructive',
            title: t('itinerary_toast_no_replacement'),
            description: errorData.message || t('itinerary_toast_no_replacement_desc'),
          });
          return;
        }

        throw new Error(errorData.error || 'Failed to replace activity');
      }

      const result = await response.json();

      // Reload itinerary to show the updated place
      await loadOrGenerate();

      addToast({
        title: t('itinerary_toast_activity_replaced'),
        description: t('itinerary_toast_changed_to').replace('{name}', result.activity.name),
        variant: 'success',
      });
    } catch (error) {
      console.error("Failed to replace activity", error);
      addToast({
        variant: 'destructive',
        title: t('itinerary_toast_failed_replace'),
        description: error instanceof Error ? error.message : t('itinerary_toast_please_try_again'),
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


  if (tripLoading) return <div className="p-6">{t('itinerary_loading')}</div>;
  if (!trip) return <div className="p-6">{t('itinerary_trip_not_found')}</div>;

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

  // City Overview Skeleton Component
  const CityOverviewSkeleton = () => (
    <div className="mt-8 mb-10 max-w-4xl mx-auto">
      <div className="h-7 w-48 bg-slate-200 rounded mb-4 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-4 shadow-sm border-2 border-slate-200">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
                <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const ErrorCard = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <Card className="bg-red-50 border-red-200 text-slate-800 max-w-4xl mx-auto mt-6 mb-8">
      <CardHeader>
        <CardTitle className="text-red-900">{t('itinerary_error_could_not_load')}</CardTitle>
        <CardDescription className="text-red-700">{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onRetry}
          variant="outline" 
          className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
        >
          {t('itinerary_retry')}
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
            <Logo size="sm" className="hover:opacity-80 transition-opacity" />
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
              {t('trip_tabs_tripmates')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              {t('itinerary_share')}
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
                      <Trash2 className="h-4 w-4" /> {t('itinerary_delete_trip')}
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
              title={t('itinerary_generating_title')}
              subtitle={t('itinerary_generating_subtitle_loading')}
            />
          )}

          {/* Generating State - show only before any partial data (intro not yet received) */}
          {status === 'generating' && !draft.summary && !draft.title && !draft.cityOverview && (!draft.days || draft.days.length === 0) && (
            <LoadingCard
              title={t('itinerary_generating_title')}
              subtitle={t('itinerary_generating_subtitle_designing')}
            />
          )}

          {/* Error State */}
          {status === 'error' && (
            <ErrorCard
              message={error ?? t('itinerary_error_something_wrong')}
              onRetry={loadOrGenerate}
            />
          )}

          {/* Itinerary (loaded or generating with partial data) - Show if we have any data */}
          {(status === 'loaded' || (status === 'generating' && (smartItinerary || draft.title || draft.summary))) && (smartItinerary || draft.title || draft.summary || status === 'generating') && (
            <>
              {/* Get effective data: prefer smartItinerary, fallback to draft */}
              {(() => {
                const effectiveData = smartItinerary || {
                  title: draft.title || '',
                  summary: draft.summary || '',
                  days: draft.days || [],
                  tripTips: draft.tripTips || [],
                  cityOverview: draft.cityOverview,
                };
                
                // Safety guard: check if days is a valid array
                if (effectiveData.days && !Array.isArray(effectiveData.days)) {
                  return (
                    <ErrorCard
                      message={t('itinerary_error_problem_regenerate')}
                      onRetry={loadOrGenerate}
                    />
                  );
                }
                
                return (
                  <div className="space-y-8 pb-10">
                    {/* Trip Summary - Show as soon as we have title/summary/tripTips */}
                    {(effectiveData.title || effectiveData.summary || (effectiveData.tripTips && effectiveData.tripTips.length > 0)) && (
                      <div className="space-y-4 mb-10 max-w-4xl mx-auto">
                        {effectiveData.title && (
                          <h2 className="text-3xl font-bold text-slate-900 text-center" style={{ fontFamily: "'Patrick Hand', cursive" }}>{effectiveData.title}</h2>
                        )}
                        {effectiveData.summary && (
                          <div className="prose prose-neutral max-w-none text-slate-900 text-left">
                            {(() => {
                              if (process.env.NODE_ENV === 'development' && effectiveData.summary) {
                                console.log('[itinerary-tab] UI rendering summary:', new Date().toISOString());
                              }
                              return null;
                            })()}
                            <ul className="list-disc pl-5 space-y-2 text-base leading-relaxed">
                              {textToBulletPoints(effectiveData.summary).map((point, idx) => (
                                <li key={idx} className="font-normal">
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {effectiveData.tripTips && effectiveData.tripTips.length > 0 && (
                          <div className="mt-6 text-left max-w-3xl mx-auto">
                            <h3 className="text-lg font-bold text-slate-900 mb-3" style={{ fontFamily: "'Patrick Hand', cursive" }}>{t('itinerary_trip_tips')}</h3>
                            <ul className="list-disc pl-5 space-y-2 text-base text-slate-700 leading-relaxed">
                              {effectiveData.tripTips.map((tip, i) => (
                                <li key={i}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* City Overview Cards - Show before days, with skeleton while loading */}
                    {(() => {
                      const effectiveCityOverview = effectiveData.cityOverview || draft.cityOverview;
                      
                      if (process.env.NODE_ENV === 'development') {
                        console.log('[itinerary-tab] Rendering check:', {
                          hasCityOverview: !!effectiveCityOverview,
                          cityOverview: effectiveCityOverview ? 'present' : 'missing',
                          overviewState,
                          status,
                          fromDraft: !!draft.cityOverview,
                          fromSmartItinerary: !!effectiveData.cityOverview,
                        });
                      }
                      
                      // Show actual cards immediately when cityOverview data exists
                      if (effectiveCityOverview) {
                        return <CityOverviewCards cityOverview={effectiveCityOverview} />;
                      }
                      
                      // Show "generating city overview" indicator and skeleton when overview hasn't arrived yet
                      if (status === 'generating' && overviewState === 'pending') {
                        if (process.env.NODE_ENV === 'development') {
                          console.log('[itinerary-tab] UI showing skeleton:', new Date().toISOString());
                        }
                        return (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                              <span>{t('itinerary_generating_overview')}</span>
                            </div>
                            <CityOverviewSkeleton />
                          </div>
                        );
                      }
                      
                      // Don't show anything if overview is confirmed missing (backwards compatibility)
                      return null;
                    })()}

                    {/* Days - Grouped by segments if multi-city - Render progressively as they arrive */}
                    {/* Only render days if overviewState is not pending */}
                    {overviewState !== 'pending' && (
                      <div className="space-y-12">
                        {effectiveData.days && effectiveData.days.length > 0 ? (() => {
                      // Group days by segment if multi-city
                      if (segments.length > 1) {
                        const groupedDays: Array<{ segment: typeof segments[0] | null; days: ItineraryDay[] }> = [];
                        let currentSegment: typeof segments[0] | null = null;
                        let currentDays: ItineraryDay[] = [];

                          effectiveData.days.forEach((day, index) => {
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
                                    title: t('itinerary_travel_day').replace('{from}', prevSegment.city_name).replace('{to}', currentSegment.city_name),
                                    theme: 'Travel',
                                    areaCluster: '',
                                    photos: [],
                                    overview: t('itinerary_travel_day_overview').replace('{from}', prevSegment.city_name).replace('{to}', currentSegment.city_name),
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
                            {group.days.map((day) => {
                  const bannerImages = getDayBannerImages(day);
                  const dayImages = (day.photos && day.photos.length > 0)
                    ? day.photos.map(photo => resolvePlacePhotoSrc(photo)).filter((src): src is string => src !== null)
                    : day.slots.flatMap(s => s.places.map(p => resolvePlacePhotoSrc(p))).filter((src): src is string => src !== null);
                  const isExpanded = expandedDays.includes(day.id);

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
                      key={`day-${day.index}-${day.id}`} 
                      id={`day-${day.id}`}
                      className={`overflow-hidden border shadow-sm transition-all ${selectedDayId === day.id ? 'ring-2 ring-primary' : ''}`}
                    >
                      <DayAccordionHeader
                        day={day}
                        isExpanded={isExpanded}
                        onToggle={() => {
                          setExpandedDays(prev => {
                            if (prev.includes(day.id)) {
                              return prev.filter(id => id !== day.id);
                            } else {
                              return [...prev, day.id];
                            }
                          });
                        }}
                        onSelectDay={onSelectDay}
                      />
                      
                      {isExpanded && (
                        <>
                          {/* Image Gallery - always 4 slots (placeholder for missing) */}
                          {(() => {
                            const validImages = bannerImages.filter((img, idx): img is string => {
                              const imageKey = `${day.id}-banner-${idx}`;
                              return !failedImages.has(imageKey) && isPhotoSrcUsable(img);
                            });
                            if (validImages.length === 0) return null;
                            return (
                              <div className="w-full flex gap-0.5 bg-gray-100 overflow-hidden rounded-t-xl">
                                {[0, 1, 2, 3].map((idx) => {
                                  const imageKey = `${day.id}-banner-${idx}`;
                                  const img = validImages[idx];
                                  if (img && isPhotoSrcUsable(img)) {
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
                                          openLightbox(img, dayImages.filter((i): i is string => isPhotoSrcUsable(i)));
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
                                  }
                                  return (
                                    <div
                                      key={imageKey}
                                      className="relative flex-1 min-w-0 aspect-[4/3] bg-gray-200 overflow-hidden"
                                      aria-hidden
                                    />
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
                                  {/* Moment of day label */}
                                  <div className="flex justify-center md:justify-center">
                                    <span className="text-base uppercase tracking-wide text-slate-600 font-bold" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                                      {translateSlotLabel(slot.label)}
                                    </span>
                                  </div>
                                  
                                  {/* Enhanced summary text - more prominent */}
                                  {renderSlotSummary(slot.summary)}
                                  
                                  {/* Places section header */}
                                  {slot.places.length > 0 && (
                                    <div className="mb-4">
                                      <h3 className="text-sm font-semibold text-slate-600 tracking-wide">
                                        Places to see in this area
                                      </h3>
                                    </div>
                                  )}
                                  
                                  {/* Simplified place cards */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {slot.places.map((place, placeIndex) => {
                                      // Use shared photo resolver
                                      const photoSrc = resolvePlacePhotoSrc(place);
                                      const imageKey = `${day.id}-${slotIdx}-${place.place_id ?? place.id ?? placeIndex}-photo`;
                                      
                                      return (
                                      <div 
                                        key={`${day.id}:${slotIdx}:${placeIndex}`} 
                                        className="flex items-start gap-4 p-4 rounded-lg border bg-white"
                                      >
                                        <div className="flex-shrink-0 relative w-full sm:w-24 h-48 sm:h-24 rounded-md overflow-hidden bg-gray-200">
                                          {photoSrc && !failedImages.has(imageKey) ? (() => {
                                            const shouldUnoptimize = isPlacesProxy(photoSrc);
                                            if (process.env.NODE_ENV === 'development' && placeIndex === 0 && slotIdx === 0) {
                                              console.log('[ItineraryTab] Place activity image (dev log):', { 
                                                placeName: place.name,
                                                hasImageUrl: !!place.image_url,
                                                imageUrl: place.image_url ? place.image_url.substring(0, 80) + '...' : null,
                                                hasPhotos: !!place.photos && Array.isArray(place.photos) && place.photos.length > 0,
                                                resolvedSrc: photoSrc.substring(0, 80) + '...',
                                                unoptimized: shouldUnoptimize 
                                              });
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
                                          <h4 className="font-bold text-lg text-slate-900" style={{ fontFamily: "'Patrick Hand', cursive" }}>{place.name}</h4>
                                          <p className="text-slate-700 text-sm mt-2 leading-relaxed break-words">
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
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Affiliate Buttons - Moved below activities */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                          <div className="flex flex-wrap gap-3">
                            <AffiliateButton kind="hotel" day={day} t={t as (key: string) => string} />
                            <AffiliateButton kind="tour" day={day} t={t as (key: string) => string} />
                            <AffiliateButton kind="sim" day={day} t={t as (key: string) => string} />
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
                        // Single-city trip: render days normally
                        return (
                          <>
                            {effectiveData.days.map((day) => {
                  const bannerImages = getDayBannerImages(day);
                  const dayImages = (day.photos && day.photos.length > 0)
                    ? day.photos.map(photo => resolvePlacePhotoSrc(photo)).filter((src): src is string => src !== null)
                    : day.slots.flatMap(s => s.places.map(p => resolvePlacePhotoSrc(p))).filter((src): src is string => src !== null);
                  const isExpanded = expandedDays.includes(day.id);

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
                      key={`day-${day.index}-${day.id}`} 
                      id={`day-${day.id}`}
                      className={`overflow-hidden border shadow-sm transition-all ${selectedDayId === day.id ? 'ring-2 ring-primary' : ''}`}
                    >
                      <DayAccordionHeader
                        day={day}
                        isExpanded={isExpanded}
                        onToggle={() => {
                          setExpandedDays(prev => {
                            if (prev.includes(day.id)) {
                              return prev.filter(id => id !== day.id);
                            } else {
                              return [...prev, day.id];
                            }
                          });
                        }}
                        onSelectDay={onSelectDay}
                      />
                      
                      {isExpanded && (
                        <>
                          {/* Image Gallery - always 4 slots (placeholder for missing) */}
                          {(() => {
                            const validImages = bannerImages.filter((img, idx): img is string => {
                              const imageKey = `${day.id}-banner-${idx}`;
                              return !failedImages.has(imageKey) && isPhotoSrcUsable(img);
                            });
                            if (validImages.length === 0) return null;
                            return (
                              <div className="w-full flex gap-0.5 bg-gray-100 overflow-hidden rounded-t-xl">
                                {[0, 1, 2, 3].map((idx) => {
                                  const imageKey = `${day.id}-banner-${idx}`;
                                  const img = validImages[idx];
                                  if (img && isPhotoSrcUsable(img)) {
                                    const shouldUnoptimize = isPlacesProxy(img);
                                    if (process.env.NODE_ENV === 'development' && idx === 0) {
                                      console.debug('[ItineraryTab] Banner image (single-city):', { src: img, unoptimized: shouldUnoptimize });
                                    }
                                    return (
                                      <div
                                        key={imageKey}
                                        className="relative flex-1 min-w-0 aspect-[4/3] cursor-pointer hover:opacity-90 transition-opacity bg-gray-200 overflow-hidden"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openLightbox(img, dayImages.filter((i): i is string => isPhotoSrcUsable(i)));
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
                                  }
                                  return (
                                    <div
                                      key={imageKey}
                                      className="relative flex-1 min-w-0 aspect-[4/3] bg-gray-200 overflow-hidden"
                                      aria-hidden
                                    />
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
                                  {/* Moment of day label */}
                                  <div className="flex justify-center md:justify-center">
                                    <span className="text-base uppercase tracking-wide text-slate-600 font-bold" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                                      {translateSlotLabel(slot.label)}
                                    </span>
                                  </div>
                                  
                                  {/* Enhanced summary text - more prominent */}
                                  {renderSlotSummary(slot.summary)}
                                  
                                  {/* Places section header */}
                                  {slot.places.length > 0 && (
                                    <div className="mb-4">
                                      <h3 className="text-sm font-semibold text-slate-600 tracking-wide">
                                        Places to see in this area
                                      </h3>
                                    </div>
                                  )}
                                  
                                  {/* Simplified place cards */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {slot.places.map((place, placeIndex) => {
                                      // Use shared photo resolver
                                      const photoSrc = resolvePlacePhotoSrc(place);
                                      const imageKey = `${day.id}-${slotIdx}-${place.place_id ?? place.id ?? placeIndex}-photo`;
                                      
                                      return (
                                      <div 
                                        key={`${day.id}:${slotIdx}:${placeIndex}`} 
                                        className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg border bg-white"
                                      >
                                        <div className="flex-shrink-0 relative w-full sm:w-24 h-48 sm:h-24 rounded-md overflow-hidden bg-gray-200">
                                          {photoSrc && !failedImages.has(imageKey) ? (() => {
                                            const shouldUnoptimize = isPlacesProxy(photoSrc);
                                            if (process.env.NODE_ENV === 'development' && placeIndex === 0 && slotIdx === 0) {
                                              console.log('[ItineraryTab] Place activity image (dev log):', { 
                                                placeName: place.name,
                                                hasImageUrl: !!place.image_url,
                                                imageUrl: place.image_url ? place.image_url.substring(0, 80) + '...' : null,
                                                hasPhotos: !!place.photos && Array.isArray(place.photos) && place.photos.length > 0,
                                                resolvedSrc: photoSrc.substring(0, 80) + '...',
                                                unoptimized: shouldUnoptimize 
                                              });
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
                                        <div className="min-w-0 flex-1 w-full sm:w-auto">
                                          <h4 className="font-bold text-lg text-slate-900 break-words" style={{ fontFamily: "'Patrick Hand', cursive" }}>{place.name}</h4>
                                          <p className="text-sm text-slate-700 mt-2 break-words leading-relaxed">{place.description}</p>
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
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Affiliate Buttons - Moved below activities */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                          <div className="flex flex-wrap gap-3">
                            <AffiliateButton kind="hotel" day={day} t={t as (key: string) => string} />
                            <AffiliateButton kind="tour" day={day} t={t as (key: string) => string} />
                            <AffiliateButton kind="sim" day={day} t={t as (key: string) => string} />
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

                {/* Loading placeholder after city overview while days are generated (shown even when 0 days) */}
                {status === 'generating' && (overviewState === 'ready' || overviewState === 'missing') && (
                  <Card className="bg-gray-50 border-gray-200">
                    <CardHeader className="bg-gray-50 border-b pb-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        <CardTitle className="text-lg font-medium text-gray-500">
                          {t('itinerary_generating_more_days')}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-sm text-gray-500">{t('itinerary_generating_rest')}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Fallback: if status is loaded but no itinerary (shouldn't happen, but safety check) */}
                {status === 'loaded' && !smartItinerary && (
                  <ErrorCard
                    message={t('itinerary_error_no_itinerary')}
                    onRetry={loadOrGenerate}
                  />
                )}

                {/* Fallback: if status is idle (shouldn't happen after mount, but safety check) */}
                {(status as ItineraryStatus) === 'idle' && (
                  <LoadingCard
                    title={t('itinerary_generating_title')}
                    subtitle={t('itinerary_preparing')}
                  />
                )}
        </div>
      )}
      </div>
              );
            })()}
          </>
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
                ? t('itinerary_add_to_slot').replace('{slot}', selectedDayForExplore.slot)
                : t('itinerary_add_to_day')}
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
