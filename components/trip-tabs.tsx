"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItineraryTab } from "@/components/itinerary-tab";
import { ExpensesTab } from "@/components/expenses-tab";
import { ExploreTab } from "@/components/explore-tab";
import { ErrorBoundary } from "@/components/error-boundary";
import { useTrip } from "@/hooks/use-trip";

interface TripTabsProps {
  tripId: string;
  userId: string;
  selectedDayId: string | null;
  onSelectDay: (dayId: string) => void;
  onActivitySelect?: (activityId: string) => void;
  onTabChange?: (tab: string) => void;
  onActivePlaceChange?: (place: { placeId: string; lat: number; lng: number }) => void;
}

export function TripTabs({
  tripId,
  userId,
  selectedDayId,
  onSelectDay,
  onActivitySelect,
  onTabChange,
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
      {/* Tabs - Hidden on mobile when on explore tab for full-screen experience */}
      <div className={`flex items-center justify-end p-4 ${activeTab === 'explore' ? 'hidden lg:flex' : ''}`}>
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
          <ErrorBoundary
            fallbackTitle="Explore tab error"
            fallbackMessage="Something went wrong with the Explore tab. Try reloading the page."
          >
            <ExploreTab
              tripId={tripId}
              onActivePlaceChange={onActivePlaceChange}
            />
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="itinerary" className="h-full mt-0">
          <ErrorBoundary
            fallbackTitle="Itinerary tab error"
            fallbackMessage="Something went wrong with the Itinerary tab. Try reloading the page."
          >
            <ItineraryTab
              tripId={tripId}
              userId={userId}
              selectedDayId={selectedDayId}
              onSelectDay={onSelectDay}
              onActivitySelect={onActivitySelect}
              isActive={activeTab === 'itinerary'}
            />
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="expenses" className="h-full mt-0 overflow-y-auto">
          <ErrorBoundary
            fallbackTitle="Expenses tab error"
            fallbackMessage="Something went wrong with the Expenses tab. Try reloading the page."
          >
            <ExpensesTab
              tripId={tripId}
              defaultCurrency={trip?.default_currency || "USD"}
            />
          </ErrorBoundary>
        </TabsContent>
      </div>
    </Tabs>
  );
}

