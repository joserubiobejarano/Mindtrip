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
    <article className="rounded-3xl border-2 border-[#333B4D] bg-white p-6 shadow-md md:p-8 space-y-5 font-sans">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-[#F27263]">
          {labels.day} {plan.day}
        </div>
        <h3 className="text-xl font-semibold">{plan.title}</h3>
        <p className="text-slate-600">{plan.summary}</p>
      </div>
      <div className="grid gap-4 text-sm md:grid-cols-3">
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-amber-700">
            {labels.morning}
          </div>
          <div className="mt-2 font-medium text-amber-900">{plan.morning}</div>
        </div>
        <div className="rounded-2xl border border-sky-200/70 bg-sky-50/70 px-4 py-3 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-sky-700">
            {labels.afternoon}
          </div>
          <div className="mt-2 font-medium text-sky-900">{plan.afternoon}</div>
        </div>
        <div className="rounded-2xl border border-rose-200/70 bg-rose-50/70 px-4 py-3 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-rose-700">
            {labels.evening}
          </div>
          <div className="mt-2 font-medium text-rose-900">{plan.evening}</div>
        </div>
      </div>
    </article>
  );
}
