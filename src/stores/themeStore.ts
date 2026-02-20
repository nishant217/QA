import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark-orange' | 'dark-teal' | 'light-orange';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  
  // Also update class for legacy compatibility
  if (theme === 'light-orange') {
    root.classList.add('light');
  } else {
    root.classList.remove('light');
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark-orange',

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      cycleTheme: () => {
        const themes: Theme[] = ['dark-orange', 'dark-teal', 'light-orange'];
        const currentIndex = themes.indexOf(get().theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        applyTheme(nextTheme);
        set({ theme: nextTheme });
      },
    }),
    {
      name: 'nyneos-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
        }
      },
    }
  )
);

// Initialize theme on mount
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('nyneos-theme');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.theme) {
        applyTheme(state.theme);
      }
    } catch {
      // Invalid stored theme
    }
  }
}
