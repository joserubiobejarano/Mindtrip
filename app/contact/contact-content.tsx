"use client";

import { NewNavbar } from "@/components/new-navbar";
import { NewFooter } from "@/components/new-footer";
import { Mail } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export function ContactContent() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <NewNavbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 
          className="text-4xl font-bold mb-6"
          style={{ fontFamily: "'Patrick Hand', cursive" }}
        >
          {t('legal_contact_title')}
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            {t('legal_contact_intro')}
          </p>
          
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">{t('legal_contact_section_email_title')}</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              {t('legal_contact_section_email_intro')}
            </p>
            <a 
              href="mailto:support@kruno.app"
              className="text-primary hover:underline text-lg font-medium"
            >
              support@kruno.app
            </a>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_contact_section_response_title')}</h2>
            <p className="text-muted-foreground">
              {t('legal_contact_section_response_text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('legal_contact_section_help_title')}</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>{t('legal_contact_section_help_item_technical')}</li>
              <li>{t('legal_contact_section_help_item_feature')}</li>
              <li>{t('legal_contact_section_help_item_account')}</li>
              <li>{t('legal_contact_section_help_item_partnership')}</li>
              <li>{t('legal_contact_section_help_item_general')}</li>
            </ul>
          </section>
        </div>
      </main>
      <NewFooter />
    </div>
  );
}

