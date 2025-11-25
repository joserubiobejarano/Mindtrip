"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItineraryTab } from "@/components/itinerary-tab";
import { ExpensesTab } from "@/components/expenses-tab";
import { ExploreTab } from "@/components/explore-tab";
import { useTrip } from "@/hooks/use-trip";

interface TripTabsProps {
  tripId: string;
  userId: string;
  selectedDayId: string | null;
  onSelectDay: (dayId: string) => void;
  onActivitySelect?: (activityId: string) => void;
  onTabChange?: (tab: string) => void;
  onExploreMapUpdate?: (
    markers: import("@/components/google-map-base").BaseMarker[],
    center: { lat: number; lng: number } | null,
    zoom: number | undefined
  ) => void;
  onExploreMarkerClickRef?: React.MutableRefObject<((id: string) => void) | null>;
}

export function TripTabs({
  tripId,
  userId,
  selectedDayId,
  onSelectDay,
  onActivitySelect,
  onTabChange,
  onExploreMapUpdate,
  onExploreMarkerClickRef,
  initialTab,
}: TripTabsProps & { initialTab?: string }) {
  const { data: trip } = useTrip(tripId);
  const [activeTab, setActiveTab] = useState(initialTab || "itinerary");

  // Update activeTab when initialTab changes (e.g., from URL query param)
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onTabChange?.(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
      <TabsList className="mb-4">
        <TabsTrigger value="explore">Explore</TabsTrigger>
        <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
      </TabsList>
      <div className="flex-1 overflow-hidden">
        <TabsContent value="explore" className="h-full mt-0">
          <ExploreTab
            tripId={tripId}
            onMapUpdate={onExploreMapUpdate}
            onMarkerClickRef={onExploreMarkerClickRef}
          />
        </TabsContent>
        <TabsContent value="itinerary" className="h-full mt-0">
          <ItineraryTab
            tripId={tripId}
            userId={userId}
            selectedDayId={selectedDayId}
            onSelectDay={onSelectDay}
            onActivitySelect={onActivitySelect}
          />
        </TabsContent>
        <TabsContent value="expenses" className="h-full mt-0 overflow-y-auto">
          <ExpensesTab
            tripId={tripId}
            defaultCurrency={trip?.default_currency || "USD"}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}

