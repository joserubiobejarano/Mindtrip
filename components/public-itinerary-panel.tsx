"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTrip } from "@/hooks/use-trip";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { SmartItinerary } from "@/types/itinerary";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { resolvePlacePhotoSrc } from "@/lib/placePhotos";
import { DayAccordionHeader } from "@/components/day-accordion-header";

// Helper to check if image src is a places proxy that needs unoptimized rendering
const isPlacesProxy = (src?: string | null): boolean => {
  return typeof src === "string" && src.startsWith("/api/places/photo");
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

interface PublicItineraryPanelProps {
  tripId: string;
  selectedDayId: string | null;
  onSelectDay: (dayId: string) => void;
  onActivitySelect?: (activityId: string) => void;
  slug?: string; // Add slug prop for public access
}

export function PublicItineraryPanel({
  tripId,
  selectedDayId,
  onSelectDay,
  onActivitySelect,
  slug,
}: PublicItineraryPanelProps) {
  const { data: trip, isLoading: tripLoading } = useTrip(tripId);
  const [smartItinerary, setSmartItinerary] = useState<SmartItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadItinerary = async () => {
      try {
        // Use public endpoint if slug is provided, otherwise use authenticated endpoint
        const endpoint = slug 
          ? `/api/public/trips/${slug}/smart-itinerary`
          : `/api/trips/${tripId}/smart-itinerary?mode=load`;
        
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          setSmartItinerary(data);
        } else {
          // Handle non-OK responses gracefully
          console.error('[public-itinerary-panel] Failed to load itinerary:', res.status, res.statusText);
          // Don't crash, just show empty state
        }
      } catch (error) {
        console.error('[public-itinerary-panel] Failed to load itinerary:', error);
        // Don't crash, just show empty state
      } finally {
        setIsLoading(false);
      }
    };
    
    if (tripId) {
      loadItinerary();
    }
  }, [tripId, slug]);

  // Initialize expanded days with first day expanded
  useEffect(() => {
    if (smartItinerary?.days && smartItinerary.days.length > 0 && expandedDays.size === 0) {
      setExpandedDays(new Set([smartItinerary.days[0].id]));
    }
  }, [smartItinerary, expandedDays.size]);

  const handleExportPDF = () => {
    window.print();
  };

  if (tripLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">No trip data found</div>
      </div>
    );
  }

  if (!smartItinerary || !smartItinerary.days || smartItinerary.days.length === 0) {
    return (
      <div className="p-6 h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{trip.title}</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(trip.start_date), "MMM d")} -{" "}
            {format(new Date(trip.end_date), "MMM d, yyyy")}
          </p>
        </div>
        <div className="text-muted-foreground">Itinerary not available</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1267px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Patrick Hand', cursive" }}>{trip.title}</h1>
            <p className="text-sm text-gray-500">
              {format(new Date(trip.start_date), "MMM d")} -{" "}
              {format(new Date(trip.end_date), "MMM d, yyyy")}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleExportPDF}
            title="Export as PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

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

        {/* Days */}
        <div className="space-y-12">
          {smartItinerary.days.map((day) => {
            // Use resolvePlacePhotoSrc to prioritize image_url over photos array
            const dayImages = (day.photos && day.photos.length > 0) 
              ? day.photos.map(photo => resolvePlacePhotoSrc(photo)).filter((src): src is string => src !== null)
              : day.slots.flatMap(s => s.places.map(p => resolvePlacePhotoSrc(p))).filter((src): src is string => src !== null);
            
            const bannerImages = dayImages.slice(0, 4);
            const isExpanded = expandedDays.has(day.id);

            return (
              <Card 
                key={day.id} 
                id={`day-${day.id}`}
                className={`overflow-hidden border shadow-sm transition-all ${selectedDayId === day.id ? 'ring-2 ring-primary' : ''}`}
              >
                <DayAccordionHeader
                  day={day}
                  isExpanded={isExpanded}
                  onToggle={() => {
                    setExpandedDays(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(day.id)) {
                        newSet.delete(day.id);
                      } else {
                        newSet.add(day.id);
                      }
                      return newSet;
                    });
                  }}
                  onSelectDay={onSelectDay}
                />
                
                {isExpanded && (
                  <>
                    {(() => {
                      // Filter out invalid/empty images
                      const validImages = bannerImages.filter(Boolean);
                      
                      if (validImages.length === 0) {
                        return null; // Don't render empty gallery
                      }

                      const shouldUnoptimize = validImages.some(img => isPlacesProxy(img));
                      if (process.env.NODE_ENV === 'development' && validImages.length > 0) {
                        console.debug('[PublicItineraryPanel] Banner images:', { count: validImages.length, unoptimized: shouldUnoptimize, firstSrc: validImages[0] });
                      }
                      return (
                        <div className="w-full flex gap-0.5 bg-gray-100 overflow-hidden rounded-t-xl">
                          {validImages.map((img, idx) => {
                            const shouldUnoptimizeImg = isPlacesProxy(img);
                            return (
                              <div 
                                key={idx} 
                                className="relative flex-1 min-w-0 aspect-[4/3] overflow-hidden"
                              >
                                <Image 
                                  src={img} 
                                  alt={day.title ? `${day.title} photo ${idx + 1}` : `Trip photo ${idx + 1}`} 
                                  fill 
                                  sizes="(max-width: 768px) 25vw, 25vw"
                                  unoptimized={shouldUnoptimizeImg}
                                  className="object-cover"
                                />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    <CardContent className="p-6 space-y-6">
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

                      <div className="space-y-8 mt-6">
                        {day.slots.map((slot, slotIdx) => (
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
                                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-white"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onActivitySelect?.(place.id);
                                    }}
                                  >
                                    <div className="flex-shrink-0 relative w-full sm:w-24 h-48 sm:h-24 rounded-md overflow-hidden bg-gray-200">
                                      {(() => {
                                        const resolvedSrc = resolvePlacePhotoSrc(place);
                                        if (resolvedSrc) {
                                          const shouldUnoptimize = isPlacesProxy(resolvedSrc);
                                          // Dev log: show one sample place's resolved image src and source
                                          if (process.env.NODE_ENV !== 'production' && slotIdx === 0 && place === slot.places[0]) {
                                            const cameFromImageUrl = place.image_url && resolvedSrc === place.image_url;
                                            console.log('[PublicItineraryPanel] Sample place image resolution:', {
                                              placeName: place.name,
                                              resolvedSrc,
                                              cameFromImageUrl,
                                              hasImageUrl: !!place.image_url,
                                              hasPhotos: !!(place.photos && place.photos.length > 0),
                                              unoptimized: shouldUnoptimize
                                            });
                                          }
                                          return (
                                            <Image 
                                              src={resolvedSrc} 
                                              alt={place.name} 
                                              fill 
                                              sizes="(max-width: 640px) 100vw, 96px"
                                              unoptimized={shouldUnoptimize}
                                              className="object-cover" 
                                            />
                                          );
                                        } else {
                                          return (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                              <span className="text-xs">No image</span>
                                            </div>
                                          );
                                        }
                                      })()}
                                    </div>
                                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                                      <h4 className="font-bold text-lg text-slate-900 break-words" style={{ fontFamily: "'Patrick Hand', cursive" }}>{place.name}</h4>
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
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-16 mb-12 p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Patrick Hand', cursive" }}>
            Planned with Kruno
          </h3>
          <p className="text-base text-slate-700 mb-6">
            Create your own personalized travel itinerary in minutes. Try the app now!
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-base font-semibold"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/sign-up';
              }
            }}
          >
            Try Kruno Now
          </Button>
        </div>
      </div>
    </div>
  );
}

