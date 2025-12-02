"use client";

import { Undo2, X, Heart, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExploreActionsProps {
  onUndo: () => void;
  onDislike: () => void;
  onLike: () => void;
  onDetails: () => void;
  canUndo: boolean;
  disabled?: boolean;
}

export function ExploreActions({
  onUndo,
  onDislike,
  onLike,
  onDetails,
  canUndo,
  disabled = false,
}: ExploreActionsProps) {
  return (
    <div className="mt-4 flex items-center justify-center gap-4 relative z-20">
      <button
        className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center shadow-lg bg-zinc-200 text-zinc-700 hover:bg-zinc-300 transition-colors",
          (!canUndo || disabled) && "opacity-50 cursor-not-allowed"
        )}
        onClick={onUndo}
        disabled={!canUndo || disabled}
        aria-label="Undo"
      >
        <Undo2 className="h-5 w-5" />
      </button>

      <button
        className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onDislike}
        disabled={disabled}
        aria-label="Dislike"
      >
        <X className="h-6 w-6" />
      </button>

      <button
        className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onLike}
        disabled={disabled}
        aria-label="Like"
      >
        <Heart className="h-6 w-6" />
      </button>

      <button
        className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onDetails}
        disabled={disabled}
        aria-label="Details"
      >
        <Info className="h-5 w-5" />
      </button>
    </div>
  );
}

