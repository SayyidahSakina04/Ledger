import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

// Loading spinner that defaults to the theme's primary color.
export function Spinner(props: ActivityIndicatorProps) {
  const { colors } = useTheme();
  return <ActivityIndicator color={colors.primary} {...props} />;
}
