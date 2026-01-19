type QuickFactsLabels = {
  duration: string;
  pace: string;
  idealFor: string;
  style: string;
};

type QuickFactsProps = {
  title: string;
  labels: QuickFactsLabels;
  duration: string;
  pace: string;
  idealFor: string[];
  style: string[];
};

export function QuickFacts({
  title,
  labels,
  duration,
  pace,
  idealFor,
  style,
}: QuickFactsProps) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background p-6 shadow-md md:p-8">
      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
        {title}
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-3 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {labels.duration}
          </div>
          <div className="mt-2 text-lg font-semibold">{duration}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-3 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {labels.pace}
          </div>
          <div className="mt-2 text-lg font-semibold">{pace}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-3 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {labels.idealFor}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {idealFor.map((item) => (
              <span
                key={item}
                className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary/90"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-3 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {labels.style}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {style.map((item) => (
              <span
                key={item}
                className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary/90"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
