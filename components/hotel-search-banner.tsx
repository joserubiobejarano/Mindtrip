"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel } from "lucide-react";

interface HotelSearchBannerProps {
  tripId: string;
  className?: string;
}

export function HotelSearchBanner({ tripId, className }: HotelSearchBannerProps) {
  const router = useRouter();

  return (
    <div className={className}>
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Hotel className="h-5 w-5" />
            Need a place to stay?
          </CardTitle>
          <CardDescription>
            Search hotels for your trip dates and destination.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => router.push(`/trips/${tripId}/stay`)}
            className="w-full"
            variant="default"
          >
            Search hotels
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

