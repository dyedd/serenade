// Dark mode toggle: persists to localStorage, applies `.dark` class to <html>.
// A matching inline script in root.tsx applies the theme before hydration
// (storage -> system preference -> light) so there is no light flash.
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'dark-mode';
const LEGACY_KEY = 'darkMode';
const DARK_CLASS = 'dark';

function parseStored(raw: string | null): boolean | null {
  if (raw === 'true' || raw === 'dark') return true;
  if (raw === 'false' || raw === 'light') return false;
  return null;
}

function readStored(): boolean | null {
  if (typeof window === 'undefined') return null;
  return parseStored(window.localStorage.getItem(STORAGE_KEY))
    ?? parseStored(window.localStorage.getItem(LEGACY_KEY));
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(isDark: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle(DARK_CLASS, isDark);
}

export function useTheme() {
  // Initial value mirrors the inline pre-hydration script to avoid mismatch.
  const [isDark, setIsDark] = useState(() => readStored() ?? systemPrefersDark());

  useEffect(() => {
    const stored = readStored();
    const initial = stored ?? systemPrefersDark();
    setIsDark(initial);
    applyTheme(initial);
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      applyTheme(next);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, String(next));
        window.localStorage.removeItem(LEGACY_KEY);
      }
      return next;
    });
  };

  return { isDark, toggle };
}
