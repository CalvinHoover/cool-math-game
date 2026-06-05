// [GenAI Use] Prompt: "I need a React context provider for dark mode. It should read localStorage after mount to avoid hydration mismatches, support system preference detection, and apply a class to the HTML element. Write it with useState and useEffect."
// [GenAI Use] LLM Response Start
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderState {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey) as Theme | null;
    if (stored) {
      // Reading localStorage after mount avoids SSR hydration mismatch
      // eslint-disable-next-line
      setThemeState(stored);
    }
  }, [storageKey]);

  const resolvedTheme: 'dark' | 'light' =
    typeof window !== 'undefined' && theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme === 'system'
        ? 'light'
        : theme;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    window.localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  const value = {
    theme,
    resolvedTheme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection: The SSR hydration issue was subtle. Reading localStorage in useEffect instead of during render prevents the server and client from rendering different HTML. I added a comment explaining this.
