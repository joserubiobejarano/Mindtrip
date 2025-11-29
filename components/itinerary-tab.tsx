"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Users, MoreVertical, Trash2, Loader2, MapPin, Check, X, Maximize2, ChevronLeft, ChevronRight, MessageSquare, Send } from "lucide-react";
import { useTrip } from "@/hooks/use-trip";
import { format } from "date-fns";
import { ShareTripDialog } from "@/components/share-trip-dialog";
import { TripMembersDialog } from "@/components/trip-members-dialog";
import { DeleteTripDialog } from "@/components/delete-trip-dialog";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { SmartItinerary, ItineraryDay, ItineraryPlace } from "@/types/itinerary";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";

interface ItineraryTabProps {
  tripId: string;
  userId: string;
  selectedDayId?: string | null;
  onSelectDay?: (dayId: string) => void;
  onActivitySelect?: (activityId: string) => void;
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
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamText, setStreamText] = useState<string[]>([]);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
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

  // Load existing itinerary from API (pure JSON, no markers)
  async function loadSmartItineraryFromApi() {
    if (!tripId) return;
    
    const res = await fetch(`/api/trips/${tripId}/smart-itinerary?mode=load`, {
      method: "GET",
    });
    
    console.log("[smart-itinerary] HTTP status (load)", res.status);
    
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[smart-itinerary] load error", res.status, text);
      setErrorCode(`LOAD_HTTP_${res.status}`);
      setSmartItinerary(null);
      return;
    }
    
    const json = (await res.json()) as SmartItinerary;
    console.log("[smart-itinerary] loaded itinerary", json);
    setSmartItinerary(json);
    setErrorCode(null);
  }

  // Start streaming generation (POST) - only reads text chunks, watches for __ITINERARY_READY__
  async function startSmartItineraryGeneration() {
    if (!tripId) return;
    
    setIsGenerating(true);
    setIsStreaming(true);
    setStreamText([]);
    setErrorCode(null);
    
    const res = await fetch(`/api/trips/${tripId}/smart-itinerary`, {
      method: "POST",
    });
    
    console.log("[smart-itinerary] HTTP status (stream)", res.status);
    
    if (!res.body) {
      console.error("[smart-itinerary] stream: no body");
      setIsGenerating(false);
      setIsStreaming(false);
      setErrorCode("STREAM_NO_BODY");
      return;
    }
    
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      
      // Show progress lines in the UI (only PROGRESS: lines)
      const newLines = chunk
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && l.startsWith("PROGRESS:"));
      
      if (newLines.length) {
        // Extract just the message part after "PROGRESS:"
        const progressMessages = newLines.map((l) => l.replace("PROGRESS:", "").trim());
        setStreamText((prev) => [...prev, ...progressMessages]);
      }
      
      // Check for error lines
      for (const line of newLines) {
        if (line.startsWith("Error:")) {
          const code = line.replace("Error:", "").trim();
          setErrorCode(code || "UNKNOWN");
          setLoadingError("We couldn't generate your itinerary. Please try again.");
          setIsGenerating(false);
          setIsStreaming(false);
          reader.cancel();
          return;
        }
      }
      
      // Check for ready marker
      if (fullText.includes("__ITINERARY_READY__")) {
        console.log("[smart-itinerary] ready marker received");
        break;
      }
    }
    
    // Stream finished → now load the saved itinerary JSON via a separate GET
    await loadSmartItineraryFromApi();
    setIsGenerating(false);
    setIsStreaming(false);
  }

  // Load existing or start generation
  useEffect(() => {
    let active = true;

    async function loadOrGenerate() {
      try {
        setLoadingError(null);
        setErrorCode(null);
        setStreamText([]);
        
        // First, try to load existing itinerary
        const res = await fetch(`/api/trips/${tripId}/smart-itinerary?mode=load`, {
          method: "GET",
        });
        
        if (res.ok) {
          // Itinerary exists, load it
          const json = (await res.json()) as SmartItinerary;
          if (active) {
            setSmartItinerary(json);
            setErrorCode(null);
          }
        } else if (res.status === 404) {
          // No itinerary found, auto-start generation
          if (active) {
            await startSmartItineraryGeneration();
          }
        } else {
          // Other error
          const text = await res.text().catch(() => "");
          console.error("[smart-itinerary] load error", res.status, text);
          if (active) {
            setErrorCode(`LOAD_HTTP_${res.status}`);
            setLoadingError(`Request failed with status ${res.status}`);
          }
        }
      } catch (err) {
        console.error("Load error", err);
        if (active) {
          setLoadingError("Something went wrong loading your itinerary.");
          setIsStreaming(false);
        }
      }
    }

    if (tripId && !smartItinerary && !isGenerating) {
      loadOrGenerate();
    }

    return () => { active = false; };
  }, [tripId]);

  const handleUpdatePlace = async (dayId: string, placeId: string, updates: { visited?: boolean, remove?: boolean }) => {
    if (!smartItinerary) return;

    // Optimistic Update
    const newItinerary = { ...smartItinerary };
    const day = newItinerary.days.find(d => d.id === dayId);
    if (!day) return;

    if (updates.remove) {
      day.places = day.places.filter(p => p.id !== placeId);
    } else if (updates.visited !== undefined) {
      const place = day.places.find(p => p.id === placeId);
      if (place) place.visited = updates.visited;
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
      // Revert? (Complex, skipping for now)
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
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Chat failed');
      }

      const data = await res.json();
      if (data.itinerary) {
        setSmartItinerary(data.itinerary);
        setChatMessage(""); // Only clear on success
        addToast({ title: "Itinerary updated!" });
      }
    } catch (error: any) {
      console.error(error);
      setChatError(error.message || "Failed to update itinerary");
      addToast({ variant: "destructive", title: "Failed to update itinerary" });
    } finally {
      setIsChatting(false);
    }
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

  if (tripLoading) return <div className="p-6">Loading...</div>;
  if (!trip) return <div className="p-6">Trip not found</div>;

  return (
    <div className="flex flex-col h-full bg-white">
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
        <div className="max-w-5xl mx-auto px-4 py-8">
          
          {/* Streaming State */}
          {isStreaming && (
            <div className="w-full rounded-2xl border bg-orange-50/60 border-orange-200/70 px-8 py-10 text-center shadow-sm mb-8">
               <div className="flex flex-col items-center justify-center">
                 <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-4" />
                 <h3 className="text-slate-900 font-semibold text-lg mb-4">We&apos;re crafting your itinerary...</h3>
                 <div className="text-slate-700 text-sm mt-2 space-y-1">
                   {streamText.slice(-3).map((line, i) => (
                     <p key={i} className="animate-pulse">{line}</p>
                   ))}
                 </div>
               </div>
            </div>
          )}

          {/* Loaded Itinerary */}
          {smartItinerary && !isStreaming && (
            <div className="space-y-8 pb-10">
              {/* Trip Summary */}
              <div className="text-center space-y-4 mb-10">
                <h2 className="text-3xl font-bold text-slate-900">{smartItinerary.title}</h2>
                <div className="prose prose-neutral max-w-none text-slate-900 mx-auto">
                   <p className="text-lg leading-relaxed">{smartItinerary.summary}</p>
                </div>
                {/* Trip-level Affiliate Suggestions */}
                {smartItinerary.affiliateSuggestions?.length ? (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {smartItinerary.affiliateSuggestions.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        className="inline-flex items-center rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-800 hover:bg-purple-100 transition-colors"
                      >
                        {a.cta}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Days */}
              <div className="space-y-12">
                {smartItinerary.days.map((day) => {
                  // Fallback: use day.photos if available, else gather from places.
                  const dayImages = (day.photos && day.photos.length > 0) 
                    ? day.photos 
                    : day.places.flatMap(p => p.photos || []);
                  
                  // Limit to 4 images for the banner
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
                      
                      {/* Image Gallery - Desktop: Row of up to 4 images. Mobile: Horizontal scroll. */}
                      {bannerImages.length > 0 && (
                        <div className="w-full aspect-[16/9] sm:aspect-[3/1] md:aspect-[4/1] flex overflow-x-auto sm:overflow-hidden bg-gray-100 scrollbar-hide">
                          {bannerImages.map((img, idx) => (
                            <div 
                              key={idx} 
                              className="relative h-full min-w-[80%] sm:min-w-0 sm:flex-1 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => openLightbox(img, dayImages)}
                            >
                              <Image src={img} alt={`Day ${day.index} - ${idx + 1}`} fill className="object-cover border-r border-white/20 last:border-r-0" />
                            </div>
                          ))}
                        </div>
                      )}

                      <CardContent className="p-6 space-y-6">
                        <div className="prose prose-neutral max-w-none text-slate-900">
                          <p>{day.summary}</p>
                        </div>

                        {/* Day-level Affiliate Suggestions */}
                        {day.affiliateSuggestions?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {day.affiliateSuggestions.map((a) => (
                              <button
                                key={a.id}
                                type="button"
                                className="inline-flex items-center rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-800 hover:bg-orange-100 transition-colors"
                              >
                                {a.cta}
                              </button>
                            ))}
                          </div>
                        ) : null}

                        <div className="space-y-4 mt-6">
                          {day.places.map((place) => (
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
                                       className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                                         place.visited 
                                           ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                           : 'bg-blue-500 text-white hover:bg-blue-600'
                                       }`}
                                       title={place.visited ? "Mark as not visited" : "Mark as visited"}
                                     >
                                       <Check className="h-3 w-3" />
                                       {place.visited ? "Visited" : "Visit"}
                                     </button>
                                     <button
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         handleUpdatePlace(day.id, place.id, { remove: true });
                                       }}
                                       className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-red-500 text-white hover:bg-red-600 transition-colors"
                                       title="Remove place"
                                     >
                                       <X className="h-3 w-3" />
                                       Remove
                                     </button>
                                   </div>
                                 </div>
                                 <p className="text-slate-700 text-sm mt-2 leading-relaxed line-clamp-2">
                                   {place.summary}
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
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Tips & Notes */}
              {smartItinerary.tips?.length ? (
                <section className="mt-10 rounded-2xl border bg-white/80 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold mb-3 text-slate-900">Additional Tips &amp; Notes</h2>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                    {smartItinerary.tips.map((tip) => (
                      <li key={tip.id}>{tip.text}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {/* Chat Input - Moved to flow */}
              <div className="mt-12 p-6 border rounded-2xl bg-gray-50/50">
                <h3 className="text-lg font-semibold mb-2 text-slate-900">Edit Itinerary</h3>
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
                    {/* <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" /> */}
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
            </div>
          )}
          
          {loadingError && !smartItinerary && (
            <div className="w-full rounded-2xl border bg-red-50 border-red-200 px-8 py-10 text-center shadow-sm mb-8">
              <h3 className="text-red-900 font-semibold text-lg mb-2">We couldn&apos;t generate your itinerary</h3>
              <p className="text-red-700 mb-6">{loadingError}</p>
              {errorCode && (process.env.NODE_ENV !== 'production') && (
                  <p className="text-xs text-red-400 mb-4">Debug: {errorCode}</p>
              )}
              <Button onClick={() => window.location.reload()} variant="outline" className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">
                Retry
              </Button>
            </div>
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
