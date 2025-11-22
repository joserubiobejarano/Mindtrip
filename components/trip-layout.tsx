"use client";

interface TripLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function TripLayout({ leftPanel, rightPanel }: TripLayoutProps) {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Sidebar - 40% width */}
      <div className="w-[40%] border-r border-border overflow-y-auto bg-background">
        {leftPanel}
      </div>
      
      {/* Right Map Area - 60% width */}
      <div className="w-[60%] bg-muted">
        {rightPanel}
      </div>
    </div>
  );
}

