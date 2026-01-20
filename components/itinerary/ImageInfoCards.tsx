import { SafeImage } from "@/components/itinerary/SafeImage";

type ImageInfoCard = {
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
};

type ImageInfoCardsProps = {
  title: string;
  subtitle?: string;
  items: ImageInfoCard[];
  fallbackSrc?: string;
};

export function ImageInfoCards({ title, subtitle, items, fallbackSrc }: ImageInfoCardsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        {subtitle ? <p className="mt-2 text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.title}
            className="group overflow-hidden rounded-3xl border border-border/70 bg-background shadow-md"
          >
            <div className="relative">
              <SafeImage
                src={item.image.src}
                alt={item.image.alt || item.title}
                fallbackSrc={fallbackSrc}
                fallbackTitle={item.title}
                aspectClassName="aspect-[4/3]"
                imageClassName="transition duration-500 group-hover:scale-105"
                sizes="(min-width: 1024px) 33vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/85">
                  {item.title}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 text-sm text-muted-foreground">{item.description}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
