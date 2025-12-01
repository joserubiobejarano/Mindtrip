"use client";

import { Button } from '@/components/ui/button';
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
    <div className="flex items-center justify-center gap-4 mt-6">
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg border-2",
          !canUndo && "opacity-50 cursor-not-allowed"
        )}
        onClick={onUndo}
        disabled={!canUndo || disabled}
        aria-label="Undo"
      >
        <Undo2 className="h-6 w-6" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-16 w-16 rounded-full shadow-lg border-2 border-rose-500 text-rose-500 hover:bg-rose-50"
        onClick={onDislike}
        disabled={disabled}
        aria-label="Dislike"
      >
        <X className="h-7 w-7" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-16 w-16 rounded-full shadow-lg border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-50"
        onClick={onLike}
        disabled={disabled}
        aria-label="Like"
      >
        <Heart className="h-7 w-7" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg border-2 border-blue-500 text-blue-500 hover:bg-blue-50"
        onClick={onDetails}
        disabled={disabled}
        aria-label="Details"
      >
        <Info className="h-6 w-6" />
      </Button>
    </div>
  );
}

