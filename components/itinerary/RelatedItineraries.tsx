import Link from "next/link";
import type { RelatedItinerary } from "@/lib/itinerary/city-itineraries";

type RelatedItinerariesProps = {
  title: string;
  items: RelatedItinerary[];
  basePath: string;
  dayUnit: {
    singular: string;
    plural: string;
  };
};

export function RelatedItineraries({
  title,
  items,
  basePath,
  dayUnit,
}: RelatedItinerariesProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`${basePath}/cities/${item.slug}`}
            className="rounded-2xl border border-border/60 bg-background p-5 transition hover:border-primary/40"
          >
            <div className="text-sm text-muted-foreground">
              {item.city} · {item.days} {item.days === 1 ? dayUnit.singular : dayUnit.plural}
            </div>
            <div className="mt-2 text-lg font-semibold">{item.city}</div>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
