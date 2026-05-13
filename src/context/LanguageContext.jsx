import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../translations/en';
import { es } from '../translations/es';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'es');
  const [translations, setTranslations] = useState(language === 'es' ? es : en);

  useEffect(() => {
    localStorage.setItem('language', language);
    setTranslations(language === 'es' ? es : en);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const t = (path) => {
    const keys = path.split('.');
    let result = translations;
    for (const key of keys) {
      if (result[key] === undefined) return path;
      result = result[key];
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
