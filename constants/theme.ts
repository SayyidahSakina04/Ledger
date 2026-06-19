// Design tokens for the app. Atoms read these via the theme Context (useTheme),
// never hard-coded hex values — so one change here re-themes everything.

export const lightColors = {
  background: '#FFFFFF',
  card: '#F4F5F7',
  text: '#11181C',
  textMuted: '#687076',
  border: '#E1E3E6',
  primary: '#2F6FED',
  onPrimary: '#FFFFFF',
  danger: '#E5484D',
  success: '#30A46C',
};

// Must have the SAME keys as lightColors — the type below enforces that.
export const darkColors: ThemeColors = {
  background: '#0E1112',
  card: '#1A1D1E',
  text: '#ECEDEE',
  textMuted: '#9BA1A6',
  border: '#2A2E30',
  primary: '#5B8DEF',
  onPrimary: '#0E1112',
  danger: '#FF6369',
  success: '#3DD68C',
};

// The shape of a color palette, derived from the light one. If dark is missing
// a key (or adds an extra one), TypeScript errors — no drift between themes.
export type ThemeColors = typeof lightColors;

// Spacing & radius scales so padding/margins are consistent, not random numbers.
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius = { sm: 6, md: 10, lg: 16, full: 999 } as const;
