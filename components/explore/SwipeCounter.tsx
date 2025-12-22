"use client";

import { useState } from 'react';
import { useExploreSession } from '@/hooks/use-explore';
import { Button } from '@/components/ui/button';
import { ProPaywallModal } from '@/components/pro/ProPaywallModal';
import { useLanguage } from '@/components/providers/language-provider';

interface SwipeCounterProps {
  tripId: string;
  className?: string;
}

export function SwipeCounter({ tripId, className }: SwipeCounterProps) {
  const { data: session } = useExploreSession(tripId);
  const [showProPaywall, setShowProPaywall] = useState(false);
  const { t } = useLanguage();

  if (!session) return null;

  // Only show when limit is reached for free users
  const isLimitReached = session.remainingSwipes !== null && session.remainingSwipes === 0;

  if (!isLimitReached) return null;

  return (
    <>
      <div className={`flex items-center gap-3 p-4 rounded-xl bg-muted border ${className}`}>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {t('explore_swipe_counter_limit_reached')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('explore_swipe_counter_upgrade')}
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowProPaywall(true)}
        >
          {t('explore_swipe_counter_upgrade_button')}
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

