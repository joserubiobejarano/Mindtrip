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
    <section className="rounded-3xl border-2 border-[#333B4D] bg-white p-6 shadow-md md:p-8 font-sans">
      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7b2b04]">
        {title}
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-amber-700">{labels.duration}</div>
          <div className="mt-2 text-lg font-semibold text-amber-900">{duration}</div>
        </div>
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-amber-700">{labels.pace}</div>
          <div className="mt-2 text-lg font-semibold text-amber-900">{pace}</div>
        </div>
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-amber-700">
            {labels.idealFor}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {idealFor.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#F27263] bg-white px-3 py-1 text-xs text-[#F27263]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-amber-700">{labels.style}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {style.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#F27263] bg-white px-3 py-1 text-xs text-[#F27263]"
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
