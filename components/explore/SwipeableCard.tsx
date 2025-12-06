"use client";

import { motion, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';
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
    <div className="h-full w-full flex items-center justify-center lg:p-4">
      <motion.div
        className="w-full h-full lg:max-w-sm lg:h-auto bg-white rounded-[2rem] lg:rounded-[2rem] shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl relative flex flex-col"
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

        {/* Image section - Takes more space on mobile for full-screen effect */}
        <div className="relative w-full flex-1 lg:flex-none lg:aspect-[4/3] overflow-hidden">
          {place.photo_url ? (
            <>
              <Image
                src={place.photo_url}
                alt={place.name ?? 'Place photo'}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </>
          ) : (
            <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200" />
          )}
        </div>

        {/* Content section - Compact on mobile, more padding on desktop */}
        <div className="p-4 lg:p-6 flex-shrink-0">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-1">
            {place.name ?? 'Unnamed place'}
          </h2>
          
          {place.category && (
            <span className="inline-block font-mono text-xs uppercase tracking-wider text-sage bg-sage/10 px-3 py-1 rounded-full mb-4">
              {place.category}
            </span>
          )}

          {place.rating && (
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 fill-coral text-coral" />
              <span className="font-semibold text-foreground">{place.rating.toFixed(1)}</span>
              {place.user_ratings_total && (
                <span className="text-muted-foreground text-sm">
                  ({place.user_ratings_total.toLocaleString()} reviews)
                </span>
              )}
            </div>
          )}

          {place.address && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {place.address}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

