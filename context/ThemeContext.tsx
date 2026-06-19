import { createContext, useContext, useMemo, useState, type ReactNode, } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ThemeColors } from '@/constants/theme';

// What the user can choose. 'system' follows the device setting.
export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  mode: ThemeMode; // the user's choice
  setMode: (mode: ThemeMode) => void; // change it (Settings screen calls this)
  colors: ThemeColors; // the resolved palette to render with
  isDark: boolean; // convenience flag
};

// undefined default lets useTheme() detect "used outside the provider".
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null (the OS setting)
  const [mode, setMode] = useState<ThemeMode>('system');

  // Resolve the choice to a concrete light/dark. Only consult the OS for 'system'.
  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  // Memoise so consumers only re-render when the resolved theme actually changes.
  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode,
      colors: isDark ? darkColors : lightColors,
      isDark,
    }),
    [mode, isDark],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// The hook every component uses to read theme colors.
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside a ThemeProvider');
  }
  return ctx;
}
