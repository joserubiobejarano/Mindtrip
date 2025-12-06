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
    <div className="flex items-center gap-4 mt-8">
      <button
        className={cn(
          "w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-muted-foreground hover:text-sage transition-colors duration-300 hover:shadow-lg",
          (!canUndo || disabled) && "opacity-50 cursor-not-allowed"
        )}
        onClick={onUndo}
        disabled={!canUndo || disabled}
        aria-label="Undo"
      >
        <Undo2 className="w-5 h-5" />
      </button>
      
      <button
        className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-500 shadow-lg flex items-center justify-center text-white hover:scale-105 transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onDislike}
        disabled={disabled}
        aria-label="Dislike"
      >
        <X className="w-7 h-7" />
      </button>
      
      <button
        className="w-16 h-16 rounded-full bg-gradient-to-br from-coral to-coral/80 shadow-lg flex items-center justify-center text-white hover:scale-105 transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onLike}
        disabled={disabled}
        aria-label="Like"
      >
        <Heart className="w-7 h-7" />
      </button>
      
      <button
        className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-muted-foreground hover:text-coral transition-colors duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onDetails}
        disabled={disabled}
        aria-label="Details"
      >
        <Info className="w-5 h-5" />
      </button>
    </div>
  );
}

