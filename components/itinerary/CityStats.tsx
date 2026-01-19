type CityStat = {
  value: string;
  label: string;
};

type CityStatsProps = {
  title: string;
  items: CityStat[];
};

export function CityStats({ title, items }: CityStatsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-primary/15 bg-primary/10 px-6 py-8 md:px-10 md:py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
            {title}
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((stat) => (
          <div key={stat.label} className="space-y-1">
            <div className="text-3xl font-semibold text-foreground md:text-4xl">{stat.value}</div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
