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
    <section className="rounded-2xl border border-border/60 bg-background p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-sm text-muted-foreground">{labels.duration}</div>
          <div className="mt-1 font-medium">{duration}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{labels.pace}</div>
          <div className="mt-1 font-medium">{pace}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{labels.idealFor}</div>
          <div className="mt-1 flex flex-wrap gap-2">
            {idealFor.map((item) => (
              <span key={item} className="rounded-full bg-muted px-3 py-1 text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{labels.style}</div>
          <div className="mt-1 flex flex-wrap gap-2">
            {style.map((item) => (
              <span key={item} className="rounded-full bg-muted px-3 py-1 text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
