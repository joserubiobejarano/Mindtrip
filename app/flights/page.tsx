"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FlightsPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/trips");
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Flights</h1>
        <p className="text-lg text-gray-600 mb-8">
          Flight search functionality is coming soon. Start planning your trip to organize your travel.
        </p>
        <Link href="/">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            Start Planning
          </Button>
        </Link>
      </div>
    </div>
  );
}

