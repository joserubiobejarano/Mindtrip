import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { cityPages, getCityBySlug } from "@/lib/seo/cities";
import { StructuredData } from "@/components/seo/StructuredData";
import { getSiteUrl } from "@/lib/seo/site";
import {
  buildCanonicalUrl,
  buildLanguageAlternates,
  getLocalizedPath,
  isSupportedLocale,
  SUPPORTED_LOCALES,
} from "@/lib/seo/urls";
import { getMarketingCopy } from "@/lib/i18n/marketing";
import { getItineraryCopy } from "@/lib/i18n/itinerary";
import { getCityItinerary } from "@/lib/itinerary/city-itineraries";
import { ItineraryHero } from "@/components/itinerary/Hero";
import { QuickFacts } from "@/components/itinerary/QuickFacts";
import { DayOverviewTable } from "@/components/itinerary/DayOverviewTable";
import { DayBlock } from "@/components/itinerary/DayBlock";
import { LogisticsTable } from "@/components/itinerary/LogisticsTable";
import { Checklist } from "@/components/itinerary/Checklist";
import { FAQAccordion } from "@/components/itinerary/FAQAccordion";
import { RelatedItineraries } from "@/components/itinerary/RelatedItineraries";
import { PrimaryCTA } from "@/components/itinerary/PrimaryCTA";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((lang) =>
    cityPages.map((city) => ({ lang, slug: city.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) {
    return {};
  }
  const city = getCityBySlug(slug);
  const path = getLocalizedPath(`/cities/${slug}`, lang);
  const copy = getMarketingCopy(lang);
  if (!city) {
    return buildMetadata({
      title: copy.citiesMetaTitle,
      description: copy.citiesMetaDescription,
      path,
      alternates: {
        canonical: buildCanonicalUrl(path),
        languages: buildLanguageAlternates(`/cities/${slug}`),
      },
      openGraphLocale: lang === "es" ? "es_ES" : "en_US",
      openGraphAlternateLocales: lang === "es" ? ["en_US"] : ["es_ES"],
    });
  }

  const title =
    lang === "es"
      ? `Itinerario de ${city.days} días en ${city.name} | Kruno`
      : `${city.name} ${city.days}-Day Itinerary | Kruno`;

  return buildMetadata({
    title,
    description: city.description,
    path,
    alternates: {
      canonical: buildCanonicalUrl(path),
      languages: buildLanguageAlternates(`/cities/${city.slug}`),
    },
    openGraphLocale: lang === "es" ? "es_ES" : "en_US",
    openGraphAlternateLocales: lang === "es" ? ["en_US"] : ["es_ES"],
  });
}

export default async function LocalizedCityItineraryPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) {
    notFound();
  }
  const city = getCityBySlug(slug);
  if (!city) {
    notFound();
  }

  const copy = getMarketingCopy(lang);
  const itineraryCopy = getItineraryCopy(lang);
  const itinerary = getCityItinerary(lang, slug);
  const siteUrl = getSiteUrl();
  const basePath = getLocalizedPath("", lang);
  const itineraryLabel =
    lang === "es"
      ? `Itinerario de ${city.days} días en ${city.name}`
      : `${city.name} ${city.days}-day itinerary`;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteUrl}${basePath}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: copy.citiesHubTitle,
          item: `${siteUrl}${basePath}/cities`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: lang === "es" ? `Itinerario de ${city.name}` : `${city.name} itinerary`,
          item: `${siteUrl}${basePath}/cities/${city.slug}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: itineraryLabel,
      description: city.description,
      touristType: "Leisure",
      itinerary: {
        "@type": "ItemList",
        itemListElement: city.highlights.map((highlight, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: highlight,
        })),
      },
    },
  ];

  if (!itinerary) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-10">
        <StructuredData data={structuredData} id={`kruno-city-ld-${lang}`} />
        <div className="space-y-4">
          <div className="text-sm uppercase tracking-wide text-muted-foreground">
            {city.country}
          </div>
          <h1 className="text-4xl font-bold">{itineraryLabel}</h1>
          <p className="text-lg text-muted-foreground">{city.description}</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">{copy.cityDetailHighlightsTitle}</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {city.highlights.map((highlight) => (
              <li key={highlight} className="rounded-xl border border-border/40 p-4">
                {highlight}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border/40 p-6 bg-background">
          <h3 className="text-xl font-semibold">{copy.cityDetailPlanTitle}</h3>
          <p className="mt-2 text-muted-foreground">{copy.cityDetailPlanBody}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={basePath || "/"}
              className="inline-flex items-center rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
            >
              {copy.cityDetailPlanCta}
            </Link>
            <Link
              href={`${basePath}/cities`}
              className="inline-flex items-center rounded-full border border-border px-6 py-2 text-sm font-medium"
            >
              {copy.cityDetailBrowseAll}
            </Link>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold">{copy.cityDetailExploreMore}</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {cityPages
              .filter((other) => other.slug !== city.slug)
              .map((other) => (
                <Link
                  key={other.slug}
                  href={`${basePath}/cities/${other.slug}`}
                  className="text-sm text-primary"
                >
                  {other.name}
                </Link>
              ))}
          </div>
        </div>
      </div>
    );
  }

  const localizedPrimaryCtaHref = getLocalizedPath(itinerary.primaryCtaHref, lang);
  const localizedSecondaryCtaHref = itinerary.secondaryCtaHref
    ? getLocalizedPath(itinerary.secondaryCtaHref, lang)
    : undefined;
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: itinerary.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
      <StructuredData data={[...structuredData, faqStructuredData]} id={`kruno-city-ld-${lang}`} />
      <ItineraryHero
        eyebrow={itinerary.hero.eyebrow ?? itineraryCopy.heroEyebrowLabel}
        title={itinerary.hero.title}
        subtitle={itinerary.hero.subtitle}
      />
      <QuickFacts
        title={itineraryCopy.quickFactsTitle}
        labels={itineraryCopy.quickFactsLabels}
        duration={`${itinerary.days} ${
          itinerary.days === 1 ? itineraryCopy.dayUnit.singular : itineraryCopy.dayUnit.plural
        }`}
        pace={itinerary.pace}
        idealFor={itinerary.idealFor}
        style={itinerary.style}
      />
      <section className="rounded-2xl border border-border/60 bg-background p-6 space-y-4">
        <h2 className="text-2xl font-semibold">{itineraryCopy.fitTitle}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {itineraryCopy.fitGoodLabel}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {itinerary.fit.forYou.map((item) => (
                <li key={item} className="rounded-lg border border-border/50 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {itineraryCopy.fitNotLabel}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {itinerary.fit.notForYou.map((item) => (
                <li key={item} className="rounded-lg border border-border/50 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <DayOverviewTable
        title={itineraryCopy.dayOverviewTitle}
        labels={itineraryCopy.dayOverviewTable}
        plans={itinerary.dayPlans}
      />
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">{itineraryCopy.dayBreakdownTitle}</h2>
        <div className="space-y-5">
          {itinerary.dayPlans.map((plan) => (
            <DayBlock key={plan.day} plan={plan} labels={itineraryCopy.dayBlockLabels} />
          ))}
        </div>
      </section>
      <LogisticsTable title={itineraryCopy.logisticsTitle} items={itinerary.logistics} />
      <Checklist
        title={itineraryCopy.checklistTitle}
        subtitle={itineraryCopy.checklistSubtitle}
        items={itinerary.checklist}
      />
      <FAQAccordion title={itineraryCopy.faqTitle} items={itinerary.faqs} />
      <RelatedItineraries
        title={itineraryCopy.relatedTitle}
        items={itinerary.relatedItineraries}
        basePath={basePath}
        dayUnit={itineraryCopy.dayUnit}
      />
      <PrimaryCTA
        title={itineraryCopy.primaryCtaTitle}
        body={itineraryCopy.primaryCtaBody}
        buttonText={itineraryCopy.primaryCtaButton}
        href={localizedPrimaryCtaHref}
      />
      {localizedSecondaryCtaHref ? (
        <PrimaryCTA
          title={itineraryCopy.secondaryCtaTitle}
          body={itineraryCopy.secondaryCtaBody}
          buttonText={itineraryCopy.secondaryCtaButton}
          href={localizedSecondaryCtaHref}
          variant="secondary"
        />
      ) : null}
    </div>
  );
}
