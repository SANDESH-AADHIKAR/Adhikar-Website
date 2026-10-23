'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language } from '@/lib/types';
import { getTranslation, LANGUAGE_OPTIONS } from '@/lib/i18n';
import { AuthProvider, useAuth } from './AuthContext';
import AuthModal from './AuthModal';

export { useAuth };

// -----------------------------------------------------------------------------
// Language Context
// -----------------------------------------------------------------------------

export interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Graceful fallback when used outside provider
    return {
      language: Language.ENGLISH,
      setLanguage: () => {},
      t: (path: string, params?: Record<string, string | number>) =>
        getTranslation(Language.ENGLISH, path, params),
    };
  }
  return ctx;
}

export const useTranslation = useLanguage;

// -----------------------------------------------------------------------------
// Theme Context
// -----------------------------------------------------------------------------

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: 'light' as ThemeMode,
      setTheme: () => {},
      toggleTheme: () => {},
      isDark: false,
    };
  }
  return ctx;
}

// -----------------------------------------------------------------------------
// Combined App Providers
// -----------------------------------------------------------------------------

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(Language.ENGLISH);
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage or environment on mount
  useEffect(() => {
    // 1. Language Init
    try {
      const savedLang = localStorage.getItem('adhikar_language');
      if (savedLang && Object.values(Language).includes(savedLang as Language)) {
        setLanguageState(savedLang as Language);
      }
    } catch {
      // ignore storage access errors
    }

    // 2. Theme Init
    try {
      const savedTheme = localStorage.getItem('adhikar_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setThemeState(savedTheme);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setThemeState('dark');
      }
    } catch {
      // ignore
    }

    setMounted(true);
  }, []);

  // Sync Theme with DOM and localStorage
  useEffect(() => {
    try {
      const root = document.documentElement;
      root.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('adhikar_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Sync Language with DOM and localStorage
  useEffect(() => {
    try {
      const langCode = LANGUAGE_OPTIONS[language]?.code || 'en';
      document.documentElement.lang = langCode;
      localStorage.setItem('adhikar_language', language);
    } catch {
      // ignore
    }
  }, [language]);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>) => {
      return getTranslation(language, path, params);
    },
    [language]
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
      }}
    >
      <LanguageContext.Provider
        value={{
          language,
          setLanguage,
          t,
        }}
      >
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}
