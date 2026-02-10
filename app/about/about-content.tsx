"use client";

import { MarketingNavbar } from "@/components/marketing-navbar";
import { NewFooter } from "@/components/new-footer";
import { useLanguage } from "@/components/providers/language-provider";

export function AboutContent({ isSignedIn = false }: { isSignedIn?: boolean }) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <MarketingNavbar isSignedIn={isSignedIn} />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 
          className="text-4xl font-bold mb-6"
          style={{ fontFamily: "'Patrick Hand', cursive" }}
        >
          {t('legal_about_title')}
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-muted-foreground mb-6">
            {t('legal_about_intro')}
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_about_section_mission_title')}</h2>
            <p className="text-muted-foreground">
              {t('legal_about_section_mission_text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_about_section_different_title')}</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>{t('legal_about_section_different_item_ai')}</li>
              <li>{t('legal_about_section_different_item_tinder')}</li>
              <li>{t('legal_about_section_different_item_collab')}</li>
              <li>{t('legal_about_section_different_item_multi')}</li>
              <li>{t('legal_about_section_different_item_integrated')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_about_section_why_title')}</h2>
            <p className="text-muted-foreground">
              {t('legal_about_section_why_text')}
            </p>
          </section>
        </div>
      </main>
      <NewFooter />
    </div>
  );
}

