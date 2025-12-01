"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExploreFilters as ExploreFiltersType } from '@/lib/google/explore-places';

interface ExploreFiltersProps {
  filters: ExploreFiltersType;
  onFiltersChange: (filters: ExploreFiltersType) => void;
  className?: string;
  isPro?: boolean; // Pass from parent or fetch
}

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'tourist attractions', label: 'Attractions' },
  { value: 'museums', label: 'Museums' },
  { value: 'restaurants', label: 'Restaurants' },
  { value: 'parks', label: 'Parks' },
  { value: 'bars', label: 'Nightlife' },
];

const TIME_OF_DAY = [
  { value: '', label: 'Any time' },
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
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
}: ExploreFiltersProps) {
  const { user } = useUser();
  const [clientIsPro, setClientIsPro] = useState(isPro);

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

  const handleTimeOfDayChange = (timeOfDay: string) => {
    onFiltersChange({
      ...filters,
      timeOfDay: (timeOfDay || undefined) as 'morning' | 'afternoon' | 'evening' | undefined,
    });
  };

  const handleIncludeItineraryPlacesChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      includeItineraryPlaces: checked || undefined,
    });
  };

  const handleBudgetChange = (value: string) => {
    onFiltersChange({
      ...filters,
      budget: value ? parseInt(value, 10) : undefined,
    });
  };

  const handleDistanceChange = (value: string) => {
    onFiltersChange({
      ...filters,
      maxDistance: value ? parseInt(value, 10) : undefined,
    });
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Toggle: Show places already in itinerary */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="include-itinerary-places"
          checked={filters.includeItineraryPlaces || false}
          onCheckedChange={handleIncludeItineraryPlacesChange}
        />
        <Label
          htmlFor="include-itinerary-places"
          className="text-sm font-normal cursor-pointer"
        >
          Show places already in itinerary
        </Label>
      </div>

      {/* Category Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={filters.category === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Time of Day Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Time of Day</label>
        <div className="flex flex-wrap gap-2">
          {TIME_OF_DAY.map((time) => (
            <Button
              key={time.value}
              variant={filters.timeOfDay === time.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeOfDayChange(time.value)}
            >
              {time.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Pro Tier Filters */}
      {effectiveIsPro && (
        <>
          {/* Budget Filter (Pro only) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium">Budget</label>
              <Sparkles className="h-3 w-3 text-purple-500" />
              <span className="text-xs text-muted-foreground">Pro</span>
            </div>
            <Select
              value={filters.budget?.toString() || ''}
              onValueChange={handleBudgetChange}
            >
              <SelectTrigger className="w-full">
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
          </div>

          {/* Distance Filter (Pro only) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium">Distance</label>
              <Sparkles className="h-3 w-3 text-purple-500" />
              <span className="text-xs text-muted-foreground">Pro</span>
            </div>
            <Select
              value={filters.maxDistance?.toString() || ''}
              onValueChange={handleDistanceChange}
            >
              <SelectTrigger className="w-full">
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
          </div>
        </>
      )}
    </div>
  );
}

