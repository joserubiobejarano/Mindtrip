import type { FaqItem } from "@/lib/itinerary/city-itineraries";

type FAQAccordionProps = {
  title: string;
  items: FaqItem[];
};

export function FAQAccordion({ title, items }: FAQAccordionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="rounded-3xl border border-border/70 bg-background px-5 py-4 shadow-md"
          >
            <summary className="cursor-pointer text-base font-medium">
              {item.question}
            </summary>
            <div className="mt-3 text-sm text-muted-foreground">{item.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
