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
  onActivePlaceChange?: (place: { placeId: string; lat: number; lng: number }) => void;
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
  onActivePlaceChange,
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

  const tabs = [
    { slug: "explore", label: "Explore" },
    { slug: "itinerary", label: "Itinerary" },
    { slug: "expenses", label: "Expenses" },
  ];

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
      <div className="flex items-center justify-end p-4">
        <div className="bg-white rounded-full p-1.5 shadow-lg flex gap-1">
          {tabs.map((tab) => {
            const isActive = tab.slug === activeTab;
            return (
              <button
                key={tab.slug}
                onClick={() => handleTabChange(tab.slug)}
                className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-coral text-white shadow-md"
                    : "text-foreground hover:bg-peach/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <TabsContent value="explore" className="h-full mt-0">
          <ExploreTab
            tripId={tripId}
            onMapUpdate={onExploreMapUpdate}
            onMarkerClickRef={onExploreMarkerClickRef}
            onActivePlaceChange={onActivePlaceChange}
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

