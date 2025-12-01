"use client";

import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, X, ArrowUp, Star, MapPin } from 'lucide-react';
import type { ExplorePlace } from '@/lib/google/explore-places';
import { cn } from '@/lib/utils';

interface SwipeableCardProps {
  place: ExplorePlace;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 100;
const ROTATION_MULTIPLIER = 0.1;

export function SwipeableCard({ place, onSwipe, disabled = false }: SwipeableCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-300, 300], [-15, 15]);
  const opacity = useTransform(x, [-300, -SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD, 300], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (disabled) return;

    const offsetX = info.offset.x;
    const offsetY = info.offset.y;

    // Swipe up (details)
    if (offsetY < -SWIPE_THRESHOLD) {
      onSwipe('up');
      return;
    }

    // Swipe left (dislike)
    if (offsetX < -SWIPE_THRESHOLD) {
      onSwipe('left');
      return;
    }

    // Swipe right (like)
    if (offsetX > SWIPE_THRESHOLD) {
      onSwipe('right');
      return;
    }

    // Snap back to center
    x.set(0);
    y.set(0);
  };

  const handleButtonClick = (direction: 'left' | 'right' | 'up') => {
    if (disabled) return;
    onSwipe(direction);
  };

  return (
    <motion.div
      className={cn(
        "absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none",
        disabled && "cursor-not-allowed"
      )}
      style={{ x, y, rotate, opacity, touchAction: 'none' }}
      drag={disabled ? false : true}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      dragDirectionLock={true}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white shadow-lg border border-border">
        {/* Place Image */}
        {place.photo_url ? (
          <div className="relative w-full h-3/5">
            <Image
              src={place.photo_url}
              alt={place.name}
              fill
              className="object-cover"
              unoptimized
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-3/5 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <MapPin className="h-16 w-16 text-slate-400" />
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {/* Tags */}
          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {place.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Place Name */}
          <h3 className="text-2xl font-bold mb-2">{place.name}</h3>

          {/* Category & Neighborhood */}
          <div className="flex items-center gap-3 text-sm mb-2">
            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-md">
              {place.category}
            </span>
            {place.neighborhood && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {place.neighborhood}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">
              {place.rating.toFixed(1)} ({place.user_ratings_total.toLocaleString()} reviews)
            </span>
          </div>
        </div>

        {/* Action Buttons (for accessibility and mobile) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 opacity-100 md:opacity-0 md:hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="destructive"
            className="rounded-full h-12 w-12 min-h-[44px] min-w-[44px] touch-manipulation"
            onClick={() => handleButtonClick('left')}
            disabled={disabled}
            aria-label="Dislike"
          >
            <X className="h-6 w-6" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="rounded-full h-12 w-12 min-h-[44px] min-w-[44px] bg-white/90 backdrop-blur-sm touch-manipulation"
            onClick={() => handleButtonClick('up')}
            disabled={disabled}
            aria-label="View details"
          >
            <ArrowUp className="h-6 w-6" />
          </Button>
          <Button
            size="icon"
            variant="default"
            className="rounded-full h-12 w-12 min-h-[44px] min-w-[44px] bg-green-500 hover:bg-green-600 touch-manipulation"
            onClick={() => handleButtonClick('right')}
            disabled={disabled}
            aria-label="Like"
          >
            <Heart className="h-6 w-6 fill-white" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

