"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, TranslationKey, translate } from '@/lib/i18n';

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'kruno_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEY) as Language;
    
    if (savedLanguage === 'en' || savedLanguage === 'es') {
      setLanguageState(savedLanguage);
    } else {
      const browserLang = navigator.language.split('-')[0];
      const defaultLang: Language = browserLang === 'es' ? 'es' : 'en';
      setLanguageState(defaultLang);
      localStorage.setItem(STORAGE_KEY, defaultLang);
    }
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const t = (key: TranslationKey) => {
    return translate(language, key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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

