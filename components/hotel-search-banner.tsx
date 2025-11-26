"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel, Plane } from "lucide-react";

interface HotelSearchBannerProps {
  tripId: string;
  className?: string;
}

export function HotelSearchBanner({ tripId, className }: HotelSearchBannerProps) {
  const router = useRouter();

  return (
    <div className={className}>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Hotels Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-black rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
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
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-black rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
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

