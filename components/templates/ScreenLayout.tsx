import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type ScreenLayoutProps = {
  children: ReactNode;
  padded?: boolean;
  edges?: readonly ('top' | 'right' | 'bottom' | 'left')[];
};

// Template: the standard screen frame — safe-area insets + themed background.
// Screens (pages) fill it with real content.
export function ScreenLayout({
  children,
  padded = true,
  edges = ['top', 'bottom'],
}: ScreenLayoutProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={edges}
    >
      <View style={[styles.content, padded && { padding: spacing.lg }]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1 },
});
