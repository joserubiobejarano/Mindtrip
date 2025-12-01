"use client";

import type { ExplorePlace } from '@/lib/google/explore-places';

interface SwipeableCardProps {
  place: ExplorePlace;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  disabled?: boolean;
}

export function SwipeableCard({ place, onSwipeLeft, onSwipeRight, onSwipeUp, disabled = false }: SwipeableCardProps) {
  if (!place) {
    return (
      <div className="bg-red-500 text-white p-4 rounded-xl">
        DEBUG: SwipeableCard called without place
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-border max-w-xl w-full h-[400px] flex flex-col overflow-hidden">
      <div className="p-4 flex flex-col h-full">
        <div className="text-xs font-medium text-muted-foreground mb-1">
          SWIPEABLE CARD DEBUG
        </div>
        <div className="text-lg font-semibold mb-1">
          {place.name ?? 'Unnamed place'}
        </div>
        <div className="text-sm text-muted-foreground mb-4">
          {place.address ?? 'No address available'}
        </div>
        <div className="text-xs text-muted-foreground mt-auto">
          place_id: {place.place_id}
        </div>
      </div>
    </div>
  );
}

