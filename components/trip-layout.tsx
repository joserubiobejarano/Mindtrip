"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface TripLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode | null;
}

export function TripLayout({ leftPanel, rightPanel }: TripLayoutProps) {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Map Area - On top for mobile, right side for desktop */}
      {rightPanel && (
        <div className="h-[40vh] md:h-auto md:w-[60%] bg-muted order-first md:order-none">
          {rightPanel}
        </div>
      )}
      
      {/* Left Sidebar - 40% width on desktop when map is visible, full width when map is hidden */}
      <div className={`flex-1 ${rightPanel ? 'md:w-[40%]' : 'md:w-full'} border-t md:border-t-0 ${rightPanel ? 'md:border-r' : ''} border-border overflow-y-auto bg-background flex flex-col`}>
        {/* Header with Back button */}
        <div className="p-6 pb-0 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/trips")}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to trips
          </Button>
        </div>
        {/* Panel content */}
        <div className="flex-1 overflow-y-auto">
          {leftPanel}
        </div>
      </div>
    </div>
  );
}

