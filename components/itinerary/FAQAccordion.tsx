import type { FaqItem } from "@/lib/itinerary/city-itineraries";

type FAQAccordionProps = {
  title: string;
  items: FaqItem[];
};

export function FAQAccordion({ title, items }: FAQAccordionProps) {
  return (
    <section className="space-y-4 font-sans">
      <div className="space-y-4 flex flex-col items-center">
        <h2 className="text-2xl font-semibold md:max-w-3xl w-full">{title}</h2>
        <div className="space-y-3 flex flex-col items-center w-full">
        {items.map((item) => (
          <details
            key={item.question}
            className="rounded-2xl border border-[#F6B14A]/70 bg-[#FFEDD5] px-4 py-3 text-[#7B2B04] md:max-w-3xl w-full"
          >
            <summary className="cursor-pointer text-sm font-medium">
              {item.question}
            </summary>
            <div className="mt-2 text-sm text-[#7B2B04]/80">{item.answer}</div>
          </details>
        ))}
        </div>
      </div>
    </section>
  );
}
