import { SafeImage } from "@/components/itinerary/SafeImage";

type ItineraryHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  image?: {
    src: string;
    alt: string;
  };
};

export function ItineraryHero({ eyebrow, title, subtitle, image }: ItineraryHeroProps) {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="space-y-4">
        {eyebrow ? (
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="text-4xl font-semibold text-balance md:text-5xl">{title}</h1>
        <p className="text-lg text-muted-foreground text-balance md:text-xl">{subtitle}</p>
      </div>
      <SafeImage
        src={image?.src}
        alt={image?.alt}
        fallbackTitle={title}
        className="overflow-hidden rounded-3xl border border-border/60 shadow-sm"
        priority
        sizes="(min-width: 1024px) 45vw, 100vw"
      />
    </section>
  );
}
