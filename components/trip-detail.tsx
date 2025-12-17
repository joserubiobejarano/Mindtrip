"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { TripShell } from "@/components/trip-shell";
import { TripTabs } from "@/components/trip-tabs";
import { useDays } from "@/hooks/use-days";
import { useRealtimeActivities } from "@/hooks/use-realtime-activities";
import { createClient } from "@/lib/supabase/client";
import { useTrip } from "@/hooks/use-trip";
import { ensureOwnerMember } from "@/lib/supabase/trip-members";
import { BaseMarker } from "@/components/google-map-base";
import { GoogleMapsProvider } from "@/components/google-maps-provider";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TripDetail({ tripId }: { tripId: string }) {
  const { user } = useUser();
  const userId = user?.id;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: days, isLoading: daysLoading, error: daysError } = useDays(tripId);
  const { data: trip, isLoading: tripLoading, error: tripError } = useTrip(tripId);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const initialTab = searchParams.get("tab") || "itinerary";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [exploreMarkers, setExploreMarkers] = useState<BaseMarker[]>([]);
  const [exploreCenter, setExploreCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [exploreZoom, setExploreZoom] = useState<number | undefined>(undefined);
  const [activePlace, setActivePlace] = useState<{ placeId: string; lat: number; lng: number } | null>(null);
  const exploreMarkerClickHandlerRef = useRef<((id: string) => void) | null>(null);
  const [ownerMemberChecked, setOwnerMemberChecked] = useState(false);

  // Enable realtime sync for activities
  useRealtimeActivities(tripId);

  // Ensure owner is always a trip member
  useEffect(() => {
    if (!tripId || !userId || !trip || ownerMemberChecked || !user) return;

    const ensureMember = async () => {
      try {
        await ensureOwnerMember(tripId, user);
        setOwnerMemberChecked(true);
      } catch (error) {
        console.error('[trip-detail] Error ensuring owner member:', error);
        // Don't block UI on error, just log it
        setOwnerMemberChecked(true);
      }
    };

    ensureMember();
  }, [tripId, userId, trip, user, ownerMemberChecked]);

  // Auto-select first day when days load
  useEffect(() => {
    if (days && days.length > 0 && !selectedDayId) {
      setSelectedDayId(days[0].id);
    }
  }, [days, selectedDayId]);

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to view this trip.</p>
        </div>
      </div>
    );
  }

  // Handle loading states
  const isLoading = tripLoading || daysLoading;
  const hasError = tripError || daysError;

  // Show loading UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading trip...</p>
        </div>
      </div>
    );
  }

  // Handle errors
  if (hasError) {
    const errorMessage = tripError?.message || daysError?.message || "Failed to load trip data";
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
            <p className="text-muted-foreground">{errorMessage}</p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/trips")}
            >
              Back to Trips
            </Button>
            <Button
              onClick={() => {
                window.location.reload();
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Ensure we have data before rendering
  if (!trip || !days) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading trip data...</p>
        </div>
      </div>
    );
  }

  const handleExploreMarkerClick = useCallback((id: string) => {
    if (exploreMarkerClickHandlerRef.current) {
      exploreMarkerClickHandlerRef.current(id);
    }
  }, []);

  // Memoize onExploreMapUpdate callback to prevent infinite loops
  const handleExploreMapUpdate = useCallback((markers: BaseMarker[], center: { lat: number; lng: number } | null, zoom: number | undefined) => {
    setExploreMarkers(markers);
    setExploreCenter(center);
    setExploreZoom(zoom);
  }, []); // Empty deps - setters are stable

  return (
    <GoogleMapsProvider>
      <TripShell
        tripId={tripId}
        activeTab={activeTab}
        selectedDayId={selectedDayId}
        selectedActivityId={selectedActivityId}
        exploreMarkers={exploreMarkers}
        exploreCenter={exploreCenter}
        exploreZoom={exploreZoom}
        onExploreMarkerClick={handleExploreMarkerClick}
        activePlace={activePlace}
      >
        <TripTabs
          tripId={tripId}
          userId={userId}
          selectedDayId={selectedDayId}
          onSelectDay={setSelectedDayId}
          onActivitySelect={setSelectedActivityId}
          onTabChange={setActiveTab}
          initialTab={initialTab}
          onExploreMapUpdate={handleExploreMapUpdate}
          onExploreMarkerClickRef={exploreMarkerClickHandlerRef}
          onActivePlaceChange={setActivePlace}
        />
      </TripShell>
    </GoogleMapsProvider>
  );
}

