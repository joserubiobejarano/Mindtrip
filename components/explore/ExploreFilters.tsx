"use client";

import { useState, useEffect, useMemo, useCallback, useRef, Dispatch, SetStateAction } from 'react';
import { useUser } from '@clerk/nextjs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExploreFilters as ExploreFiltersType } from '@/lib/google/explore-places';
import { ProPaywallModal } from '@/components/pro/ProPaywallModal';
import { useLanguage } from '@/components/providers/language-provider';

interface ExploreFiltersProps {
  filters: ExploreFiltersType;
  onFiltersChange: Dispatch<SetStateAction<ExploreFiltersType>>;
  className?: string;
  isPro?: boolean; // Pass from parent or fetch
  tripId?: string; // For paywall modal
}

// Categories will be translated in the component using t()
type CategoryItem = { value: string; labelKey?: string; label?: string };
const CATEGORIES: CategoryItem[] = [
  { value: 'all', labelKey: 'explore_filters_category_all' },
  { value: 'tourist attractions', labelKey: 'explore_filters_category_attractions' },
  { value: 'museums', labelKey: 'explore_filters_category_museums' },
  { value: 'restaurants', labelKey: 'explore_filters_category_restaurants' },
  { value: 'parks', labelKey: 'explore_filters_category_parks' },
  { value: 'bars', labelKey: 'explore_filters_category_nightlife' },
];

type OptionItem = { value: string; labelKey?: string; label?: string };
const BUDGET_OPTIONS: OptionItem[] = [
  { value: '0', labelKey: 'explore_filters_budget_free' },
  { value: '1', label: '$' },
  { value: '2', label: '$$' },
  { value: '3', label: '$$$' },
  { value: '4', label: '$$$$' },
];

const DISTANCE_OPTIONS: OptionItem[] = [
  { value: '1000', labelKey: 'explore_filters_distance_1km' },
  { value: '2000', labelKey: 'explore_filters_distance_2km' },
  { value: '5000', labelKey: 'explore_filters_distance_5km' },
  { value: '10000', labelKey: 'explore_filters_distance_10km' },
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
  const prevIsProRef = useRef<boolean | undefined>(undefined);
  const { t } = useLanguage();

  // Check Pro status on mount - never throw, always use safe defaults
  // Guard state updates with useRef to prevent unnecessary re-renders
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/user/subscription-status`)
        .then(res => {
          if (!res.ok) {
            return { isPro: false };
          }
          return res.json();
        })
        .then(data => {
          const newIsPro = data?.isPro || false;
          // Only update state if value actually changed
          if (prevIsProRef.current !== newIsPro) {
            prevIsProRef.current = newIsPro;
            setClientIsPro(newIsPro);
          }
        })
        .catch((error) => {
          // Log error but don't throw - use safe default
          console.error('[ExploreFilters] Error fetching pro status:', error);
          // Only update state if value actually changed
          if (prevIsProRef.current !== false) {
            prevIsProRef.current = false;
            setClientIsPro(false);
          }
        });
    } else {
      // No user ID - default to false, but only update if different
      if (prevIsProRef.current !== false) {
        prevIsProRef.current = false;
        setClientIsPro(false);
      }
    }
  }, [user?.id]);

  // Safe default - never throw, always boolean
  // Memoize to prevent recalculating on every render
  const effectiveIsPro = useMemo(() => Boolean(isPro || clientIsPro), [isPro, clientIsPro]);
  
  // Handlers use functional updates to avoid depending on filters prop
  // This prevents callback recreation when filters change, breaking the render loop
  const handleCategoryChange = useCallback((category: string) => {
    onFiltersChange((prev: ExploreFiltersType) => ({
      ...prev,
      category: category === 'all' || !category ? undefined : category,
    }));
  }, [onFiltersChange]);

  const handleIncludeItineraryPlacesChange = useCallback((checked: boolean) => {
    onFiltersChange((prev: ExploreFiltersType) => ({
      ...prev,
      includeItineraryPlaces: checked || undefined,
    }));
  }, [onFiltersChange]);

  const handleBudgetChange = useCallback((value: string) => {
    if (!effectiveIsPro) {
      setShowProPaywall(true);
      return;
    }
    onFiltersChange((prev: ExploreFiltersType) => ({
      ...prev,
      budget: value ? parseInt(value, 10) : undefined,
    }));
  }, [effectiveIsPro, onFiltersChange]);

  const handleDistanceChange = useCallback((value: string) => {
    if (!effectiveIsPro) {
      setShowProPaywall(true);
      return;
    }
    onFiltersChange((prev: ExploreFiltersType) => ({
      ...prev,
      maxDistance: value ? parseInt(value, 10) : undefined,
    }));
  }, [effectiveIsPro, onFiltersChange]);

  // Compute defaultValue for uncontrolled Select components
  // Only computed once on mount - Radix uncontrolled Select won't update after mount
  const budgetDefaultValue = filters.budget !== undefined && filters.budget !== null 
    ? String(filters.budget) 
    : undefined;

  const distanceDefaultValue = filters.maxDistance !== undefined && filters.maxDistance !== null 
    ? String(filters.maxDistance) 
    : undefined;

  // Dev-mode kill-switch: use plain HTML select in development to confirm loop disappears
  const useHtmlSelect = process.env.NODE_ENV === 'development';

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
          <span className="text-sm text-foreground">{t('explore_filters_show_in_itinerary')}</span>
        </label>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-mono text-xs text-sage uppercase tracking-wider">{t('explore_filters_category')}</span>
        {CATEGORIES.map((cat) => {
          // Handle "all" category - show as active when no category filter is set
          const isActive = cat.value === 'all' 
            ? !filters.category 
            : filters.category === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border",
                isActive
                  ? "bg-foreground text-white border-foreground"
                  : "bg-white text-foreground border-sage/30 hover:border-coral hover:text-coral"
              )}
            >
              {cat.labelKey ? t(cat.labelKey as any) : cat.label}
            </button>
          );
        })}
      </div>

      {/* Pro Tier Filters - Show for all users but locked for non-Pro */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Budget Filter (Pro only) */}
        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-sage uppercase tracking-wider">{t('explore_filters_budget')}</label>
          <div className="relative">
            {useHtmlSelect ? (
              <select
                value={budgetDefaultValue || ""}
                onChange={(e) => handleBudgetChange(e.target.value)}
                disabled={!effectiveIsPro}
                className={cn(
                  "w-[120px] h-8 text-xs bg-white border border-sage/30 rounded-md px-2",
                  !effectiveIsPro && "opacity-60 cursor-not-allowed"
                )}
              >
                <option value="">{t('explore_filters_any_budget')}</option>
                {BUDGET_OPTIONS.filter(opt => opt.value && opt.value.trim() !== '').map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.labelKey ? t(option.labelKey as any) : option.label}
                  </option>
                ))}
              </select>
            ) : (
              <Select
                defaultValue={budgetDefaultValue}
                onValueChange={handleBudgetChange}
                disabled={!effectiveIsPro}
              >
                <SelectTrigger className={cn(
                  "w-[120px] h-8 text-xs bg-white border-sage/30",
                  !effectiveIsPro && "opacity-60 cursor-not-allowed"
                )}>
                  <SelectValue placeholder={t('explore_filters_any_budget')} />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_OPTIONS.filter(opt => opt.value && opt.value.trim() !== '').map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.labelKey ? t(option.labelKey as any) : option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!effectiveIsPro && (
              <div 
                className="absolute inset-0 cursor-pointer z-10"
                onClick={() => setShowProPaywall(true)}
                title={t('explore_filters_upgrade_budget')}
              />
            )}
            {!effectiveIsPro && (
              <Lock className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            )}
          </div>
        </div>

        {/* Distance Filter (Pro only) */}
        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-sage uppercase tracking-wider">{t('explore_filters_distance')}</label>
          <div className="relative">
            {useHtmlSelect ? (
              <select
                value={distanceDefaultValue || ""}
                onChange={(e) => handleDistanceChange(e.target.value)}
                disabled={!effectiveIsPro}
                className={cn(
                  "w-[120px] h-8 text-xs bg-white border border-sage/30 rounded-md px-2",
                  !effectiveIsPro && "opacity-60 cursor-not-allowed"
                )}
              >
                <option value="">{t('explore_filters_any_distance')}</option>
                {DISTANCE_OPTIONS.filter(opt => opt.value && opt.value.trim() !== '').map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.labelKey ? t(option.labelKey as any) : option.label}
                  </option>
                ))}
              </select>
            ) : (
              <Select
                defaultValue={distanceDefaultValue}
                onValueChange={handleDistanceChange}
                disabled={!effectiveIsPro}
              >
                <SelectTrigger className={cn(
                  "w-[120px] h-8 text-xs bg-white border-sage/30",
                  !effectiveIsPro && "opacity-60 cursor-not-allowed"
                )}>
                  <SelectValue placeholder={t('explore_filters_any_distance')} />
                </SelectTrigger>
                <SelectContent>
                  {DISTANCE_OPTIONS.filter(opt => opt.value && opt.value.trim() !== '').map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.labelKey ? t(option.labelKey as any) : option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!effectiveIsPro && (
              <div 
                className="absolute inset-0 cursor-pointer z-10"
                onClick={() => setShowProPaywall(true)}
                title={t('explore_filters_upgrade_distance')}
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

