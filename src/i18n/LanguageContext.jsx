// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getDefaultLanguage, getSupportedLanguages, isSupportedLanguage } from './translations';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'pepegraphy-language';

function readStoredLanguage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

function writeStoredLanguage(language) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage?.setItem(STORAGE_KEY, language);
  } catch {
    /* storage unavailable */
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const stored = readStoredLanguage();
    return isSupportedLanguage(stored) ? stored : getDefaultLanguage();
  });

  useEffect(() => {
    writeStoredLanguage(language);
  }, [language]);

  const supportedLanguages = useMemo(() => getSupportedLanguages(), []);
  const isDefaultLanguage = language === getDefaultLanguage();

  const value = useMemo(() => ({
    language,
    setLanguage,
    supportedLanguages,
    isDefaultLanguage,
  }), [language, supportedLanguages, isDefaultLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider.');
  return context;
}
