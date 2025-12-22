"use client";

import { NewNavbar } from "@/components/new-navbar";
import { NewFooter } from "@/components/new-footer";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";

export function TermsContent() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <NewNavbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 
          className="text-4xl font-bold mb-6"
          style={{ fontFamily: "'Patrick Hand', cursive" }}
        >
          {t('legal_terms_title')}
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-muted-foreground mb-8">
            {t('legal_last_updated')} {new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_terms_section_intro_title')}</h2>
            <p className="text-muted-foreground">
              {t('legal_terms_section_intro_text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_terms_section_use_title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('legal_terms_section_use_intro')}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>{t('legal_terms_section_use_item_violate')}</li>
              <li>{t('legal_terms_section_use_item_infringe')}</li>
              <li>{t('legal_terms_section_use_item_transmit')}</li>
              <li>{t('legal_terms_section_use_item_unauthorized')}</li>
              <li>{t('legal_terms_section_use_item_spam')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_terms_section_payments_title')}</h2>
            <p className="text-muted-foreground">
              {t('legal_terms_section_payments_text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_terms_section_cancellation_title')}</h2>
            <p className="text-muted-foreground">
              {t('legal_terms_section_cancellation_text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_terms_section_liability_title')}</h2>
            <p className="text-muted-foreground">
              {t('legal_terms_section_liability_text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_terms_section_governing_title')}</h2>
            <p className="text-muted-foreground">
              {t('legal_terms_section_governing_text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_terms_section_changes_title')}</h2>
            <p className="text-muted-foreground">
              {t('legal_terms_section_changes_text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_terms_section_contact_title')}</h2>
            <p className="text-muted-foreground">
              {t('legal_terms_section_contact_text')}{" "}
              <a href="mailto:support@kruno.app" className="text-primary hover:underline">
                support@kruno.app
              </a>
              {" "}{t('legal_privacy_section_contact_or')}{" "}
              <Link href="/contact" className="text-primary hover:underline" rel="nofollow">
                {t('legal_terms_section_contact_link')}
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <NewFooter />
    </div>
  );
}

