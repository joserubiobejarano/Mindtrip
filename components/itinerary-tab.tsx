"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Users, MoreVertical, Trash2, Loader2, MapPin, Check, X, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { useTrip } from "@/hooks/use-trip";
import { format } from "date-fns";
import { ShareTripDialog } from "@/components/share-trip-dialog";
import { TripMembersDialog } from "@/components/trip-members-dialog";
import { DeleteTripDialog } from "@/components/delete-trip-dialog";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { SmartItinerary, ItineraryDay, ItineraryPlace, ItinerarySlot } from "@/types/itinerary";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type ItineraryStatus = 'idle' | 'loading' | 'generating' | 'loaded' | 'error';

interface ItineraryTabProps {
  tripId: string;
  userId: string;
  selectedDayId?: string | null;
  onSelectDay?: (dayId: string) => void;
  onActivitySelect?: (activityId: string) => void;
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
  
  // Chat state
  const [chatMessage, setChatMessage] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  
  const router = useRouter();
  const { addToast } = useToast();
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const { data: trip, isLoading: tripLoading } = useTrip(tripId);

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
        throw new Error(body?.error || `Generation failed with status ${res.status}`);
      }

      const json = await res.json();
      console.log('[itinerary-tab] generateSmartItinerary: received itinerary from POST', json);

      // POST now returns bare SmartItinerary directly
      setSmartItinerary(json);
      setStatus('loaded');
    } catch (err) {
      console.error('[itinerary-tab] generateSmartItinerary error', err);
      setError('Failed to generate itinerary. Please try again.');
      setStatus('error');
    }
  }, [tripId]);

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

  // 1. Load existing or start generation
  useEffect(() => {
    loadOrGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

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
      await fetch(`/api/trips/${tripId}/smart-itinerary/place`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayId,
          placeId,
          ...updates
        })
      });
    } catch (error) {
      console.error("Failed to sync place update", error);
      addToast({ variant: "destructive", title: "Failed to save change" });
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
        <div>
          <h1 className="text-xl font-bold">{trip.title}</h1>
          <p className="text-sm text-gray-500">
            {format(new Date(trip.start_date), "MMM d")} - {format(new Date(trip.end_date), "MMM d, yyyy")}
          </p>
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
        <div className="max-w-6xl mx-auto px-4 py-8">
          
          {/* Loading State */}
          {status === 'loading' && (
            <LoadingCard
              title="We're crafting your itinerary…"
              subtitle="Loading your saved plan…"
            />
          )}

          {/* Generating State */}
          {status === 'generating' && (
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

          {/* Loaded Itinerary */}
          {status === 'loaded' && smartItinerary && (
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
                  <div className="text-center space-y-4 mb-10 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-900">{smartItinerary.title}</h2>
                    <div className="prose prose-neutral max-w-none text-slate-900 mx-auto">
                       <p className="text-lg leading-relaxed">{smartItinerary.summary}</p>
                    </div>
                  </div>

                  {/* Days */}
                  <div className="space-y-12">
                    {smartItinerary.days.map((day) => {
                  // Gather all photos from slots for the gallery
                  const dayImages = (day.photos && day.photos.length > 0) 
                    ? day.photos 
                    : day.slots.flatMap(s => s.places.flatMap(p => p.photos || []));
                  
                  const bannerImages = dayImages.slice(0, 4);

                  return (
                    <Card 
                      key={day.id} 
                      id={`day-${day.id}`}
                      className={`overflow-hidden border shadow-sm transition-all ${selectedDayId === day.id ? 'ring-2 ring-purple-500' : ''}`}
                      onClick={() => onSelectDay?.(day.id)}
                    >
                      <CardHeader className="bg-gray-50 border-b pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl font-bold text-slate-900">
                              Day {day.index} – {day.title}
                            </CardTitle>
                            <CardDescription className="text-base font-medium text-slate-600 mt-1">
                              {day.theme} • {format(new Date(day.date), "EEEE, MMMM d")}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {/* Image Gallery */}
                      {bannerImages.length > 0 && (
                        <div className="w-full grid grid-cols-4 gap-0.5 bg-gray-100">
                          {bannerImages.map((img, idx) => (
                            <div 
                              key={idx} 
                              className="relative aspect-[4/3] cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => openLightbox(img, dayImages)}
                            >
                              <Image src={img} alt={`Day ${day.index} - ${idx + 1}`} fill className="object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      <CardContent className="p-6 space-y-6">
                        <div className="prose prose-neutral max-w-none text-slate-900">
                          <p>{day.overview}</p>
                        </div>
                        
                        {/* Slots */}
                        <div className="space-y-8 mt-6">
                            {day.slots.map((slot, slotIdx) => (
                                <div key={slotIdx} className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">{slot.label}</h3>
                                        <span className="text-sm text-slate-400">•</span>
                                        <span className="text-sm text-slate-600 italic">{slot.summary}</span>
                                    </div>
                                    
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
                                                 {place.photos && place.photos[0] ? (
                                                   <Image src={place.photos[0]} alt={place.name} fill className="object-cover" />
                                                 ) : (
                                                   <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                     <MapPin className="h-8 w-8" />
                                                   </div>
                                                 )}
                                               </div>
                                               <div className="flex-1 min-w-0">
                                                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                   <h4 className="font-bold text-lg text-slate-900">{place.name}</h4>
                                                   <div className="flex gap-2 self-start">
                                                     <button
                                                       onClick={(e) => {
                                                         e.stopPropagation();
                                                         handleUpdatePlace(day.id, place.id, { visited: !place.visited });
                                                       }}
                                                       className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition h-7 gap-1.5 ${
                                                         place.visited
                                                           ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                           : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                                       }`}
                                                     >
                                                       {place.visited && <Check className="h-3 w-3" />}
                                                       {place.visited ? "Visited" : "Mark as visited"}
                                                     </button>
                                                     <button
                                                       onClick={(e) => {
                                                         e.stopPropagation();
                                                         handleUpdatePlace(day.id, place.id, { remove: true });
                                                       }}
                                                       className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition h-7"
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
                                </div>
                            ))}
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
                    </Card>
                  );
                })}
              </div>

                  {/* Tips & Notes */}
                  {smartItinerary.tripTips?.length ? (
                    <section className="mt-10 rounded-2xl border bg-white/80 p-6 shadow-sm max-w-4xl mx-auto">
                      <h2 className="text-lg font-semibold mb-3 text-slate-900">Trip Tips &amp; Notes</h2>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                        {smartItinerary.tripTips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

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
                            className="w-full pl-4 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                            disabled={isChatting}
                            />
                        </div>
                        <Button 
                            type="submit" 
                            disabled={isChatting || !chatMessage.trim()} 
                            className="rounded-xl px-6 bg-purple-600 hover:bg-purple-700 h-auto"
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
    </div>
  );
}
