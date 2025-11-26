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
      <div className="px-6 pt-6 pb-0">
        <TabsList className="mb-4 bg-gray-100 rounded-xl p-1 border-2 border-black/10">
          <TabsTrigger 
            value="explore"
            className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg font-medium"
          >
            Explore
          </TabsTrigger>
          <TabsTrigger 
            value="itinerary"
            className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg font-medium"
          >
            Itinerary
          </TabsTrigger>
          <TabsTrigger 
            value="expenses"
            className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg font-medium"
          >
            Expenses
          </TabsTrigger>
        </TabsList>
      </div>
      <div className="flex-1 overflow-hidden">
        <TabsContent value="explore" className="h-full mt-0">
          <ExploreTab
            tripId={tripId}
            onMapUpdate={onExploreMapUpdate}
            onMarkerClickRef={onExploreMarkerClickRef}
          />
        </TabsContent>
        <TabsContent value="itinerary" forceMount className="h-full mt-0 data-[state=inactive]:hidden">
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

