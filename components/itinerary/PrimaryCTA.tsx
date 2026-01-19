import Link from "next/link";

type PrimaryCTAProps = {
  title: string;
  body: string;
  buttonText: string;
  href: string;
  variant?: "primary" | "secondary";
};

export function PrimaryCTA({
  title,
  body,
  buttonText,
  href,
  variant = "primary",
}: PrimaryCTAProps) {
  const containerClass =
    variant === "primary"
      ? "rounded-3xl bg-primary text-primary-foreground shadow-lg"
      : "rounded-3xl border border-border bg-muted/30";
  const buttonClass =
    variant === "primary"
      ? "bg-primary-foreground text-primary"
      : "bg-primary text-primary-foreground";

  return (
    <section className={`${containerClass} px-8 py-10`}>
      <div className="max-w-2xl space-y-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className={variant === "primary" ? "text-primary-foreground/90" : "text-muted-foreground"}>
          {body}
        </p>
        <Link
          href={href}
          className={`inline-flex items-center rounded-full px-6 py-2 text-sm font-medium ${buttonClass}`}
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
}
