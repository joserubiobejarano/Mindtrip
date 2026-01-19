type ItineraryHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
};

export function ItineraryHero({ eyebrow, title, subtitle }: ItineraryHeroProps) {
  return (
    <section className="space-y-4">
      {eyebrow ? (
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </div>
      ) : null}
      <h1 className="text-4xl font-semibold text-balance">{title}</h1>
      <p className="text-lg text-muted-foreground text-balance">{subtitle}</p>
    </section>
  );
}
