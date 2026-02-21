import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationKey, getLanguageFromCountry } from './translations';

interface TranslationContextType {
  language: Language;
  t: (key: TranslationKey) => string;
  setLanguage: (lang: Language) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode; country?: string }> = ({ children, country }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    if (country) {
      const detectedLang = getLanguageFromCountry(country);
      setLanguage(detectedLang);
      console.log(`Language set to ${detectedLang} based on country: ${country}`);
    }
  }, [country]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};
