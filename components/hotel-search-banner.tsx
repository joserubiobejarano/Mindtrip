"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel, Plane } from "lucide-react";

interface HotelSearchBannerProps {
  tripId: string;
  className?: string;
  compact?: boolean;
}

export function HotelSearchBanner({ tripId, className, compact = false }: HotelSearchBannerProps) {
  const router = useRouter();

  if (compact) {
    return (
      <div className={className}>
        <div className="flex flex-row gap-4 mb-4 max-w-4xl">
          {/* Hotels Card */}
          <div 
            className="flex-1 rounded-3xl border-4 border-black bg-gradient-to-br from-[#fdf7ff] via-white to-[#f3f6ff] px-6 py-4"
            style={{ boxShadow: '8px 8px 0px rgba(0, 0, 0, 1)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Hotel className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">Need a place to stay?</h3>
            </div>
            <p className="text-xs text-gray-600 mb-3">Search hotels for your trip dates and destination.</p>
            <Button
              onClick={() => router.push(`/trips/${tripId}/stay`)}
              size="sm"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-xl text-xs"
            >
              Search hotels
            </Button>
          </div>

          {/* Flights Card */}
          <div 
            className="flex-1 rounded-3xl border-4 border-black bg-gradient-to-br from-[#fdf7ff] via-white to-[#f3f6ff] px-6 py-4"
            style={{ boxShadow: '8px 8px 0px rgba(0, 0, 0, 1)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Plane className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-900">Need flights?</h3>
            </div>
            <p className="text-xs text-gray-600 mb-3">Find flights that match your trip dates.</p>
            <Button
              onClick={() => router.push("/flights")}
              size="sm"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-xl text-xs"
            >
              Search flights
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Hotels Card */}
        <Card 
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-black rounded-2xl hover:shadow-xl transition-shadow"
          style={{ boxShadow: '8px 8px 0px rgba(0, 0, 0, 1)' }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Hotel className="h-5 w-5 text-blue-600" />
              Need a place to stay?
            </CardTitle>
            <CardDescription className="text-gray-600">
              Search hotels for your trip dates and destination.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push(`/trips/${tripId}/stay`)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-xl"
            >
              Search hotels
            </Button>
          </CardContent>
        </Card>

        {/* Flights Card */}
        <Card 
          className="bg-gradient-to-br from-purple-50 to-pink-50 border-4 border-black rounded-2xl hover:shadow-xl transition-shadow"
          style={{ boxShadow: '8px 8px 0px rgba(0, 0, 0, 1)' }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plane className="h-5 w-5 text-purple-600" />
              Need flights?
            </CardTitle>
            <CardDescription className="text-gray-600">
              Find flights that match your trip dates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/flights")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-xl"
            >
              Search flights
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

