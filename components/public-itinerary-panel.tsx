"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTrip } from "@/hooks/use-trip";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { SmartItinerary } from "@/types/itinerary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface PublicItineraryPanelProps {
  tripId: string;
  selectedDayId: string | null;
  onSelectDay: (dayId: string) => void;
  onActivitySelect?: (activityId: string) => void;
}

export function PublicItineraryPanel({
  tripId,
  selectedDayId,
  onSelectDay,
  onActivitySelect,
}: PublicItineraryPanelProps) {
  const { data: trip, isLoading: tripLoading } = useTrip(tripId);
  const [smartItinerary, setSmartItinerary] = useState<SmartItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadItinerary = async () => {
      try {
        const res = await fetch(`/api/trips/${tripId}/smart-itinerary?mode=load`);
        if (res.ok) {
          const data = await res.json();
          setSmartItinerary(data);
        }
      } catch (error) {
        console.error('Failed to load itinerary:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (tripId) {
      loadItinerary();
    }
  }, [tripId]);

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
            <h1 className="text-2xl font-bold">{trip.title}</h1>
            <p className="text-sm text-muted-foreground">
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
          <div className="text-left space-y-4 mb-10 max-w-4xl mx-auto">
            {smartItinerary.title && (
              <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Patrick Hand', cursive" }}>{smartItinerary.title}</h2>
            )}
            {smartItinerary.summary && (
              <div className="prose prose-neutral max-w-none text-slate-900">
                <p className="text-lg leading-relaxed font-normal">{smartItinerary.summary}</p>
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
            const dayImages = (day.photos && day.photos.length > 0) 
              ? day.photos 
              : day.slots.flatMap(s => s.places.flatMap(p => p.photos || []));
            
            const bannerImages = dayImages.slice(0, 4);

            return (
              <Card 
                key={day.id} 
                id={`day-${day.id}`}
                className={`overflow-hidden border shadow-sm transition-all ${selectedDayId === day.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => onSelectDay?.(day.id)}
              >
                <CardHeader className="bg-gray-50 border-b pb-4">
                  <CardTitle className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                    Day {day.index} – {day.title}
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-slate-600 mt-1">
                    {day.theme} • {format(new Date(day.date), "EEEE, MMMM d")}
                  </CardDescription>
                </CardHeader>
                
                {bannerImages.length > 0 && (
                  <div className="w-full grid grid-cols-4 gap-0.5 bg-gray-100">
                    {bannerImages.map((img, idx) => (
                      <div 
                        key={idx} 
                        className="relative aspect-[4/3]"
                      >
                        <Image src={img} alt={`Day ${day.index} - ${idx + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <CardContent className="p-6 space-y-6">
                  {day.overview && (
                    <div className="prose prose-neutral max-w-none text-slate-900">
                      <ul className="list-disc pl-5 space-y-2 text-base leading-relaxed">
                        {day.overview
                          .split(/[.!?]+/)
                          .filter(s => s.trim().length > 10)
                          .map((point, idx, arr) => {
                            const trimmed = point.trim();
                            if (!trimmed) return null;
                            const needsPeriod = !trimmed.match(/[.!?]$/) && idx < arr.length - 1;
                            return (
                              <li key={idx} className="font-normal">
                                {trimmed}{needsPeriod ? '.' : ''}
                              </li>
                            );
                          })
                          .filter(Boolean)}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-8 mt-6">
                    {day.slots.map((slot, slotIdx) => (
                      <div key={slotIdx} className="space-y-4">
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 pb-2">
                            <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Patrick Hand', cursive" }}>{slot.label}</h3>
                            <span className="text-base text-slate-400">•</span>
                            <span className="text-base text-slate-900 italic">{slot.summary}</span>
                          </div>
                        </div>
                        
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
                                {place.photos && place.photos[0] ? (
                                  <Image src={place.photos[0]} alt={place.name} fill className="object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span className="text-xs">No image</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-lg text-slate-900" style={{ fontFamily: "'Patrick Hand', cursive" }}>{place.name}</h4>
                                <p className="text-slate-700 text-sm mt-2 leading-relaxed">
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

