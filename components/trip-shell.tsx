"use client";

interface TripShellProps {
  tripId: string;
  activeTab: string;
  children: React.ReactNode;
  selectedDayId: string | null;
  selectedActivityId?: string | null;
  activePlace?: { placeId: string; lat: number; lng: number } | null;
}

export function TripShell({
  tripId,
  activeTab,
  children,
  selectedDayId,
  selectedActivityId,
  activePlace,
}: TripShellProps) {
  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Content Panel - Full width for all tabs now */}
      <div className="flex-1 bg-background flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

