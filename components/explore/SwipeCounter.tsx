"use client";

import { useExploreSession } from '@/hooks/use-explore';
import { Infinity, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeCounterProps {
  tripId: string;
  className?: string;
}

export function SwipeCounter({ tripId, className }: SwipeCounterProps) {
  const { data: session } = useExploreSession(tripId);

  if (!session) return null;

  // Hide for Pro users (unlimited)
  if (session.remainingSwipes === null) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Infinity className="h-4 w-4" />
        <span>Unlimited swipes</span>
      </div>
    );
  }

  const isLimitReached = session.remainingSwipes === 0;
  const isLowSwipes = !isLimitReached && session.remainingSwipes <= 3;

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <span className={isLimitReached ? 'text-destructive font-medium' : isLowSwipes ? 'text-amber-600 font-medium' : 'text-muted-foreground'}>
        {session.remainingSwipes} swipe{session.remainingSwipes !== 1 ? 's' : ''} remaining
      </span>
      {isLimitReached && (
        <Button
          variant="default"
          size="sm"
          className="ml-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          onClick={() => {
            window.location.href = '/settings?upgrade=true';
          }}
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Upgrade to Pro
        </Button>
      )}
      {isLowSwipes && (
        <Button
          variant="outline"
          size="sm"
          className="ml-2 border-purple-200 text-purple-700 hover:bg-purple-50"
          onClick={() => {
            window.location.href = '/settings?upgrade=true';
          }}
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Upgrade
        </Button>
      )}
      {!isLimitReached && !isLowSwipes && session.remainingSwipes <= 10 && (
        <span className="text-xs text-muted-foreground">
          (Daily limit: {session.dailyLimit})
        </span>
      )}
    </div>
  );
}

