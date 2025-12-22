import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    const initializeLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
        
        if (savedLanguage === 'en' || savedLanguage === 'es') {
          setLanguageState(savedLanguage as Language);
        } else {
          // Default to English for mobile (can be enhanced with device locale detection)
          setLanguageState('en');
          await AsyncStorage.setItem(STORAGE_KEY, 'en');
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
        setLanguageState('en');
      } finally {
        setIsInitialized(true);
      }
    };

    initializeLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const t = (key: TranslationKey) => {
    return translate(language, key);
  };

  // Don't render children until language is initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
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

