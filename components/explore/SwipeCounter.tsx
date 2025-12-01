"use client";

import { useExploreSession } from '@/hooks/use-explore';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeCounterProps {
  tripId: string;
  className?: string;
}

export function SwipeCounter({ tripId, className }: SwipeCounterProps) {
  const { data: session } = useExploreSession(tripId);

  if (!session) return null;

  // Only show when limit is reached for free users
  const isLimitReached = session.remainingSwipes !== null && session.remainingSwipes === 0;

  if (!isLimitReached) return null;

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 ${className}`}>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 mb-1">
          You&apos;ve reached the swipe limit for this trip.
        </p>
        <p className="text-xs text-muted-foreground">
          Upgrade to continue discovering more places.
        </p>
      </div>
      <Button
        variant="default"
        size="sm"
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        onClick={() => {
          window.location.href = '/settings?upgrade=true';
        }}
      >
        <Sparkles className="h-3 w-3 mr-1" />
        Upgrade to Pro
      </Button>
    </div>
  );
}

