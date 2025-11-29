"use client";

import { useState } from "react";
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
  const [chatMessage, setChatMessage] = useState("");
  const [parsingIntent, setParsingIntent] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);

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
    if (!chatMessage.trim() || parsingIntent) return;

    const message = chatMessage.trim();
    setChatMessage("");
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
      className="bg-white rounded-3xl p-7 max-w-7xl w-full mx-auto border-4 border-black"
      style={{
        boxShadow: '8px 8px 0px rgba(0, 0, 0, 1)'
      }}
    >
      <form onSubmit={onSubmit}>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-[3] relative w-full">
            <label className="block text-sm font-medium mb-2 text-gray-700">Where to?</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 size-5 z-10" />
              <DestinationAutocomplete
                value={destination}
                onChange={onDestinationChange}
                className="w-full"
                inputClassName="pl-12 pr-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-purple-600 focus:bg-white transition-all outline-none h-auto"
                placeholder="Search destinations..."
              />
            </div>
          </div>

          <div className="flex-1 relative w-full">
            <label className="block text-sm font-medium mb-2 text-gray-700">Check-in</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 size-5 z-10" />
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={onStartDateChange}
                onEndDateChange={onEndDateChange}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-blue-600 focus:bg-white transition-all"
                placeholder="Add dates"
                hideIcon={true}
              />
            </div>
          </div>

          <div className="flex-1 relative w-full">
            <label className="block text-sm font-medium mb-2 text-gray-700">Travelers</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 size-5 z-10" />
              <Input
                type="number"
                min="1"
                value={travelersCount}
                onChange={(e) => onTravelersChange(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-green-600 focus:bg-white transition-all outline-none"
                placeholder="Add guests"
              />
            </div>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto">
            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto h-[46px] px-6 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all border-2 border-orange-600 flex items-center justify-center gap-2"
            >
              <Search className="size-5 text-white" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
      </form>

      {/* Divider */}
      <div className="my-6 border-t border-gray-300" />

      {/* Chat Input Bar */}
      <form onSubmit={handleChatSubmit} className="relative">
        <div className="flex items-center gap-3 rounded-full border-[3px] border-black bg-white px-4 py-2.5 shadow-[6px_6px_0px_rgba(0,0,0,1)] focus-within:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 flex-shrink-0">
            <MessageCircle className="h-4 w-4 text-purple-600" />
          </span>
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Or tell us where to go..."
            className="flex-1 border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            disabled={parsingIntent}
          />
          <button
            type="submit"
            disabled={parsingIntent || !chatMessage.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff7a00] text-white shadow-sm transition hover:translate-y-[1px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {parsingIntent ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        {intentError && (
          <p className="mt-2 text-sm text-red-600 text-center">{intentError}</p>
        )}
      </form>
    </motion.div>
  );
}

