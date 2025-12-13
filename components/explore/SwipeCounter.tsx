"use client";

import { useState } from 'react';
import { useExploreSession } from '@/hooks/use-explore';
import { Button } from '@/components/ui/button';
import { ProPaywallModal } from '@/components/pro/ProPaywallModal';

interface SwipeCounterProps {
  tripId: string;
  className?: string;
}

export function SwipeCounter({ tripId, className }: SwipeCounterProps) {
  const { data: session } = useExploreSession(tripId);
  const [showProPaywall, setShowProPaywall] = useState(false);

  if (!session) return null;

  // Only show when limit is reached for free users
  const isLimitReached = session.remainingSwipes !== null && session.remainingSwipes === 0;

  if (!isLimitReached) return null;

  return (
    <>
      <div className={`flex items-center gap-3 p-4 rounded-xl bg-muted border ${className}`}>
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
          onClick={() => setShowProPaywall(true)}
        >
          Upgrade to Pro
        </Button>
      </div>
      <ProPaywallModal
        open={showProPaywall}
        onClose={() => setShowProPaywall(false)}
        tripId={tripId}
        context="swipes"
      />
    </>
  );
}

