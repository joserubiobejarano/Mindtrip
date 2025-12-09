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
      {/* Map Area - Left side, full height, flex-1 */}
      {rightPanel && (
        <div className="h-[40vh] md:h-auto flex-1 order-first md:order-none">
          {rightPanel}
        </div>
      )}
      
      {/* Right Panel - Fixed width, scrollable */}
      <div className={`${rightPanel ? 'md:w-[400px]' : 'md:w-full'} border-t md:border-t-0 ${rightPanel ? 'md:border-l' : ''} border-border overflow-y-auto bg-background flex flex-col`}>
        {/* Header with Back buttons */}
        <div className="p-6 pb-0 border-b border-border">
          <div className="flex gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/trips")}
              className="-ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to trips
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              Homepage
            </Button>
          </div>
        </div>
        {/* Panel content */}
        <div className="flex-1 overflow-y-auto">
          {leftPanel}
        </div>
      </div>
    </div>
  );
}

