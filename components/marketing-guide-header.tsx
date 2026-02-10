"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

type MarketingGuideHeaderProps = {
  ctaHref: string;
  showCta?: boolean;
};

export function MarketingGuideHeader({ ctaHref, showCta = true }: MarketingGuideHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#7b2b04]/15 bg-[#fff7ed]/90 backdrop-blur-sm">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-12">
        <Link href={ctaHref} aria-label="Kruno home" className="flex items-center gap-2">
          <Logo size="md" />
        </Link>
        {showCta ? (
          <Button asChild className="rounded-full px-4 text-xs font-semibold uppercase tracking-wider">
            <Link href={ctaHref}>Create my trip plan</Link>
          </Button>
        ) : null}
      </nav>
    </header>
  );
}
