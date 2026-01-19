import type { LogisticsItem } from "@/lib/itinerary/city-itineraries";

type LogisticsTableProps = {
  title: string;
  items: LogisticsItem[];
};

export function LogisticsTable({ title, items }: LogisticsTableProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="overflow-x-auto rounded-2xl border border-border/60">
        <table className="min-w-[520px] w-full text-sm">
          <tbody>
            {items.map((item) => (
              <tr key={item.label} className="border-t border-border/50">
                <th className="w-1/3 px-4 py-3 text-left font-medium text-muted-foreground">
                  {item.label}
                </th>
                <td className="px-4 py-3">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
