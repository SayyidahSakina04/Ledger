import { Stack } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/Themed';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { spacing } from '@/constants/theme';
import { useTheme, type ThemeMode } from '@/context/ThemeContext';

const MODES: ThemeMode[] = ['light', 'dark', 'system'];
const label = (m: ThemeMode) => m.charAt(0).toUpperCase() + m.slice(1);

// The real theme toggle. Tapping a mode updates the ThemeContext, which re-themes
// the whole app immediately (Step 1 "done when").
export default function AppearanceScreen() {
  const { mode, setMode } = useTheme();

  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Appearance' }} />
      <Text
        style={{ fontSize: 18, fontWeight: '600', marginBottom: spacing.md }}
      >
        Theme
      </Text>
      <View style={{ gap: spacing.sm }}>
        {MODES.map((m) => (
          <Button
            key={m}
            title={label(m)}
            variant={mode === m ? 'primary' : 'secondary'}
            onPress={() => setMode(m)}
          />
        ))}
      </View>
    </ScreenLayout>
  );
}
