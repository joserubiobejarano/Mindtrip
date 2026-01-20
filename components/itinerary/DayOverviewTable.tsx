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
    <section className="space-y-4 font-sans">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="overflow-x-auto border-[3px] border-[#333B4D] bg-white shadow-md">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-[#F27263] text-left text-xs uppercase tracking-[0.2em] text-white">
            <tr>
              <th className="px-6 py-5 font-medium">{labels.day}</th>
              <th className="px-6 py-5 font-medium">{labels.focus}</th>
              <th className="px-6 py-5 font-medium">{labels.morning}</th>
              <th className="px-6 py-5 font-medium">{labels.afternoon}</th>
              <th className="px-6 py-5 font-medium">{labels.evening}</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr
                key={plan.day}
                className="border-t border-[#333B4D]/20 bg-white text-[#333B4D]"
              >
                <td className="px-6 py-5 font-medium">{plan.day}</td>
                <td className="px-6 py-5">{plan.title}</td>
                <td className="px-6 py-5">{plan.morning}</td>
                <td className="px-6 py-5">{plan.afternoon}</td>
                <td className="px-6 py-5">{plan.evening}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
