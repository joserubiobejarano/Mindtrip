"use client";

import { Search, MapPin, Calendar, Users } from "lucide-react";
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
  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      onSubmit={onSubmit}
      className="bg-white rounded-3xl shadow-lg p-6 max-w-7xl w-full mx-auto border-4 border-black"
      style={{
        boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1)'
      }}
    >
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
    </motion.form>
  );
}

