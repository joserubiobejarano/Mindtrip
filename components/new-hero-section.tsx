"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Calendar, MessageSquare, Send, Loader2, Plus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DestinationAutocomplete } from "@/components/destination-autocomplete";
import { DateRangePicker } from "@/components/date-range-picker";
import { TripPersonalizationDialog } from "@/components/trips/TripPersonalizationDialog";
import { type DestinationOption } from "@/hooks/use-create-trip";
import { useCreateTrip } from "@/hooks/use-create-trip";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const suggestionTags = [
  "Plan a weekend in Madrid",
  "Backpacking in Europe",
  "Family trip",
  "Romantic city break",
  "Workation ideas",
];

const suggestionPrompts: Record<string, string> = {
  "Plan a weekend in Madrid": "Plan a 3-day weekend in Madrid in March for 2 people, focusing on food, culture, and some nightlife.",
  "Backpacking in Europe": "Create a 10-day backpacking route across 3–4 cities in Europe starting from Madrid, using mostly trains and buses.",
  "Family trip": "Suggest a 7-day family-friendly trip with kids (8 and 10 years old), somewhere warm in December, flying from Madrid.",
  "Romantic city break": "Find a romantic 4-day city break in Europe in spring for a couple who loves coffee shops, viewpoints, and photography.",
  "Workation ideas": "Recommend 3 workation destinations with good Wi-Fi, cafes to work from, and mild weather in winter, flying from Madrid.",
};

export function NewHeroSection() {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  const { createTrip, loading: creatingTrip } = useCreateTrip();

  // Form state
  const [destination, setDestination] = useState<DestinationOption | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [personalizationOpen, setPersonalizationOpen] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [showMultiCity, setShowMultiCity] = useState(false);

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

  const handleSuggestionClick = (tag: string) => {
    const prompt = suggestionPrompts[tag] || tag;
    setChatInput(prompt);
    chatInputRef.current?.focus();
  };

  const searchDestinationByName = async (destinationName: string): Promise<DestinationOption | null> => {
    try {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!mapboxToken) {
        console.error("Mapbox token not configured");
        return null;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          destinationName
        )}.json?access_token=${mapboxToken}&types=place,country,region&limit=1`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const features = data.features || [];

      if (features.length === 0) {
        return null;
      }

      const feature = features[0];
      const placeName = feature.place_name.split(",")[0].trim();

      const regionParts: string[] = [];
      if (feature.context) {
        const country = feature.context.find((ctx: any) => ctx.id.startsWith("country"));
        const region = feature.context.find((ctx: any) => ctx.id.startsWith("region"));

        if (region) regionParts.push(region.text);
        if (country) regionParts.push(country.text);
      }
      const region = regionParts.join(", ") || feature.place_name.split(",").slice(1).join(",").trim();

      let type: "City" | "Country" | "Region" = "City";
      if (feature.place_type?.includes("country")) {
        type = "Country";
      } else if (feature.place_type?.includes("region")) {
        type = "Region";
      } else if (feature.place_type?.includes("place")) {
        type = "City";
      }

      return {
        id: feature.id,
        placeName,
        region,
        type,
        center: feature.center,
      };
    } catch (error) {
      console.error("Error searching destination:", error);
      return null;
    }
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
        setIntentError("I can help you plan trips and itineraries, but not other topics. Try describing the kind of trip you want.");
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
        // If parsing failed but has travel keywords, route to advisor
        if (hasTravelKeywords) {
          router.push(`/advisor?q=${encodeURIComponent(message)}`);
          return;
        }
        setIntentError(result.error || "Could not understand your request. Please try again.");
        setParsingIntent(false);
        return;
      }

      const { data } = result;

      // Classify intent
      const hasDestination = !!data.destination;
      const hasDates = !!(data.startDate && data.endDate);
      const wordCount = message.split(" ").length;

      // direct_itinerary: destination + dates, short message
      if (hasDestination && hasDates && wordCount <= 15) {
        // Auto-fill destination
        const foundDestination = await searchDestinationByName(data.destination);
        if (foundDestination) {
          setDestination(foundDestination);
        } else {
          setIntentError(`Could not find destination "${data.destination}". Please select it manually.`);
          setParsingIntent(false);
          return;
        }

        // Auto-fill dates
        if (data.startDate) {
          setStartDate(data.startDate);
        }
        if (data.endDate) {
          setEndDate(data.endDate);
        }

        // Note: travelers will be collected in personalization dialog
        setParsingIntent(false);
        return;
      }

      // exploratory_travel: destination but no dates, or longer message, or open-ended
      if (hasDestination || hasTravelKeywords || wordCount > 12) {
        router.push(`/advisor?q=${encodeURIComponent(message)}`);
        return;
      }

      // Fallback: if we have destination but parsing failed, try to use it
      if (hasDestination) {
        const foundDestination = await searchDestinationByName(data.destination);
        if (foundDestination) {
          setDestination(foundDestination);
        }
      }

      // If we have dates, use them
      if (data.startDate) {
        setStartDate(data.startDate);
      }
      if (data.endDate) {
        setEndDate(data.endDate);
      }

      setParsingIntent(false);
    } catch (error) {
      console.error("Error parsing travel intent:", error);
      // On error, if it looks like travel, route to advisor
      const travelKeywords = ["travel", "trip", "vacation", "visit", "go", "destination"];
      const messageLower = message.toLowerCase();
      if (travelKeywords.some((keyword) => messageLower.includes(keyword))) {
        router.push(`/advisor?q=${encodeURIComponent(message)}`);
      } else {
        setIntentError("Failed to process your request. Please try again.");
        setParsingIntent(false);
      }
    }
  };

  const handleStartPlanning = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    if (!destination) {
      setSearchError("Please select a destination");
      return;
    }

    if (!startDate || !endDate) {
      setSearchError("Please select both start and end dates");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setSearchError("End date must be after start date");
      return;
    }

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (!userId) {
      setSearchError("Please sign in to create a trip");
      return;
    }

    // Open personalization dialog instead of immediately creating trip
    setPersonalizationOpen(true);
  };

  const handlePersonalizationComplete = async (personalization: any) => {
    if (!destination) {
      setSearchError("Please select a destination");
      return;
    }

    try {
      await createTrip({
        destination,
        startDate,
        endDate,
        personalization,
      });
    } catch (error: any) {
      setSearchError(error.message || "Failed to create trip. Please try again.");
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
          Find Your Adventure
        </h1>

        {/* Search Card */}
        <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8 pt-20 relative overflow-visible">
          {/* Solid Border on Top - Higher */}
          <div className="absolute top-0 left-0 right-0 h-[60px] bg-primary rounded-t-2xl"></div>
          <div className="mt-[60px]">
          <form onSubmit={handleStartPlanning}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
              {/* Where to */}
              <div className="flex flex-col items-start md:col-span-5">
                <div className="flex items-center justify-between w-full mb-2">
                  <label className="font-mono text-[10px] tracking-wider uppercase text-foreground font-semibold">
                    Where to?
                  </label>
                  {destination && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (!isPro) {
                          router.push("/settings?upgrade=true");
                        } else {
                          setShowMultiCity(!showMultiCity);
                        }
                      }}
                      className="h-6 px-2 text-xs font-mono"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Multi-city
                      {!isPro && <Lock className="h-3 w-3 ml-1" />}
                    </Button>
                  )}
                </div>
                <div className="relative w-full">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                    </div>
                  </div>
                  <DestinationAutocomplete
                    value={destination}
                    onChange={setDestination}
                    className="w-full"
                    inputClassName="pl-14 bg-accent border-0 rounded-xl h-12 font-body placeholder:text-muted-foreground"
                    placeholder="Search destinations..."
                  />
                </div>
              </div>

              {/* Check-in */}
              <div className="flex flex-col items-start md:col-span-4">
                <label className="font-mono text-[10px] tracking-wider uppercase text-foreground font-semibold mb-2">
                  Check-in
                </label>
                <div className="relative w-full">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    className="w-full pl-10 bg-secondary border-0 rounded-xl h-12 font-body text-left justify-start hover:bg-secondary"
                    placeholder="Add dates"
                    hideIcon={true}
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="flex flex-col justify-end md:col-span-3">
                <Button
                  type="submit"
                  disabled={creatingTrip}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs tracking-wider uppercase rounded-xl h-12 gap-2 w-full px-6"
                >
                  <Search className="w-4 h-4" />
                  {creatingTrip ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </form>

          {searchError && (
            <div className="mb-6 text-sm text-destructive text-center">{searchError}</div>
          )}

          {/* Suggestion Tags */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide flex-nowrap">
            {suggestionTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSuggestionClick(tag)}
                className="px-4 py-2 bg-secondary rounded-full font-mono text-xs hover:bg-muted hover:text-foreground transition-colors whitespace-nowrap flex-shrink-0"
              >
                {tag}
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
              placeholder="Or tell us where to go..."
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

        {/* Personalization Dialog */}
        {destination && startDate && endDate && (
          <TripPersonalizationDialog
            isOpen={personalizationOpen}
            onClose={() => setPersonalizationOpen(false)}
            onComplete={handlePersonalizationComplete}
            destinationPlaceId={destination.id}
            destinationName={destination.placeName}
            startDate={startDate}
            endDate={endDate}
          />
        )}

        {/* Testimonial - positioned below search box */}
        <div className="mt-20 bg-card shadow-lg rounded-lg p-3 transform -rotate-6 animate-float hidden md:block mx-auto w-fit">
          <p className="font-display text-sm italic">&quot;Best trip ever!&quot;</p>
          <p className="text-xs text-muted-foreground mt-1">- Sarah</p>
        </div>
      </div>
    </section>
  );
}

