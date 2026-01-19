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
    <section className="rounded-2xl border border-border/60 bg-background p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <label key={item} className="flex items-start gap-3 text-sm">
            <Checkbox
              checked={checked[index]}
              onCheckedChange={(value) => {
                const next = [...checked];
                next[index] = Boolean(value);
                setChecked(next);
              }}
              className="mt-0.5"
            />
            <span className={checked[index] ? "line-through text-muted-foreground" : ""}>
              {item}
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
