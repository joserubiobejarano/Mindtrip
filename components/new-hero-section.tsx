"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Calendar, MessageSquare, Send, Loader2, Plus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/date-range-picker";
import { type DestinationOption } from "@/hooks/use-create-trip";
import { useCreateTrip } from "@/hooks/use-create-trip";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { usePaywall } from "@/hooks/usePaywall";
import { DestinationAutocomplete, type DestinationOption as AutocompleteDestinationOption } from "@/components/destination-autocomplete";
import { useLanguage } from "@/components/providers/language-provider";
import { ProPaywallModal } from "@/components/pro/ProPaywallModal";

const suggestionTagKeys = [
  "home_hero_suggestion_weekend",
  "home_hero_suggestion_backpacking",
  "home_hero_suggestion_family",
  "home_hero_suggestion_romantic",
  "home_hero_suggestion_workation",
] as const;

const suggestionPromptKeys: Record<string, string> = {
  "home_hero_suggestion_weekend": "home_hero_suggestion_weekend_prompt",
  "home_hero_suggestion_backpacking": "home_hero_suggestion_backpacking_prompt",
  "home_hero_suggestion_family": "home_hero_suggestion_family_prompt",
  "home_hero_suggestion_romantic": "home_hero_suggestion_romantic_prompt",
  "home_hero_suggestion_workation": "home_hero_suggestion_workation_prompt",
};

interface NewHeroSectionProps {
  destination: DestinationOption | null;
  setDestination: (destination: DestinationOption | null) => void;
}

export function NewHeroSection({ destination, setDestination }: NewHeroSectionProps) {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  const { createTrip, loading: creatingTrip } = useCreateTrip();
  const { openPaywall } = usePaywall();
  const { t } = useLanguage();

  // Form state
  const [destinationInput, setDestinationInput] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<AutocompleteDestinationOption | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [showMultiCity, setShowMultiCity] = useState(false);
  const [showProPaywall, setShowProPaywall] = useState(false);
  const [paywallContext, setPaywallContext] = useState<string>("multi-city");

  // Chat input state
  const [chatInput, setChatInput] = useState("");
  const [parsingIntent, setParsingIntent] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Fetch Pro status
  useEffect(() => {
    if (isSignedIn && userId) {
      fetch("/api/user/subscription-status")
        .then((res) => res.json())
        .then((data) => setIsPro(data.isPro || false))
        .catch(() => setIsPro(false));
    }
  }, [isSignedIn, userId]);

  // Sync destination from prop (e.g. from Experiences section)
  useEffect(() => {
    if (destination) {
      setDestinationInput(destination.placeName);
      setSelectedDestination({
        placeId: destination.id,
        name: destination.placeName,
        description: destination.placeName,
        city: destination.placeName, // Use placeName as city fallback
        center: destination.center,
        country: destination.region,
      });
      // Scroll to the search section when a destination is selected from experiences
      const searchSection = document.getElementById('search-section');
      if (searchSection) {
        searchSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [destination]);

  const handleSuggestionClick = (tagKey: string) => {
    const promptKey = suggestionPromptKeys[tagKey];
    if (promptKey) {
      setChatInput(t(promptKey as any));
    } else {
      setChatInput(t(tagKey as any));
    }
    chatInputRef.current?.focus();
  };


  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || parsingIntent) return;

    const message = chatInput.trim();
    setChatInput("");
    setIntentError(null);
    setParsingIntent(true);

    try {
      // Check for travel keywords (simple heuristic)
      const travelKeywords = ["travel", "trip", "vacation", "visit", "go", "destination", "city", "country", "weekend", "days", "week"];
      const messageLower = message.toLowerCase();
      const hasTravelKeywords = travelKeywords.some((keyword) => messageLower.includes(keyword));

      // If message is clearly non-travel, show error
      if (!hasTravelKeywords && message.split(" ").length < 5) {
        setIntentError(t('home_hero_error_non_travel'));
        setParsingIntent(false);
        return;
      }

      // Try to parse intent
      const response = await fetch("/api/intent/travel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const result = await response.json();

      if (!result.success) {
        setIntentError(result.error || t('home_hero_error_could_not_understand'));
        setParsingIntent(false);
        return;
      }

      const { data } = result;

      // Try to fill form fields with parsed data
      const hasDestination = !!data.destination;
      const hasDates = !!(data.startDate && data.endDate);

      // Auto-fill destination if available
      if (hasDestination) {
        setDestinationInput(data.destination);
        // Note: User will need to select from autocomplete dropdown for proper placeId
        // Clear any previously selected destination since we're using text input
        setSelectedDestination(null);
        // Create a basic destination object from the input
        const foundDestination: DestinationOption = {
          id: `city-${data.destination.toLowerCase().replace(/\s+/g, '-')}`,
          placeName: data.destination,
          region: "",
          type: "City",
          center: [0, 0],
        };
        setDestination(foundDestination);
      } else {
        setIntentError(t('home_hero_error_no_destination'));
        setParsingIntent(false);
        return;
      }

      // Auto-fill dates if available
      if (data.startDate) {
        setStartDate(data.startDate);
      }
      if (data.endDate) {
        setEndDate(data.endDate);
      }

      // If we have destination but no dates, still allow user to proceed
      // They can fill dates manually before clicking Search
      setParsingIntent(false);
    } catch (error) {
      console.error("Error parsing travel intent:", error);
      setIntentError(t('home_hero_error_failed_process'));
      setParsingIntent(false);
    }
  };

  const handleStartPlanning = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    // Require a selected destination from autocomplete
    if (!selectedDestination) {
      if (destinationInput.trim()) {
        setSearchError(t('home_hero_error_select_city'));
      } else {
        setSearchError(t('home_hero_error_enter_destination'));
      }
      return;
    }

    if (!startDate || !endDate) {
      setSearchError(t('home_hero_error_select_dates'));
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setSearchError(t('home_hero_error_invalid_dates'));
      return;
    }

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (!userId) {
      setSearchError(t('home_hero_error_sign_in'));
      return;
    }

    // Free user trip duration limit check (client-side before API call)
    const FREE_TRIP_MAX_DAYS = 4;
    if (!isPro && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      
      if (diffDays > FREE_TRIP_MAX_DAYS) {
        setPaywallContext("trip-duration");
        setShowProPaywall(true);
        setSearchError(null); // Don't show error message
        return;
      }
    }

    // Convert AutocompleteDestinationOption to DestinationOption format
    const destinationObj: DestinationOption = {
      id: selectedDestination.placeId,
      placeName: selectedDestination.name,
      region: selectedDestination.country,
      type: "City",
      center: selectedDestination.center,
    };

    // Create trip directly without personalization dialog
    try {
      await createTrip({
        destination: destinationObj,
        startDate,
        endDate,
      });
    } catch (error: any) {
      // Check if it's a trip limit error - show paywall instead of error message
      if (error.status === 403 && (error.errorData?.error === 'trip_limit_reached' || error.errorData?.message?.includes('trip limit') || error.message?.includes('trip_limit_reached'))) {
        setPaywallContext("trip-limit");
        setShowProPaywall(true);
        setSearchError(null); // Don't show error message
        return;
      }
      
      // Check if it's a trip duration limit error - show paywall instead of error message
      if (error.status === 403 && (
        error.errorData?.error === 'trip_duration_limit_reached' || 
        error.errorData?.error?.includes('trip_duration_limit') ||
        error.errorData?.message?.includes('trip duration') ||
        error.errorData?.message?.includes('4 days') ||
        error.errorData?.message?.toLowerCase().includes('free users are only allowed') ||
        error.message?.includes('trip_duration_limit_reached') ||
        error.message?.includes('trip_duration_limit') ||
        error.message?.includes('trip duration') ||
        error.message?.includes('4 days') ||
        error.message?.toLowerCase().includes('free users are only allowed')
      )) {
        setPaywallContext("trip-duration");
        setShowProPaywall(true);
        setSearchError(null); // Don't show the ugly raw error message
        return;
      }
      
      // For other errors, show the error message (but never show trip_duration_limit_reached)
      const errorMessage = error.message || "Failed to create trip. Please try again.";
      if (errorMessage.includes('trip_duration_limit_reached') || errorMessage.includes('trip_duration_limit')) {
        setPaywallContext("trip-duration");
        setShowProPaywall(true);
        setSearchError(null); // Don't show the ugly raw error message
        return;
      }
      setSearchError(errorMessage);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-start pt-16 pb-20 px-6 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute right-4 md:right-20 top-1/4">
        <svg className="w-16 h-16 text-muted-foreground/20" viewBox="0 0 64 64" fill="currentColor">
          <path d="M32 8 L40 24 L56 24 L44 36 L48 52 L32 44 L16 52 L20 36 L8 24 L24 24 Z" />
        </svg>
      </div>

      <div className="w-[70%] max-w-6xl mx-auto text-center relative mt-8">
        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal md:solid-underline inline-block text-foreground mb-20" style={{ fontFamily: "'Patrick Hand', cursive" }}>
          {t('home_hero_title')}
        </h1>

        {/* Search Card */}
        <div id="search-section" className="bg-card rounded-2xl shadow-xl p-6 md:p-8 pt-20 relative overflow-visible">
          {/* Solid Border on Top - Higher */}
          <div className="absolute top-0 left-0 right-0 h-[60px] bg-primary rounded-t-2xl"></div>
          <div className="mt-[60px]">
          <form onSubmit={handleStartPlanning}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
              {/* Where to */}
              <div className="flex flex-col items-start md:col-span-5">
                <div className="flex items-center justify-between w-full mb-2">
                  <label className="font-mono text-[10px] tracking-wider uppercase text-foreground font-semibold">
                    {t('home_search_where')}
                  </label>
                  {destinationInput && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (!isPro) {
                          openPaywall({ reason: "pro_feature", source: "multi_city_toggle" });
                        } else {
                          setShowMultiCity(!showMultiCity);
                        }
                      }}
                      className="h-6 px-2 text-xs font-mono"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {t('home_multi_city')}
                      {!isPro && <Lock className="h-3 w-3 ml-1" />}
                    </Button>
                  )}
                </div>
                <div className="relative w-full">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-9 h-9 md:w-8 md:h-8 rounded-full bg-accent flex items-center justify-center">
                      <MapPin className="w-5 h-5 md:w-4 md:h-4 text-muted-foreground" strokeWidth={2} />
                    </div>
                  </div>
                  <DestinationAutocomplete
                    value={destinationInput}
                    onChange={setDestinationInput}
                    onSelect={(dest) => {
                      setSelectedDestination(dest);
                      setDestinationInput(dest.description);
                    }}
                    inputClassName="pl-16 md:pl-14 bg-accent border-0 rounded-xl h-14 md:h-12 font-body placeholder:text-muted-foreground text-base md:text-sm"
                    placeholder={t('home_search_placeholder')}
                  />
                </div>
              </div>

              {/* Check-in */}
              <div className="flex flex-col items-start md:col-span-4">
                <label className="font-mono text-[10px] tracking-wider uppercase text-foreground font-semibold mb-2">
                  {t('home_search_checkin')}
                </label>
                <div className="relative w-full">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 md:w-4 md:h-4 text-muted-foreground" />
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    className="w-full pl-12 md:pl-10 bg-secondary border-0 rounded-xl h-14 md:h-12 font-body text-left justify-start hover:bg-secondary text-base md:text-sm"
                    placeholder={t('home_search_add_dates')}
                    hideIcon={true}
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="flex flex-col justify-end md:col-span-3">
                <Button
                  type="submit"
                  disabled={creatingTrip}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs tracking-wider uppercase rounded-xl h-14 md:h-12 gap-2 w-full px-6"
                >
                  <Search className="w-4 h-4" />
                  {creatingTrip ? t('home_search_searching') : t('home_search_button')}
                </Button>
              </div>
            </div>
          </form>

          {searchError && !searchError.includes('trip_duration_limit_reached') && !searchError.includes('trip_duration_limit') && (
            <div className="mb-6 text-sm text-destructive text-center">{searchError}</div>
          )}

          {/* Suggestion Tags */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide flex-nowrap">
            {suggestionTagKeys.map((tagKey) => (
              <button
                key={tagKey}
                type="button"
                onClick={() => handleSuggestionClick(tagKey)}
                className="px-4 py-2 bg-secondary rounded-full font-mono text-xs hover:bg-muted hover:text-foreground transition-colors whitespace-nowrap flex-shrink-0"
              >
                {t(tagKey)}
              </button>
            ))}
          </div>

          {/* AI Input */}
          <form onSubmit={handleChatSubmit} className="relative">
            <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={chatInputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={t('home_ai_placeholder')}
              className="pl-12 pr-12 bg-transparent border border-dashed border-muted-foreground/30 rounded-xl h-14 font-body"
              disabled={parsingIntent}
            />
            <button
              type="submit"
              disabled={parsingIntent || !chatInput.trim()}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            >
              {parsingIntent ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
          {intentError && (
            <p className="mt-2 text-sm text-destructive text-center">{intentError}</p>
          )}
          </div>
        </div>

      <ProPaywallModal
        open={showProPaywall}
        onClose={() => setShowProPaywall(false)}
        context={paywallContext}
      />

        {/* Testimonial - positioned below search box */}
        <div className="mt-20 bg-card shadow-lg rounded-lg p-3 transform -rotate-6 animate-float hidden md:block mx-auto w-fit">
          <p className="font-display text-sm italic">&quot;{t('home_hero_testimonial')}&quot;</p>
          <p className="text-xs text-muted-foreground mt-1">- {t('home_hero_testimonial_author')}</p>
        </div>
      </div>
    </section>
  );
}

