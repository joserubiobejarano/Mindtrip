"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { TripShell } from "@/components/trip-shell";
import { TripTabs } from "@/components/trip-tabs";
import { useDays } from "@/hooks/use-days";
import { useRealtimeActivities } from "@/hooks/use-realtime-activities";
import { createClient } from "@/lib/supabase/client";
import { useTrip } from "@/hooks/use-trip";
import { BaseMarker } from "@/components/google-map-base";
import { GoogleMapsProvider } from "@/components/google-maps-provider";

export function TripDetail({ tripId }: { tripId: string }) {
  const { user } = useUser();
  const userId = user?.id;
  const searchParams = useSearchParams();
  const { data: days } = useDays(tripId);
  const { data: trip } = useTrip(tripId);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const initialTab = searchParams.get("tab") || "itinerary";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [exploreMarkers, setExploreMarkers] = useState<BaseMarker[]>([]);
  const [exploreCenter, setExploreCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [exploreZoom, setExploreZoom] = useState<number | undefined>(undefined);
  const exploreMarkerClickHandlerRef = useRef<((id: string) => void) | null>(null);
  const supabase = createClient();
  const [ownerMemberChecked, setOwnerMemberChecked] = useState(false);

  // Enable realtime sync for activities
  useRealtimeActivities(tripId);

  // Ensure owner is always a trip member
  useEffect(() => {
    if (!tripId || !userId || !trip || ownerMemberChecked) return;

    const ensureOwnerMember = async () => {
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("trip_members")
        .select("id")
        .eq("trip_id", tripId)
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingMember) {
        // Get user's name from Clerk
        const displayName = user?.fullName || user?.firstName || null;
        
        // Insert owner as member
        await supabase
          .from("trip_members")
          .insert({
            trip_id: tripId,
            user_id: userId,
            email: user?.primaryEmailAddress?.emailAddress || null,
            display_name: displayName,
            role: "owner",
          });
      }
      
      setOwnerMemberChecked(true);
    };

    ensureOwnerMember();
  }, [tripId, userId, trip, user, ownerMemberChecked, supabase]);

  // Auto-select first day when days load
  useEffect(() => {
    if (days && days.length > 0 && !selectedDayId) {
      setSelectedDayId(days[0].id);
    }
  }, [days, selectedDayId]);

  if (!userId) {
    return <div>Please sign in to view this trip.</div>;
  }

  const handleExploreMarkerClick = (id: string) => {
    if (exploreMarkerClickHandlerRef.current) {
      exploreMarkerClickHandlerRef.current(id);
    }
  };

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
      >
        <TripTabs
          tripId={tripId}
          userId={userId}
          selectedDayId={selectedDayId}
          onSelectDay={setSelectedDayId}
          onActivitySelect={setSelectedActivityId}
          onTabChange={setActiveTab}
          initialTab={initialTab}
          onExploreMapUpdate={(markers, center, zoom) => {
            setExploreMarkers(markers);
            setExploreCenter(center);
            setExploreZoom(zoom);
          }}
          onExploreMarkerClickRef={exploreMarkerClickHandlerRef}
        />
      </TripShell>
    </GoogleMapsProvider>
  );
}

