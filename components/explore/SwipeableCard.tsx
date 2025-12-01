"use client";

import { motion, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import type { ExplorePlace } from '@/lib/google/explore-places';

interface SwipeableCardProps {
  place: ExplorePlace;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  disabled?: boolean;
}

export function SwipeableCard({ place, onSwipeLeft, onSwipeRight, onSwipeUp, disabled = false }: SwipeableCardProps) {
  if (!place) return null;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-8, 0, 8]);

  const handleDragEnd = (_: any, info: { offset: { x: number; y: number } }) => {
    if (disabled) return;

    const { x: offsetX, y: offsetY } = info.offset;

    if (offsetX > 120) {
      onSwipeRight?.();
      return;
    }

    if (offsetX < -120) {
      onSwipeLeft?.();
      return;
    }

    if (offsetY < -120) {
      onSwipeUp?.();
      return;
    }

    // If threshold not reached, let Framer Motion animate back to center
  };

  return (
    <motion.div
      className="bg-white rounded-3xl shadow-xl border border-border max-w-xl w-full min-h-[320px] flex flex-col overflow-hidden"
      style={{ x, y, rotate }}
      drag={!disabled}
      dragElastic={0.3}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
    >
      {place.photo_url && (
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={place.photo_url}
            alt={place.name ?? 'Place photo'}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="p-4 flex flex-col gap-2">
        <div className="text-lg font-semibold">
          {place.name ?? 'Unnamed place'}
        </div>
        {place.address && (
          <div className="text-sm text-muted-foreground">
            {place.address}
          </div>
        )}
        {place.rating && (
          <div className="text-sm text-muted-foreground">
            ⭐ {place.rating.toFixed(1)}
            {place.user_ratings_total && ` (${place.user_ratings_total} reviews)`}
          </div>
        )}
        {place.category && (
          <div className="text-xs font-medium text-muted-foreground">
            {place.category}
          </div>
        )}
      </div>
    </motion.div>
  );
}

