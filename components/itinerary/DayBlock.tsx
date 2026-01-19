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
    <article className="rounded-2xl border border-border/60 bg-background p-6 space-y-4">
      <div>
        <div className="text-sm uppercase tracking-wide text-muted-foreground">
          {labels.day} {plan.day}
        </div>
        <h3 className="text-xl font-semibold">{plan.title}</h3>
        <p className="text-muted-foreground">{plan.summary}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3 text-sm">
        <div>
          <div className="font-medium">{labels.morning}</div>
          <div className="text-muted-foreground">{plan.morning}</div>
        </div>
        <div>
          <div className="font-medium">{labels.afternoon}</div>
          <div className="text-muted-foreground">{plan.afternoon}</div>
        </div>
        <div>
          <div className="font-medium">{labels.evening}</div>
          <div className="text-muted-foreground">{plan.evening}</div>
        </div>
      </div>
    </article>
  );
}
