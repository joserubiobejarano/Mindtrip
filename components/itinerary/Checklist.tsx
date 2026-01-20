"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

type ChecklistProps = {
  title: string;
  subtitle?: string;
  items: string[];
};

export function Checklist({ title, subtitle, items }: ChecklistProps) {
  const initialState = useMemo(() => items.map(() => false), [items]);
  const [checked, setChecked] = useState(initialState);

  return (
    <section className="space-y-4 font-sans">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        {subtitle ? <p className="mt-2 text-slate-600">{subtitle}</p> : null}
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <label
            key={item}
            className="flex items-start gap-3 rounded-2xl border border-[#F6B14A]/70 bg-[#FFF2C2] px-4 py-3 text-sm text-[#7B2B04] md:max-w-3xl"
          >
            <Checkbox
              checked={checked[index]}
              onCheckedChange={(value) => {
                const next = [...checked];
                next[index] = Boolean(value);
                setChecked(next);
              }}
              className="mt-0.5 border-[#F27263] data-[state=checked]:bg-[#F27263] data-[state=checked]:border-[#F27263]"
            />
            <span
              className={`font-medium ${
                checked[index] ? "line-through text-[#7B2B04]/60" : undefined
              }`}
            >
              {item}
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
