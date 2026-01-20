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
  const buttonClass =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "bg-foreground text-background hover:bg-foreground/90";

  return (
    <section className="mx-auto w-full max-w-4xl rounded-3xl border-[3px] border-[#F27263] bg-white px-8 py-10 text-center shadow-md">
      <div className="mx-auto max-w-xl space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <Link
          href={href}
          className={`inline-flex items-center justify-center rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm ${buttonClass}`}
        >
          {buttonText}
        </Link>
        <p className="text-xs text-muted-foreground">{body}</p>
      </div>
    </section>
  );
}
