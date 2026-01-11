"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, TranslationKey, translate } from '@/lib/i18n';

type LanguageContextValue = {
  language: Language;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

/**
 * Detects browser language and determines if it's Spanish or English.
 * Always uses browser language detection - does not persist preferences.
 */
function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'en'; // Default for SSR
  }
  
  // Get browser language (e.g., 'es', 'es-ES', 'es-MX', 'en', 'en-US', etc.)
  const browserLang = navigator.language.split('-')[0];
  
  // If browser is in Spanish, return Spanish, otherwise return English
  return browserLang === 'es' ? 'es' : 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Always detect browser language on mount
    const detectedLang = detectBrowserLanguage();
    setLanguageState(detectedLang);
    setIsInitialized(true);
  }, []);

  const t = (key: TranslationKey) => {
    return translate(language, key);
  };

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {/* Optional: could wrap with a div that has lang attribute */}
      <div lang={language} className="h-full">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}

