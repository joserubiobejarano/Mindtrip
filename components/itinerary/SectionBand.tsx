import type { ReactNode } from "react";

type SectionBandVariant = "base" | "soft" | "highlight" | "accent";

type SectionBandProps = {
  id?: string;
  variant?: SectionBandVariant;
  padding?: "md" | "lg";
  className?: string;
  innerClassName?: string;
  children: ReactNode;
};

const variantStyles: Record<SectionBandVariant, string> = {
  base: "bg-background",
  soft: "bg-muted/40",
  highlight: "bg-primary/10",
  accent: "bg-primary/15",
};

const paddingStyles = {
  md: "py-12",
  lg: "py-16",
};

export function SectionBand({
  id,
  variant = "base",
  padding = "md",
  className,
  innerClassName,
  children,
}: SectionBandProps) {
  return (
    <section id={id} className={`${variantStyles[variant]} ${className ?? ""}`}>
      <div className={`max-w-6xl mx-auto px-6 ${paddingStyles[padding]} ${innerClassName ?? ""}`}>
        {children}
      </div>
    </section>
  );
}
