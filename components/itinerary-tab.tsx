"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Users, MoreVertical, Trash2, Loader2, MapPin, Check, X, Maximize2, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
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
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  
  // Chat state
  const [chatMessage, setChatMessage] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  
  const router = useRouter();
  const { addToast } = useToast();
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const { data: trip, isLoading: tripLoading } = useTrip(tripId);

  // Load existing or start stream
  useEffect(() => {
    let active = true;

    async function loadOrStream() {
      try {
        setLoadingError(null);
        setErrorCode(null);
        // First, try to fetch existing
        const res = await fetch(`/api/trips/${tripId}/smart-itinerary`);
        
        if (!res.ok) {
           // If error, show error
           const err = await res.json();
           if (active) setLoadingError(err.error || 'Failed to load');
           return;
        }

        const contentType = res.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
           // We have JSON -> Existing itinerary
           const data = await res.json();
           if (data.itinerary) {
             if (active) setSmartItinerary(data.itinerary);
           }
        } else {
           // Text stream -> Generating
           if (active) setIsStreaming(true);
           const reader = res.body?.getReader();
           if (!reader) return;

           const decoder = new TextDecoder();
           let buffer = '';
           
           while (true) {
             const { done, value } = await reader.read();
             if (done) break;
             
             const chunk = decoder.decode(value, { stream: true });
             buffer += chunk;
             
             // Check for specific error message
             if (buffer.includes('Error:')) {
                const errorLine = buffer.split('\n').find(l => l.startsWith('Error:'));
                if (errorLine) {
                    const code = errorLine.replace('Error: ', '').trim();
                    if (active) {
                        setErrorCode(code);
                        setLoadingError('We couldn’t generate your itinerary. Please try again in a moment.');
                        setIsStreaming(false);
                    }
                }
                break;
             }

             // Check for marker
             if (buffer.includes('__ITINERARY_READY__')) {
               // Reload full JSON
               setLoadingError(null);
               const finalRes = await fetch(`/api/trips/${tripId}/smart-itinerary`);
               if (finalRes.ok) {
                 const finalData = await finalRes.json();
                 if (active && finalData.itinerary) {
                   setSmartItinerary(finalData.itinerary);
                   setIsStreaming(false);
                 }
               }
               break;
             } else {
               // Split by lines and update stream text
               const lines = buffer.split('\n').filter(l => l.trim() !== '');
               // Filter out JSON_START/JSON_END lines if visible
               const cleanLines = lines.filter(l => !l.includes('JSON_START') && !l.includes('JSON_END'));
               if (active) setStreamText(cleanLines);
             }
           }
        }
      } catch (err) {
        console.error("Load error", err);
        if (active) setLoadingError("Something went wrong loading your itinerary.");
      }
    }

    if (tripId && !smartItinerary) {
      loadOrStream();
    }

    return () => { active = false; };
  }, [tripId, smartItinerary]);

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
    const msg = chatMessage;
    setChatMessage("");

    try {
      const res = await fetch(`/api/trips/${tripId}/itinerary-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });

      if (!res.ok) throw new Error('Chat failed');

      const data = await res.json();
      if (data.itinerary) {
        setSmartItinerary(data.itinerary);
        addToast({ title: "Itinerary updated!" });
      }
    } catch (error) {
      console.error(error);
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          
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
            <div className="space-y-8">
              {/* Trip Summary */}
              <div className="text-center space-y-4 mb-10">
                <h2 className="text-3xl font-bold text-slate-900">{smartItinerary.title}</h2>
                <div className="prose prose-neutral max-w-none text-slate-900 mx-auto">
                   <p className="text-lg leading-relaxed">{smartItinerary.summary}</p>
                </div>
              </div>

              {/* Days */}
              <div className="space-y-12">
                {smartItinerary.days.map((day) => {
                  const dayImages = day.places.flatMap(p => p.photos || []);
                  
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
                      {dayImages.length > 0 && (
                        <div className="w-full h-48 flex overflow-x-auto scrollbar-hide bg-gray-100">
                          {dayImages.map((img, idx) => (
                            <div 
                              key={idx} 
                              className="relative h-full min-w-[200px] flex-1 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => openLightbox(img, dayImages)}
                            >
                              <Image src={img} alt={`Day ${day.index}`} fill className="object-cover border-r border-white/20" />
                            </div>
                          ))}
                        </div>
                      )}

                      <CardContent className="p-6 space-y-6">
                        <div className="prose prose-neutral max-w-none text-slate-900">
                          <p>{day.summary}</p>
                        </div>

                        <div className="space-y-4 mt-6">
                          {day.places.map((place) => (
                            <div 
                              key={place.id} 
                              className={`flex gap-4 p-4 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer ${place.visited ? 'bg-slate-50 opacity-75' : 'bg-white'}`}
                              onClick={(e) => {
                                onActivitySelect?.(place.id);
                              }}
                            >
                               <div className="flex-shrink-0 relative w-24 h-24 rounded-md overflow-hidden bg-gray-200">
                                 {place.photos && place.photos[0] ? (
                                   <Image src={place.photos[0]} alt={place.name} fill className="object-cover" />
                                 ) : (
                                   <div className="w-full h-full flex items-center justify-center text-gray-400">
                                     <MapPin className="h-8 w-8" />
                                   </div>
                                 )}
                               </div>
                               <div className="flex-1 min-w-0">
                                 <div className="flex justify-between items-start">
                                   <h4 className="font-bold text-lg text-slate-900 truncate pr-4">{place.name}</h4>
                                   <div className="flex gap-2">
                                     <button
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         handleUpdatePlace(day.id, place.id, { visited: !place.visited });
                                       }}
                                       className={`p-1.5 rounded-full border transition-colors ${place.visited ? 'bg-green-100 text-green-700 border-green-200' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                                       title="Mark visited"
                                     >
                                       <Check className="h-4 w-4" />
                                     </button>
                                     <button
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         handleUpdatePlace(day.id, place.id, { remove: true });
                                       }}
                                       className="p-1.5 rounded-full border text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                       title="Remove"
                                     >
                                       <X className="h-4 w-4" />
                                     </button>
                                   </div>
                                 </div>
                                 <p className="text-slate-700 text-sm mt-1 leading-relaxed line-clamp-2">
                                   {place.summary}
                                 </p>
                               </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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

      {/* Chat Bar */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleChatSubmit} className="max-w-4xl mx-auto flex gap-2">
          <div className="relative flex-1">
             <input
               type="text"
               value={chatMessage}
               onChange={(e) => setChatMessage(e.target.value)}
               placeholder="Edit this itinerary (e.g., 'Add a lunch spot on Day 1', 'Change Day 2 theme to Art')"
               className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
               disabled={isChatting || !smartItinerary}
             />
             <MessageSquare className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <Button type="submit" disabled={isChatting || !smartItinerary || !chatMessage.trim()} className="rounded-full bg-purple-600 hover:bg-purple-700">
            {isChatting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
          </Button>
        </form>
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
