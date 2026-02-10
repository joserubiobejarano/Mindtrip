"use client";

import { MarketingNavbar } from "@/components/marketing-navbar";
import { NewFooter } from "@/components/new-footer";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";

export function CookiesContent({ isSignedIn = false }: { isSignedIn?: boolean }) {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <MarketingNavbar isSignedIn={isSignedIn} />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 
          className="text-4xl font-bold mb-6"
          style={{ fontFamily: "'Patrick Hand', cursive" }}
        >
          {t('legal_cookies_title')}
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-muted-foreground mb-8">
            {t('legal_last_updated')} {new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_cookies_section_what_title')}</h2>
            <p className="text-muted-foreground">
              {t('legal_cookies_section_what_text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_cookies_section_how_title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('legal_cookies_section_how_intro')}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>{t('legal_cookies_section_how_essential')}</li>
              <li>{t('legal_cookies_section_how_preference')}</li>
              <li>{t('legal_cookies_section_how_analytics')}</li>
              <li>{t('legal_cookies_section_how_functional')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_cookies_section_consent_title')}</h2>
            <p className="text-muted-foreground">
              {t('legal_cookies_section_consent_text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_cookies_section_managing_title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('legal_cookies_section_managing_intro')}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>{t('legal_cookies_section_managing_item_browser')}</li>
              <li>{t('legal_cookies_section_managing_item_auto')}</li>
              <li>{t('legal_cookies_section_managing_item_impact')}</li>
              <li>{t('legal_cookies_section_managing_item_essential')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_cookies_section_third_party_title')}</h2>
            <p className="text-muted-foreground">
              {t('legal_cookies_section_third_party_text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_cookies_section_more_title')}</h2>
            <p className="text-muted-foreground">
              {t('legal_cookies_section_more_text')}{" "}
              <Link href="/privacy" className="text-primary hover:underline" rel="nofollow">
                {t('legal_cookies_section_more_link')}
              </Link>
              . {t('legal_cookies_section_more_contact')}{" "}
              <a href="mailto:support@kruno.app" className="text-primary hover:underline">
                support@kruno.app
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <NewFooter />
    </div>
  );
}

