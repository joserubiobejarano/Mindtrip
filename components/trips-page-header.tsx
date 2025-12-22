"use client";

import { useLanguage } from "@/components/providers/language-provider";

export function TripsPageHeader() {
  const { t } = useLanguage();

  return (
    <div className="text-center mb-16">
      <h1 
        className="text-4xl md:text-5xl lg:text-6xl font-normal text-foreground mb-4 inline-block relative" 
        style={{ fontFamily: "'Patrick Hand', cursive" }}
      >
        {t('my_trips_title')}
        <span 
          className="absolute -bottom-2 left-0 right-0 h-2 bg-primary/20 -rotate-1 rounded-full"
          style={{ zIndex: -1 }}
        ></span>
      </h1>
      <p className="text-muted-foreground font-mono text-xs tracking-wider uppercase mt-4">
        {t('my_trips_subtitle')}
      </p>
    </div>
  );
}

