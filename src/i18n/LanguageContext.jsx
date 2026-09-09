// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getDefaultLanguage, getSupportedLanguages, isSupportedLanguage } from './translations';
import { getLanguageFromPath } from './languagePath';

const STORAGE_KEY = 'pepegraphy-language';
const LANGUAGE_PATH_PATTERN = /^\/(en|hu)(?=\/|$)/;

const LanguageContext = createContext(null);

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
    const pathLanguage = getLanguageFromPath();
    if (isSupportedLanguage(pathLanguage)) return pathLanguage;

    const stored = readStoredLanguage();
    return isSupportedLanguage(stored) ? stored : getDefaultLanguage();
  });

  useEffect(() => {
    writeStoredLanguage(language);
  }, [language]);

  // Sync URL when user changes language (language → URL)
  useEffect(() => {
    const pathLanguage = getLanguageFromPath();

    // If URL already matches the current language, no need to update
    if (pathLanguage === language) return;

    const defaultLanguage = getDefaultLanguage();
    const currentPath = window.location.pathname;
    const cleanPath = currentPath.replace(LANGUAGE_PATH_PATTERN, '') || '/';

    let nextPath;
    if (language === defaultLanguage) {
      nextPath = cleanPath;
    } else {
      nextPath = `/${language}${cleanPath === '/' ? '' : cleanPath}`;
    }

    const nextLocation = `${nextPath}${window.location.hash}`;

    if (window.location.pathname !== nextPath) {
      window.history.replaceState(null, '', nextLocation);
    }
  }, [language]);

  // Sync language when URL changes via browser navigation (URL → language)
  useEffect(() => {
    // Sync language when URL changes via browser back/forward
    const handlePopState = () => {
      const pathLanguage = getLanguageFromPath();
      if (pathLanguage && isSupportedLanguage(pathLanguage) && pathLanguage !== language) {
        setLanguage(pathLanguage);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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

/* eslint-disable react-refresh/only-export-components */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider.');
  return context;
}
