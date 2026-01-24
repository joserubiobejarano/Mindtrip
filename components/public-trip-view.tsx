"use client";

import { PublicItineraryPanel } from "@/components/public-itinerary-panel";
import { useState, useEffect } from "react";

interface PublicTripViewProps {
  tripId: string;
  slug: string;
}

interface Trip {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  default_currency: string;
  destination_name: string | null;
  destination_city: string | null;
  destination_country: string | null;
}

interface Day {
  id: string;
  trip_id: string;
  date: string;
  day_number: number;
}

export function PublicTripView({ tripId, slug }: PublicTripViewProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [days, setDays] = useState<Day[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  // Fetch trip data from public API
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await fetch(`/api/public/trips/${slug}`);
        if (!res.ok) {
          throw new Error('Failed to load trip');
        }
        const data = await res.json();
        setTrip(data);
      } catch (err) {
        console.error('[PublicTripView] Error fetching trip:', err);
        setError('Failed to load trip');
      }
    };

    fetchTrip();
  }, [slug]);

  // Fetch days data from public API
  useEffect(() => {
    const fetchDays = async () => {
      try {
        const res = await fetch(`/api/public/trips/${slug}/days`);
        if (!res.ok) {
          throw new Error('Failed to load days');
        }
        const data = await res.json();
        setDays(data);
      } catch (err) {
        console.error('[PublicTripView] Error fetching days:', err);
        setError('Failed to load days');
      } finally {
        setLoading(false);
      }
    };

    fetchDays();
  }, [slug]);

  // Auto-select first day when days load
  useEffect(() => {
    if (days && days.length > 0 && !selectedDayId) {
      setSelectedDayId(days[0].id);
    }
  }, [days, selectedDayId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (error || !trip || !days) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div>{error || 'Trip not found'}</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="h-screen overflow-y-auto">
        <PublicItineraryPanel
          tripId={tripId}
          selectedDayId={selectedDayId}
          onSelectDay={setSelectedDayId}
          onActivitySelect={setSelectedActivityId}
          slug={slug}
        />
      </div>
    </div>
  );
}

