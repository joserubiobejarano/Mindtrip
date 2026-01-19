"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cityPages } from "@/lib/seo/cities";
import { influencerPages } from "@/lib/seo/influencers";
import { getMarketingCopy } from "@/lib/i18n/marketing";
import { useLanguage } from "@/components/providers/language-provider";

export function ExploreLinksSection() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const locale = pathname?.startsWith("/es")
    ? "es"
    : pathname?.startsWith("/en")
      ? "en"
      : language;
  const basePath = locale ? `/${locale}` : "";
  const copy = getMarketingCopy(locale);
  const withBasePath = (path: string) => `${basePath}${path}`;

  return (
    <section className="bg-background py-16">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold">{copy.exploreSectionTitle}</h2>
          <p className="text-muted-foreground">{copy.exploreSectionSubtitle}</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{copy.exploreCitiesTitle}</h3>
            <div className="flex flex-wrap gap-3">
              {cityPages.map((city) => (
                <Link
                  key={city.slug}
                  href={withBasePath(`/cities/${city.slug}`)}
                  className="rounded-full border border-border/60 px-4 py-2 text-sm hover:border-primary/60 transition-colors"
                >
                  {city.name}
                </Link>
              ))}
              <Link href={withBasePath("/cities")} className="text-sm text-primary">
                {copy.exploreCitiesCta}
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{copy.exploreInfluencersTitle}</h3>
            <div className="flex flex-wrap gap-3">
              {influencerPages.map((influencer) => (
                <Link
                  key={influencer.slug}
                  href={withBasePath(`/influencers/${influencer.slug}`)}
                  className="rounded-full border border-border/60 px-4 py-2 text-sm hover:border-primary/60 transition-colors"
                >
                  {influencer.name}
                </Link>
              ))}
              <Link href={withBasePath("/influencers")} className="text-sm text-primary">
                {copy.exploreInfluencersCta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
