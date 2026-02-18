import { Building2, Church, Droplets, Users } from "lucide-react";

type CityStat = {
  value: string;
  label: string;
};

type CityStatsProps = {
  title: string;
  cityName: string;
  items: CityStat[];
};

const statIcons = [Building2, Church, Droplets, Users];

export function CityStats({ title, cityName, items }: CityStatsProps) {
  if (items.length === 0) {
    return null;
  }

  // Replace "City" with the actual city name in the title
  const displayTitle = title.replace(/City/i, cityName);

  const isThreeItems = items.length === 3;

  return (
    <section className="space-y-8">
      <div className="text-center">
        <p className="text-base font-bold uppercase tracking-[0.25em] text-[#7b2b04]">{displayTitle}</p>
      </div>
      <div
        className={`grid gap-6 sm:grid-cols-2 ${isThreeItems ? "lg:grid-cols-3 lg:max-w-4xl lg:mx-auto" : "lg:grid-cols-4"}`}
      >
        {items.map((stat, index) => {
          const Icon = statIcons[index % statIcons.length];
          return (
          <div
            key={stat.label}
            className="flex items-start gap-4 rounded-2xl border border-border/50 bg-white px-6 py-5 shadow-[0_12px_35px_-25px_rgba(15,23,42,0.55)]"
          >
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-[#7b2b04]">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-sans text-3xl font-medium text-foreground md:text-4xl">{stat.value}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}
