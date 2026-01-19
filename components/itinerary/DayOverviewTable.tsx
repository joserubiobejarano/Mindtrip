import type { DayPlan } from "@/lib/itinerary/city-itineraries";

type DayOverviewLabels = {
  day: string;
  focus: string;
  morning: string;
  afternoon: string;
  evening: string;
};

type DayOverviewTableProps = {
  title: string;
  labels: DayOverviewLabels;
  plans: DayPlan[];
};

export function DayOverviewTable({ title, labels, plans }: DayOverviewTableProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="overflow-x-auto rounded-2xl border border-border/60">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">{labels.day}</th>
              <th className="px-4 py-3 font-medium">{labels.focus}</th>
              <th className="px-4 py-3 font-medium">{labels.morning}</th>
              <th className="px-4 py-3 font-medium">{labels.afternoon}</th>
              <th className="px-4 py-3 font-medium">{labels.evening}</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.day} className="border-t border-border/50">
                <td className="px-4 py-3 font-medium">{plan.day}</td>
                <td className="px-4 py-3">{plan.title}</td>
                <td className="px-4 py-3">{plan.morning}</td>
                <td className="px-4 py-3">{plan.afternoon}</td>
                <td className="px-4 py-3">{plan.evening}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
