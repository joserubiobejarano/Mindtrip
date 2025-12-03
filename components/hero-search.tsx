"use client";

import { useState, useRef } from "react";
import { Search, MapPin, Calendar, Users, MessageCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { DestinationAutocomplete } from "@/components/destination-autocomplete";
import { type DestinationOption } from "@/hooks/use-create-trip";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/date-range-picker";

interface HeroSearchProps {
  destination: DestinationOption | null;
  onDestinationChange: (destination: DestinationOption | null) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  travelersCount: number;
  onTravelersChange: (count: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
}

export function HeroSearch({
  destination,
  onDestinationChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  travelersCount,
  onTravelersChange,
  onSubmit,
  loading = false,
}: HeroSearchProps) {
  const [chatInput, setChatInput] = useState("");
  const [parsingIntent, setParsingIntent] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const chatSuggestions = [
    {
      id: 'weekend-madrid',
      label: 'Plan a weekend in Madrid',
      prompt:
        'Plan a 3-day weekend in Madrid in March for 2 people, focusing on food, culture, and some nightlife.',
    },
    {
      id: 'summer-europe',
      label: 'Backpacking in Europe',
      prompt:
        'Create a 10-day backpacking route across 3–4 cities in Europe starting from Madrid, using mostly trains and buses.',
    },
    {
      id: 'family-trip',
      label: 'Family trip',
      prompt:
        'Suggest a 7-day family-friendly trip with kids (8 and 10 years old), somewhere warm in December, flying from Madrid.',
    },
    {
      id: 'romantic-citybreak',
      label: 'Romantic city break',
      prompt:
        'Find a romantic 4-day city break in Europe in spring for a couple who loves coffee shops, viewpoints, and photography.',
    },
    {
      id: 'workation',
      label: 'Workation ideas',
      prompt:
        'Recommend 3 workation destinations with good Wi-Fi, cafes to work from, and mild weather in winter, flying from Madrid.',
    },
  ];

  const handleSuggestionClick = (prompt: string) => {
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
      const response = await fetch("/api/intent/travel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const result = await response.json();

      if (!result.success) {
        setIntentError(result.error || "Could not understand your request. Please try again.");
        return;
      }

      const { data } = result;

      // Auto-fill destination
      if (data.destination) {
        const foundDestination = await searchDestinationByName(data.destination);
        if (foundDestination) {
          onDestinationChange(foundDestination);
        } else {
          setIntentError(`Could not find destination "${data.destination}". Please select it manually.`);
        }
      }

      // Auto-fill dates
      if (data.startDate) {
        onStartDateChange(data.startDate);
      }
      if (data.endDate) {
        onEndDateChange(data.endDate);
      }

      // Auto-fill travelers
      if (data.travelers && data.travelers > 0) {
        onTravelersChange(data.travelers);
      }
    } catch (error) {
      console.error("Error parsing travel intent:", error);
      setIntentError("Failed to process your request. Please try again.");
    } finally {
      setParsingIntent(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="bg-card rounded-3xl border-2 border-border px-6 py-8 max-w-7xl w-full mx-auto shadow-lg"
    >
      <form onSubmit={onSubmit}>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-[3] relative w-full">
            <label className="block text-sm font-medium mb-2 text-foreground">Where to?</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary size-5 z-10" />
              <DestinationAutocomplete
                value={destination}
                onChange={onDestinationChange}
                className="w-full"
                inputClassName="pl-12 pr-4 py-3 rounded-full bg-input-background border-2 border-border focus:border-primary focus:bg-card transition-all outline-none h-auto"
                placeholder="Search destinations..."
              />
            </div>
          </div>

          <div className="flex-1 relative w-full">
            <label className="block text-sm font-medium mb-2 text-foreground">Check-in</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-chart-3 size-5 z-10" />
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={onStartDateChange}
                onEndDateChange={onEndDateChange}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-input-background border-2 border-border focus:border-chart-3 focus:bg-card transition-all"
                placeholder="Add dates"
                hideIcon={true}
              />
            </div>
          </div>

          <div className="flex-1 relative w-full">
            <label className="block text-sm font-medium mb-2 text-foreground">Travelers</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-accent size-5 z-10" />
              <Input
                type="number"
                min="1"
                value={travelersCount}
                onChange={(e) => onTravelersChange(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-input-background border-2 border-border focus:border-accent focus:bg-card transition-all outline-none"
                placeholder="Add guests"
              />
            </div>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto">
            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto h-[46px] px-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all flex items-center justify-center gap-2 shadow-lg transform hover:scale-105"
            >
              <Search className="size-5" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
      </form>

      {/* Divider */}
      <div className="my-6 border-t border-border" />

      {/* Chat Suggestions */}
      <div className="mt-4 mb-2 flex flex-wrap gap-2">
        {chatSuggestions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => handleSuggestionClick(s.prompt)}
            className="rounded-full border-2 border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleChatSubmit} className="relative">
        <div className="flex items-center gap-3 rounded-full border-2 border-border bg-input-background px-4 py-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
            <MessageCircle className="h-4 w-4 text-primary" />
          </span>
          <input
            ref={chatInputRef}
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Or tell us where to go..."
            className="flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            disabled={parsingIntent}
          />
          <button
            type="submit"
            disabled={parsingIntent || !chatInput.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {parsingIntent ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        {intentError && (
          <p className="mt-2 text-sm text-destructive text-center">{intentError}</p>
        )}
      </form>
    </motion.div>
  );
}

