"use client";

import { useMemo, useState } from "react";
import type { DayPlan } from "@/lib/itinerary/city-itineraries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SafeImage } from "@/components/itinerary/SafeImage";

type DayBlockLabels = {
  day: string;
  morning: string;
  afternoon: string;
  evening: string;
};

type DayPlanImageCard = {
  title: string;
  image: {
    src: string;
    alt: string;
  };
};

type DayPlanSliderProps = {
  plans: DayPlan[];
  labels: DayBlockLabels;
  imageCards?: DayPlanImageCard[];
  heroImage?: {
    src: string;
    alt: string;
  };
};

export function DayPlanSlider({ plans, labels, imageCards, heroImage }: DayPlanSliderProps) {
  const defaultValue = useMemo(() => (plans[0] ? `day-${plans[0].day}` : "day-1"), [plans]);
  const [activeValue, setActiveValue] = useState(defaultValue);

  if (plans.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[2.5rem] border border-border/40 bg-white px-6 py-8 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.5)] md:px-10 md:py-12">
      <Tabs value={activeValue} onValueChange={setActiveValue} className="space-y-6">
        <div className="space-y-4">
          <TabsList className="flex h-auto w-full flex-wrap justify-center gap-2 rounded-full bg-muted/50 p-2">
            {plans.map((plan, index) => (
              <TabsTrigger
                key={plan.day}
                value={`day-${plan.day}`}
                className="rounded-full border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition data-[state=active]:border-primary/30 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {labels.day} {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="relative px-2">
            <div className="h-1 w-full rounded-full bg-gradient-to-r from-primary/60 via-primary/30 to-primary/10" />
            <div className="absolute inset-0 flex items-center justify-between">
              {plans.map((plan) => {
                const isActive = activeValue === `day-${plan.day}`;
                return (
                  <button
                    key={plan.day}
                    type="button"
                    onClick={() => setActiveValue(`day-${plan.day}`)}
                    aria-label={`${labels.day} ${plan.day}`}
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                      isActive
                        ? "border-primary bg-primary shadow-[0_0_0_6px_rgba(59,130,246,0.15)]"
                        : "border-muted-foreground/30 bg-background"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {plans.map((plan, index) => {
          const imageCard = imageCards?.[index];
          const image = imageCard?.image ?? heroImage;
          const imageTitle = imageCard?.title ?? plan.title;

          return (
            <TabsContent key={plan.day} value={`day-${plan.day}`} className="mt-0">
              <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:items-center">
                <div className="overflow-hidden rounded-2xl ring-1 ring-border/30">
                  <SafeImage
                    src={image?.src}
                    alt={image?.alt}
                    fallbackSrc={heroImage?.src}
                    fallbackTitle={imageTitle}
                    aspectClassName="aspect-[4/3] md:aspect-[5/4]"
                    className="bg-muted/40"
                    sizes="(min-width: 1024px) 40vw, 100vw"
                  />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                      {labels.day} {plan.day}
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900">{plan.title}</h3>
                    <p className="text-sm text-muted-foreground">{plan.summary}</p>
                  </div>
                  <div className="grid gap-3 text-sm">
                    <div className="rounded-2xl border border-[#F4C16D] bg-[#FFF2C2] px-4 py-3 shadow-sm text-[#7B2B04]">
                      <div className="text-xs uppercase tracking-[0.2em]">
                        {labels.morning}
                      </div>
                      <div className="mt-2 font-medium">{plan.morning}</div>
                    </div>
                    <div className="rounded-2xl border border-[#F4C16D] bg-[#FFF2C2] px-4 py-3 shadow-sm text-[#7B2B04]">
                      <div className="text-xs uppercase tracking-[0.2em]">
                        {labels.afternoon}
                      </div>
                      <div className="mt-2 font-medium">{plan.afternoon}</div>
                    </div>
                    <div className="rounded-2xl border border-[#F4C16D] bg-[#FFF2C2] px-4 py-3 shadow-sm text-[#7B2B04]">
                      <div className="text-xs uppercase tracking-[0.2em]">
                        {labels.evening}
                      </div>
                      <div className="mt-2 font-medium">{plan.evening}</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
