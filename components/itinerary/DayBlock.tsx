import type { DayPlan } from "@/lib/itinerary/city-itineraries";

type DayBlockLabels = {
  day: string;
  morning: string;
  afternoon: string;
  evening: string;
};

type DayBlockProps = {
  plan: DayPlan;
  labels: DayBlockLabels;
};

export function DayBlock({ plan, labels }: DayBlockProps) {
  return (
    <article className="rounded-3xl border border-border/70 bg-background p-6 shadow-md md:p-8 space-y-5">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-primary/70">
          {labels.day} {plan.day}
        </div>
        <h3 className="text-xl font-semibold">{plan.title}</h3>
        <p className="text-muted-foreground">{plan.summary}</p>
      </div>
      <div className="grid gap-4 text-sm md:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-3 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {labels.morning}
          </div>
          <div className="mt-2 font-medium text-foreground">{plan.morning}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-3 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {labels.afternoon}
          </div>
          <div className="mt-2 font-medium text-foreground">{plan.afternoon}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-3 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {labels.evening}
          </div>
          <div className="mt-2 font-medium text-foreground">{plan.evening}</div>
        </div>
      </div>
    </article>
  );
}
