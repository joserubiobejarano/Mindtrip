"use client";

import { useState } from "react";
import { Star, MapPin, Copy, Check, ExternalLink } from "lucide-react";
import type { ExplorePlace } from "@/lib/google/explore-places";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

interface ExplorePlaceDetailsCardProps {
  place: ExplorePlace | null;
  tripCity?: string;
}

export function ExplorePlaceDetailsCard({ place, tripCity }: ExplorePlaceDetailsCardProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const handleCopyAddress = async () => {
    if (!place) return;

    const textToCopy = place.address || place.name;
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const handleOpenInGoogleMaps = () => {
    if (!place) return;

    let url: string;
    const name = place.name || '';
    const address = place.address || '';
    const placeId = place.place_id;

    // Primary: Use place_id to open the actual place listing (not just coordinates)
    // This opens the full Google Maps place page with reviews, photos, etc.
    if (placeId) {
      // Include query parameter with encoded name for better UX
      const queryParam = name ? `&query=${encodeURIComponent(name)}` : '';
      url = `https://www.google.com/maps/search/?api=1&query_place_id=${placeId}${queryParam}`;
    } else {
      // Fallback: If place_id is missing, use query string with name and address
      // Use name + address only (no tripCity, no coordinates)
      const searchQuery = name && address 
        ? `${name} ${address}`
        : name || address;
      
      if (!searchQuery) {
        // Both name and address are missing, cannot create URL
        return;
      }
      
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
    }

    // Debug logging (DEV-only)
    console.debug("[Explore] Open in Maps", { name, place_id: placeId, url });

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Skeleton/placeholder when no place
  if (!place) {
    return (
      <div className="p-4 bg-white rounded-lg border border-sage/20">
        <div className="space-y-3">
          <div className="h-6 bg-sage/10 rounded animate-pulse" />
          <div className="h-4 bg-sage/10 rounded w-2/3 animate-pulse" />
          <div className="h-4 bg-sage/10 rounded w-4/5 animate-pulse" />
          <div className="flex gap-2 mt-4">
            <div className="h-9 bg-sage/10 rounded flex-1 animate-pulse" />
            <div className="h-9 bg-sage/10 rounded flex-1 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-sage/20 shadow-sm">
      <div className="space-y-3">
        {/* Place Name */}
        <h3 className="text-lg font-semibold text-foreground line-clamp-2">
          {place.name}
        </h3>

        {/* Category */}
        {place.category && (
          <div>
            <span className="inline-block font-mono text-xs uppercase tracking-wider text-sage bg-sage/10 px-3 py-1 rounded-full">
              {place.category}
            </span>
          </div>
        )}

        {/* Rating and Review Count */}
        {place.rating != null && (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-coral text-coral" />
            <span className="font-semibold text-foreground">{place.rating.toFixed(1)}</span>
            {place.user_ratings_total != null && (
              <span className="text-sm text-muted-foreground">
                ({place.user_ratings_total.toLocaleString()} reviews)
              </span>
            )}
          </div>
        )}

        {/* Address */}
        {place.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {place.address}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-sage/20">
          <button
            onClick={handleOpenInGoogleMaps}
            disabled={!place.place_id && !place.name && !place.address}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2",
              "text-sm font-medium rounded-md",
              "bg-white border border-sage/30 text-foreground",
              "hover:bg-sage/5 hover:border-coral transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-sage/30"
            )}
          >
            <ExternalLink className="w-4 h-4" />
            {t('explore_button_open_maps')}
          </button>
          <button
            onClick={handleCopyAddress}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2",
              "text-sm font-medium rounded-md",
              "bg-white border border-sage/30 text-foreground",
              "hover:bg-sage/5 hover:border-coral transition-colors"
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                {t('explore_button_copied')}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                {t('explore_button_copy_address')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

