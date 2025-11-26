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
      className="bg-white rounded-3xl shadow-2xl p-6 max-w-5xl mx-auto border-4 border-black"
      style={{
        boxShadow: '8px 8px 0px rgba(0, 0, 0, 1)'
      }}
    >
      <div className="grid md:grid-cols-5 gap-4">
        <div className="md:col-span-2 relative">
          <label className="block text-sm mb-2 text-gray-600">Where to?</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 size-5 z-10" />
            <DestinationAutocomplete
              value={destination}
              onChange={onDestinationChange}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-300 focus:border-purple-600 focus:bg-white transition-all outline-none"
              placeholder="Search destinations..."
            />
          </div>
        </div>

        <div className="md:col-span-2 relative">
          <label className="block text-sm mb-2 text-gray-600">Check-in / Check-out</label>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
            className="w-full py-4 rounded-xl bg-gray-50 border-2 border-gray-300 focus:border-blue-600 focus:bg-white transition-all"
            placeholder="Add dates"
          />
        </div>

        <div className="relative">
          <label className="block text-sm mb-2 text-gray-600">Travelers</label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 size-5 z-10" />
            <Input
              type="number"
              min="1"
              value={travelersCount}
              onChange={(e) => onTravelersChange(Number(e.target.value))}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-300 focus:border-green-600 focus:bg-white transition-all outline-none"
              placeholder="Add guests"
            />
          </div>
        </div>

        <div className="flex items-end">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all border-2 border-black"
          >
            <Search className="mr-2 size-5" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>
    </motion.form>
  );
}

