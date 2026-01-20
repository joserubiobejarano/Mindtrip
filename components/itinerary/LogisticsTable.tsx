import type { LogisticsItem } from "@/lib/itinerary/city-itineraries";

type LogisticsTableProps = {
  title: string;
  items: LogisticsItem[];
};

export function LogisticsTable({ title, items }: LogisticsTableProps) {
  return (
    <section className="space-y-4 font-sans">
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="overflow-x-auto rounded-3xl border-[3px] border-[#F27263] bg-white shadow-md">
          <table className="min-w-[520px] w-full text-sm">
          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.label}
                className={`border-t border-[#F27263]/60 bg-white text-[#333B4D] ${
                  index === 0 ? "border-t-0" : ""
                }`}
              >
                  <th className="w-1/3 px-4 py-5 text-left text-xs uppercase tracking-[0.2em]">
                    {item.label}
                  </th>
                  <td className="px-4 py-5 font-medium">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
