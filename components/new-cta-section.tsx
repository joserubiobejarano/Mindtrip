"use client";

import { Apple, Play } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export function NewCTASection() {
  const { t } = useLanguage();
  
  return (
    <section className="py-20 px-6">
      {/* App Download Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg">
          <div className="text-center">
            <h3 
              className="text-2xl md:text-3xl mb-2"
              style={{ fontFamily: "'Patrick Hand', cursive" }}
            >
              {t('home_cta_title')}
            </h3>
            <p className="text-muted-foreground mb-8">{t('home_cta_subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="flex items-center gap-3 bg-foreground text-background px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
                <Apple className="w-8 h-8" />
                <div className="text-left">
                  <div className="text-xs opacity-80">{t('home_cta_download_on')}</div>
                  <div className="font-semibold">{t('home_cta_app_store')}</div>
                </div>
              </button>
              <button className="flex items-center gap-3 bg-foreground text-background px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
                <Play className="w-8 h-8" />
                <div className="text-left">
                  <div className="text-xs opacity-80">{t('home_cta_get_it_on')}</div>
                  <div className="font-semibold">{t('home_cta_google_play')}</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

