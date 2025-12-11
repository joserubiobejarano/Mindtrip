"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Users, MoreVertical, Trash2, Loader2, MapPin, Check, X, ChevronLeft, ChevronRight, Send, Plus, ChevronDown, ChevronUp } from "lucide-react";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ExploreDeck } from "@/components/explore/ExploreDeck";
import { ExploreFilters } from "@/components/explore/ExploreFilters";
import type { ExploreFilters as ExploreFiltersType } from "@/lib/google/explore-places";
import { isPastDay } from "@/lib/utils/date-helpers";
import { getDayActivityCount, MAX_ACTIVITIES_PER_DAY } from "@/lib/supabase/smart-itineraries";

type ItineraryStatus = 'idle' | 'loading' | 'generating' | 'loaded' | 'error';

interface ItineraryTabProps {
  tripId: string;
  userId: string;
  selectedDayId?: string | null;
  onSelectDay?: (dayId: string) => void;
  onActivitySelect?: (activityId: string) => void;
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
  
  // Chat state
  const [chatMessage, setChatMessage] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  
  // Day-level Explore state
  const [dayExploreOpen, setDayExploreOpen] = useState(false);
  const [selectedDayForExplore, setSelectedDayForExplore] = useState<{ dayId: string; slot?: 'morning' | 'afternoon' | 'evening'; areaCluster?: string } | null>(null);
  const [dayExploreFilters, setDayExploreFilters] = useState<ExploreFiltersType>({});
  
  const router = useRouter();
  const { addToast } = useToast();
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const { data: trip, isLoading: tripLoading } = useTrip(tripId);
  const { data: segments = [], isLoading: segmentsLoading } = useTripSegments(tripId);
  const [daysWithSegments, setDaysWithSegments] = useState<Map<string, string>>(new Map()); // day date -> segment_id

  const generateSmartItinerary = useCallback(async () => {
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
                    // Final complete itinerary
                    setSmartItinerary(data.data);
                    setStatus('loaded');
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
        setSmartItinerary(json);
        setStatus('loaded');
      }
    } catch (err) {
      console.error('[itinerary-tab] generateSmartItinerary error', err);
      setError('Failed to generate itinerary. Please try again.');
      setStatus('error');
    }
  }, [tripId, addToast]);

  const loadOrGenerate = useCallback(async () => {
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
        throw new Error(`Failed to load itinerary: ${res.status}`);
      }

      // CASE 3: we have data
      const json = await res.json();
      console.log('[itinerary-tab] loadOrGenerate: loaded itinerary from DB', json);
      // GET handler now returns bare SmartItinerary directly
      setSmartItinerary(json);
      setStatus('loaded');
    } catch (err) {
      console.error('[itinerary-tab] loadOrGenerate error', err);
      setError('Failed to load itinerary. Please try again.');
      setStatus('error');
    }
  }, [tripId, generateSmartItinerary]);

  // Load days with segment info
  useEffect(() => {
    if (tripId && segments.length > 0) {
      const supabase = createClient();
      supabase
        .from('days')
        .select('id, date, trip_segment_id')
        .eq('trip_id', tripId)
        .then(({ data: days }) => {
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
  }, [tripId, segments]);

  // 1. Load existing or start generation
  useEffect(() => {
    loadOrGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  // Initialize expanded days with first day expanded
  useEffect(() => {
    if (smartItinerary?.days && smartItinerary.days.length > 0 && expandedDays.size === 0) {
      setExpandedDays(new Set([smartItinerary.days[0].id]));
    }
  }, [smartItinerary, expandedDays.size]);

  // Handle manual updates (visited, remove)
  // Since we have slots now, finding the place is a bit deeper.
  const handleUpdatePlace = async (dayId: string, placeId: string, updates: { visited?: boolean, remove?: boolean }) => {
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

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isChatting) return;

    setIsChatting(true);
    setChatError(null);
    const msg = chatMessage;
    
    try {
      const res = await fetch(`/api/trips/${tripId}/itinerary-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });

      if (!res.ok) {
        setChatError('Failed to save itinerary');
        setIsChatting(false);
        return;
      }

      const json = await res.json();
      // itinerary-chat now returns bare SmartItinerary directly
      if (json && json.days) {
        setSmartItinerary(json);
        setChatMessage("");
      }
    } catch (error: any) {
      console.error(error);
      setChatError('Failed to save itinerary');
    } finally {
      setIsChatting(false);
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
              alt="Kruno" 
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
                      {smartItinerary.title && (
                        <h2 className="text-3xl font-bold text-slate-900 text-center" style={{ fontFamily: "'Patrick Hand', cursive" }}>{smartItinerary.title}</h2>
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
                  // Gather all photos from slots for the gallery
                  const dayImages = (day.photos && day.photos.length > 0) 
                    ? day.photos 
                    : day.slots.flatMap(s => s.places.flatMap(p => p.photos || []));
                  
                  const bannerImages = dayImages.slice(0, 4);
                  const isExpanded = expandedDays.has(day.id);

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
                            const validImages = bannerImages.filter((img, idx) => {
                              const imageKey = `${day.id}-banner-${idx}`;
                              return !failedImages.has(imageKey) && img;
                            });

                            if (validImages.length === 0) {
                              return null; // Don't render empty gallery
                            }

                            return (
                              <div className="w-full flex gap-0.5 bg-gray-100 overflow-hidden rounded-t-xl">
                                {validImages.map((img, idx) => {
                                  const imageKey = `${day.id}-banner-${idx}`;
                                  return (
                                    <div 
                                      key={imageKey} 
                                      className="relative flex-1 min-w-0 aspect-[4/3] cursor-pointer hover:opacity-90 transition-opacity bg-gray-200 overflow-hidden"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openLightbox(img, dayImages);
                                      }}
                                    >
                                      <Image 
                                        src={img} 
                                        alt={day.title ? `${day.title} photo ${idx + 1}` : `Trip photo ${idx + 1}`} 
                                        fill 
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
                                    {slot.places.map((place) => (
                                      <div 
                                        key={place.id} 
                                        className={`flex flex-col sm:flex-row gap-4 p-4 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer ${place.visited ? 'bg-slate-50 opacity-75' : 'bg-white'}`}
                                        onClick={(e) => {
                                          onActivitySelect?.(place.id);
                                        }}
                                      >
                                        <div className="flex-shrink-0 relative w-full sm:w-24 h-48 sm:h-24 rounded-md overflow-hidden bg-gray-200">
                                          {place.photos && place.photos[0] && !failedImages.has(`${place.id}-photo`) ? (
                                            <Image 
                                              src={place.photos[0]} 
                                              alt={`Photo for ${place.name}`}
                                              fill 
                                              className="object-cover"
                                              key={`${place.id}-photo`}
                                              onError={() => {
                                                setFailedImages(prev => new Set(prev).add(`${place.id}-photo`));
                                              }}
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                              <MapPin className="h-8 w-8" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                            <h4 className="font-bold text-lg text-slate-900" style={{ fontFamily: "'Patrick Hand', cursive" }}>{place.name}</h4>
                                            <div className="flex gap-2 self-start">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleUpdatePlace(day.id, place.id, { visited: !place.visited });
                                                }}
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition h-7 gap-1.5 ${
                                                  place.visited
                                                    ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                    : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                }`}
                                              >
                                                {place.visited && <Check className="h-3 w-3" />}
                                                {place.visited ? "Visited" : "Mark as visited"}
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (dayIsPast || dayIsAtCapacity) return;
                                                  handleReplaceActivity(day.id, place.id);
                                                }}
                                                disabled={dayIsPast || dayIsAtCapacity}
                                                title={
                                                  dayIsPast
                                                    ? "This day has already passed, so you can't modify it anymore."
                                                    : dayIsAtCapacity
                                                    ? "This day is already at capacity."
                                                    : undefined
                                                }
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition h-7 ${
                                                  dayIsPast || dayIsAtCapacity
                                                    ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                                                    : "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                                                }`}
                                              >
                                                Change
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (dayIsPast) return;
                                                  handleUpdatePlace(day.id, place.id, { remove: true });
                                                }}
                                                disabled={dayIsPast}
                                                title={dayIsPast ? "This day has already passed, so you can't modify it anymore." : undefined}
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition h-7 ${
                                                  dayIsPast
                                                    ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                                                    : "border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                                                }`}
                                              >
                                                Remove
                                              </button>
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
                                    ))}
                                  </div>
                                  
                                  {/* Add activities button - moved below activities */}
                                  <div className="mt-4 flex justify-center md:justify-start">
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => {
                                        if (dayIsPast || dayIsAtCapacity) return;
                                        setSelectedDayForExplore({
                                          dayId: day.id,
                                          slot: slotType,
                                          areaCluster,
                                        });
                                        setDayExploreOpen(true);
                                      }}
                                      disabled={dayIsPast || dayIsAtCapacity}
                                      title={
                                        dayIsPast
                                          ? "This day has already passed, so you can't modify it anymore."
                                          : dayIsAtCapacity
                                          ? `This day is already quite full. We recommend no more than ${MAX_ACTIVITIES_PER_DAY} activities per day.`
                                          : undefined
                                      }
                                      className={`text-xs min-h-[44px] touch-manipulation ${
                                        dayIsPast || dayIsAtCapacity
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
                  // Gather all photos from slots for the gallery
                  const dayImages = (day.photos && day.photos.length > 0) 
                    ? day.photos 
                    : day.slots.flatMap(s => s.places.flatMap(p => p.photos || []));
                  
                  const bannerImages = dayImages.slice(0, 4);
                  const isExpanded = expandedDays.has(day.id);

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
                            const validImages = bannerImages.filter((img, idx) => {
                              const imageKey = `${day.id}-banner-${idx}`;
                              return !failedImages.has(imageKey) && img;
                            });

                            if (validImages.length === 0) {
                              return null; // Don't render empty gallery
                            }

                            return (
                              <div className="w-full flex gap-0.5 bg-gray-100 overflow-hidden rounded-t-xl">
                                {validImages.map((img, idx) => {
                                  const imageKey = `${day.id}-banner-${idx}`;
                                  return (
                                    <div 
                                      key={imageKey} 
                                      className="relative flex-1 min-w-0 aspect-[4/3] cursor-pointer hover:opacity-90 transition-opacity bg-gray-200 overflow-hidden"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openLightbox(img, dayImages);
                                      }}
                                    >
                                      <Image 
                                        src={img} 
                                        alt={day.title ? `${day.title} photo ${idx + 1}` : `Trip photo ${idx + 1}`} 
                                        fill 
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
                                    {slot.places.map((place) => (
                                      <div 
                                        key={place.id} 
                                        className={`flex flex-col sm:flex-row gap-4 p-4 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer ${place.visited ? 'bg-slate-50 opacity-75' : 'bg-white'}`}
                                        onClick={(e) => {
                                          onActivitySelect?.(place.id);
                                        }}
                                      >
                                        <div className="flex-shrink-0 relative w-full sm:w-24 h-48 sm:h-24 rounded-md overflow-hidden bg-gray-200">
                                          {place.photos && place.photos[0] && !failedImages.has(`${place.id}-photo`) ? (
                                            <Image 
                                              src={place.photos[0]} 
                                              alt={`Photo for ${place.name}`}
                                              fill 
                                              className="object-cover"
                                              key={`${place.id}-photo`}
                                              onError={() => {
                                                setFailedImages(prev => new Set(prev).add(`${place.id}-photo`));
                                              }}
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                              <MapPin className="h-8 w-8" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                            <h4 className="font-bold text-lg text-slate-900" style={{ fontFamily: "'Patrick Hand', cursive" }}>{place.name}</h4>
                                            <div className="flex gap-2 self-start">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleUpdatePlace(day.id, place.id, { visited: !place.visited });
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (dayIsPast || dayIsAtCapacity) return;
                                                  handleReplaceActivity(day.id, place.id);
                                                }}
                                                disabled={dayIsPast || dayIsAtCapacity}
                                                title={
                                                  dayIsPast
                                                    ? "This day has already passed, so you can't modify it anymore."
                                                    : dayIsAtCapacity
                                                    ? "This day is already at capacity."
                                                    : undefined
                                                }
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                  dayIsPast || dayIsAtCapacity
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                                                }`}
                                              >
                                                Change
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (dayIsPast) return;
                                                  handleUpdatePlace(day.id, place.id, { remove: true });
                                                }}
                                                disabled={dayIsPast}
                                                title={dayIsPast ? "This day has already passed, so you can't modify it anymore." : undefined}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                  dayIsPast
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                                }`}
                                              >
                                                <X className="h-3 w-3 inline mr-1" />
                                                Remove
                                              </button>
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
                                    ))}
                                  </div>
                                  
                                  {/* Add activities button - moved below activities */}
                                  <div className="mt-4 flex justify-center md:justify-start">
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => {
                                        if (dayIsPast || dayIsAtCapacity) return;
                                        setSelectedDayForExplore({
                                          dayId: day.id,
                                          slot: slotType,
                                          areaCluster,
                                        });
                                        setDayExploreOpen(true);
                                      }}
                                      disabled={dayIsPast || dayIsAtCapacity}
                                      title={
                                        dayIsPast
                                          ? "This day has already passed, so you can't modify it anymore."
                                          : dayIsAtCapacity
                                          ? `This day is already quite full. We recommend no more than ${MAX_ACTIVITIES_PER_DAY} activities per day.`
                                          : undefined
                                      }
                                      className={`text-xs min-h-[44px] touch-manipulation ${
                                        dayIsPast || dayIsAtCapacity
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

                   {/* Global Affiliates */}
                   <div className="max-w-4xl mx-auto mt-12 mb-8 text-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">You&apos;ll probably need...</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button variant="outline" className="bg-white">Get an eSIM</Button>
                            <Button variant="outline" className="bg-white">Travel Insurance</Button>
                            <Button variant="outline" className="bg-white">Airport Transfer</Button>
                        </div>
                   </div>

                  {/* Chat Input - At the end, not sticky */}
                  <section className="max-w-5xl mx-auto my-8">
                    <div className="p-6 border rounded-2xl bg-gray-50/50">
                        <h3 className="text-lg font-semibold mb-2 text-slate-900">Edit this itinerary</h3>
                        <p className="text-sm text-slate-500 mb-4">Ask me to add places, move things around, or change themes.</p>
                        <form onSubmit={handleChatSubmit} className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="e.g. 'Add a lunch spot on Day 1', 'Move Sagrada Familia to Day 2'"
                            className="w-full pl-4 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                            disabled={isChatting}
                            />
                        </div>
                        <Button 
                            type="submit" 
                            disabled={isChatting || !chatMessage.trim()} 
                            className="rounded-xl px-6 bg-primary hover:bg-primary/90 h-auto"
                        >
                            {isChatting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        </Button>
                        </form>
                        {chatError && (
                        <p className="text-sm text-red-600 mt-2">{chatError}</p>
                        )}
                    </div>
                  </section>

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
           {selectedImage && (
             <div className="relative w-full h-full flex items-center justify-center" style={{ height: '80vh' }}>
                <Image src={selectedImage} alt="Fullscreen" fill className="object-contain" />
                
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
           )}
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
