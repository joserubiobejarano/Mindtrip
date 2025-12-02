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
  // Hooks must be called unconditionally before any early returns
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-8, 0, 8]);
  
  // Overlay opacities for LIKE/NOPE
  const likeOpacity = useTransform(x, [80, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -80], [1, 0]);

  if (!place) return null;

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
    <div className="h-full w-full p-2">
      <motion.div
        className="h-full w-full rounded-[32px] bg-white shadow-2xl border border-border flex flex-col overflow-hidden relative"
        style={{ x, y, rotate }}
        drag={!disabled}
        dragElastic={0.3}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
      >
        {/* LIKE overlay */}
        <motion.div
          className="absolute top-6 left-6 px-4 py-2 rounded-xl border-2 border-emerald-500 text-emerald-500 text-lg font-bold bg-white/80 z-10 pointer-events-none"
          style={{ opacity: likeOpacity, rotate: -12 }}
        >
          LIKE
        </motion.div>

        {/* NOPE overlay */}
        <motion.div
          className="absolute top-6 right-6 px-4 py-2 rounded-xl border-2 border-rose-500 text-rose-500 text-lg font-bold bg-white/80 z-10 pointer-events-none"
          style={{ opacity: nopeOpacity, rotate: 12 }}
        >
          NOPE
        </motion.div>

        {/* Image section - top ~60% */}
        <div className="relative w-full h-[60%] p-2 pb-0">
          <div className="relative w-full h-full overflow-hidden rounded-3xl">
            {place.photo_url ? (
              <>
                <Image
                  src={place.photo_url}
                  alt={place.name ?? 'Place photo'}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Optional subtle gradient at bottom of image for legibility */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
              </>
            ) : (
              <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200" />
            )}
          </div>
        </div>

        {/* Solid white info section - bottom ~40% */}
        <div className="p-4 md:p-5 flex flex-col gap-1 flex-1">
          <div className="text-xl md:text-2xl font-bold text-zinc-900 mb-1">
            {place.name ?? 'Unnamed place'}
          </div>
          {place.category && (
            <div className="text-sm text-zinc-600 mb-2">
              {place.category}
            </div>
          )}
          {place.rating && (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <span className="text-yellow-400">⭐</span>
              <span className="font-semibold">{place.rating.toFixed(1)}</span>
              {place.user_ratings_total && (
                <span className="text-zinc-500">
                  ({place.user_ratings_total.toLocaleString()} reviews)
                </span>
              )}
            </div>
          )}
          {place.address && (
            <div className="text-xs text-zinc-500 mt-2 line-clamp-1">
              {place.address}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

