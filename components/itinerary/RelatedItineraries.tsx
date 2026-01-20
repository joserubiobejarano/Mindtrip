import Image from "next/image";
import Link from "next/link";
import type { RelatedItinerary } from "@/lib/itinerary/city-itineraries";

type RelatedItinerariesProps = {
  title: string;
  items: Array<
    RelatedItinerary & {
      image?: {
        src: string;
        alt: string;
      };
    }
  >;
  basePath: string;
  dayUnit: {
    singular: string;
    plural: string;
  };
  buttonText: string;
};

export function RelatedItineraries({
  title,
  items,
  basePath,
  dayUnit,
  buttonText,
}: RelatedItinerariesProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-center text-2xl font-semibold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`${basePath}/cities/${item.slug}`}
            className="group overflow-hidden rounded-3xl border border-[#333B4D] bg-white text-[#333B4D] shadow-md transition hover:-translate-y-0.5"
          >
            {item.image ? (
              <div className="relative h-40 w-full">
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ) : null}
            <div className="p-5">
              <div className="text-xs uppercase tracking-[0.2em]">
                {item.city} · {item.days} {item.days === 1 ? dayUnit.singular : dayUnit.plural}
              </div>
              <div className="mt-3 text-lg font-semibold">{item.city}</div>
              <p className="mt-2 text-sm">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-center">
        <Link
          href={`${basePath}/cities`}
          className="inline-flex items-center justify-center rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm bg-foreground text-background hover:bg-foreground/90"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
}
