"use client";

import { MarketingNavbar } from "@/components/marketing-navbar";
import { NewFooter } from "@/components/new-footer";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";

export function PrivacyContent({ isSignedIn = false }: { isSignedIn?: boolean }) {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <MarketingNavbar isSignedIn={isSignedIn} />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 
          className="text-4xl font-bold mb-6"
          style={{ fontFamily: "'Patrick Hand', cursive" }}
        >
          {t('legal_privacy_title')}
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-muted-foreground mb-8">
            {t('legal_last_updated')} {new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_privacy_section_data_title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('legal_privacy_section_data_intro')}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>{t('legal_privacy_section_data_item_account')}</li>
              <li>{t('legal_privacy_section_data_item_trip')}</li>
              <li>{t('legal_privacy_section_data_item_payment')}</li>
              <li>{t('legal_privacy_section_data_item_usage')}</li>
              <li>{t('legal_privacy_section_data_item_communications')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_privacy_section_use_title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('legal_privacy_section_use_intro')}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>{t('legal_privacy_section_use_item_provide')}</li>
              <li>{t('legal_privacy_section_use_item_process')}</li>
              <li>{t('legal_privacy_section_use_item_send')}</li>
              <li>{t('legal_privacy_section_use_item_personalize')}</li>
              <li>{t('legal_privacy_section_use_item_detect')}</li>
              <li>{t('legal_privacy_section_use_item_comply')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_privacy_section_cookies_title')}</h2>
            <p className="text-muted-foreground">
              {t('legal_privacy_section_cookies_text')}{" "}
              <Link href="/cookies" className="text-primary hover:underline" rel="nofollow">
                {t('legal_privacy_section_cookies_link')}
              </Link>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_privacy_section_third_party_title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('legal_privacy_section_third_party_intro')}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Clerk:</strong> {t('legal_privacy_section_third_party_clerk')}</li>
              <li><strong>Supabase:</strong> {t('legal_privacy_section_third_party_supabase')}</li>
              <li><strong>Stripe:</strong> {t('legal_privacy_section_third_party_stripe')}</li>
              <li><strong>Google Places API:</strong> {t('legal_privacy_section_third_party_google')}</li>
              <li><strong>OpenAI:</strong> {t('legal_privacy_section_third_party_openai')}</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              {t('legal_privacy_section_third_party_note')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_privacy_section_rights_title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('legal_privacy_section_rights_intro')}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>{t('legal_privacy_section_rights_item_access')}</li>
              <li>{t('legal_privacy_section_rights_item_correct')}</li>
              <li>{t('legal_privacy_section_rights_item_delete')}</li>
              <li>{t('legal_privacy_section_rights_item_object')}</li>
              <li>{t('legal_privacy_section_rights_item_portability')}</li>
              <li>{t('legal_privacy_section_rights_item_withdraw')}</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              {t('legal_privacy_section_rights_contact')}{" "}
              <a href="mailto:support@kruno.app" className="text-primary hover:underline">
                support@kruno.app
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_privacy_section_security_title')}</h2>
            <p className="text-muted-foreground">
              {t('legal_privacy_section_security_text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_privacy_section_contact_title')}</h2>
            <p className="text-muted-foreground">
              {t('legal_privacy_section_contact_text')}{" "}
              <a href="mailto:support@kruno.app" className="text-primary hover:underline">
                support@kruno.app
              </a>
              {" "}{t('legal_privacy_section_contact_or')}{" "}
              <Link href="/contact" className="text-primary hover:underline" rel="nofollow">
                {t('legal_privacy_section_contact_link')}
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

