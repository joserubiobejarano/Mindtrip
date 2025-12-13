"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExploreFilters as ExploreFiltersType } from '@/lib/google/explore-places';
import { ProPaywallModal } from '@/components/pro/ProPaywallModal';

interface ExploreFiltersProps {
  filters: ExploreFiltersType;
  onFiltersChange: (filters: ExploreFiltersType) => void;
  className?: string;
  isPro?: boolean; // Pass from parent or fetch
  tripId?: string; // For paywall modal
}

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'tourist attractions', label: 'Attractions' },
  { value: 'museums', label: 'Museums' },
  { value: 'restaurants', label: 'Restaurants' },
  { value: 'parks', label: 'Parks' },
  { value: 'bars', label: 'Nightlife' },
];

const BUDGET_OPTIONS = [
  { value: '', label: 'Any budget' },
  { value: '0', label: 'Free' },
  { value: '1', label: '$' },
  { value: '2', label: '$$' },
  { value: '3', label: '$$$' },
  { value: '4', label: '$$$$' },
];

const DISTANCE_OPTIONS = [
  { value: '', label: 'Any distance' },
  { value: '1000', label: 'Within 1 km' },
  { value: '2000', label: 'Within 2 km' },
  { value: '5000', label: 'Within 5 km' },
  { value: '10000', label: 'Within 10 km' },
];

export function ExploreFilters({
  filters,
  onFiltersChange,
  className,
  isPro = false, // Default to false, should be passed from parent
  tripId,
}: ExploreFiltersProps) {
  const { user } = useUser();
  const [clientIsPro, setClientIsPro] = useState(isPro);
  const [showProPaywall, setShowProPaywall] = useState(false);

  // Check Pro status on mount
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/user/subscription-status`)
        .then(res => res.json())
        .then(data => setClientIsPro(data.isPro || false))
        .catch(() => setClientIsPro(false));
    }
  }, [user?.id]);

  const effectiveIsPro = isPro || clientIsPro;
  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category || undefined,
    });
  };

  const handleIncludeItineraryPlacesChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      includeItineraryPlaces: checked || undefined,
    });
  };

  const handleBudgetChange = (value: string) => {
    if (!effectiveIsPro) {
      setShowProPaywall(true);
      return;
    }
    onFiltersChange({
      ...filters,
      budget: value ? parseInt(value, 10) : undefined,
    });
  };

  const handleDistanceChange = (value: string) => {
    if (!effectiveIsPro) {
      setShowProPaywall(true);
      return;
    }
    onFiltersChange({
      ...filters,
      maxDistance: value ? parseInt(value, 10) : undefined,
    });
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Toggle: Show places already in itinerary */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div 
            onClick={() => handleIncludeItineraryPlacesChange(!filters.includeItineraryPlaces)}
            className={cn(
              "w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center",
              filters.includeItineraryPlaces 
                ? "border-coral bg-coral" 
                : "border-sage/40 group-hover:border-coral"
            )}
          >
            {filters.includeItineraryPlaces && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="text-sm text-foreground">Show places already in itinerary</span>
        </label>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-mono text-xs text-sage uppercase tracking-wider">Category:</span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategoryChange(cat.value)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border",
              filters.category === cat.value
                ? "bg-foreground text-white border-foreground"
                : "bg-white text-foreground border-sage/30 hover:border-coral hover:text-coral"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Pro Tier Filters - Show for all users but locked for non-Pro */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Budget Filter (Pro only) */}
        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-sage uppercase tracking-wider">Budget:</label>
          <div className="relative">
            <Select
              value={filters.budget?.toString() || ''}
              onValueChange={handleBudgetChange}
              disabled={!effectiveIsPro}
            >
              <SelectTrigger className={cn(
                "w-[120px] h-8 text-xs bg-white border-sage/30",
                !effectiveIsPro && "opacity-60 cursor-not-allowed"
              )}>
                <SelectValue placeholder="Any budget" />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!effectiveIsPro && (
              <div 
                className="absolute inset-0 cursor-pointer z-10"
                onClick={() => setShowProPaywall(true)}
                title="Upgrade to Pro to use budget filter"
              />
            )}
            {!effectiveIsPro && (
              <Lock className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            )}
          </div>
        </div>

        {/* Distance Filter (Pro only) */}
        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-sage uppercase tracking-wider">Distance:</label>
          <div className="relative">
            <Select
              value={filters.maxDistance?.toString() || ''}
              onValueChange={handleDistanceChange}
              disabled={!effectiveIsPro}
            >
              <SelectTrigger className={cn(
                "w-[120px] h-8 text-xs bg-white border-sage/30",
                !effectiveIsPro && "opacity-60 cursor-not-allowed"
              )}>
                <SelectValue placeholder="Any distance" />
              </SelectTrigger>
              <SelectContent>
                {DISTANCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!effectiveIsPro && (
              <div 
                className="absolute inset-0 cursor-pointer z-10"
                onClick={() => setShowProPaywall(true)}
                title="Upgrade to Pro to use distance filter"
              />
            )}
            {!effectiveIsPro && (
              <Lock className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            )}
          </div>
        </div>
      </div>

      <ProPaywallModal
        open={showProPaywall}
        onClose={() => setShowProPaywall(false)}
        tripId={tripId}
        context="filters"
      />
    </div>
  );
}

