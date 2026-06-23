import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import 'react-native-reanimated';

import { NotificationsProvider } from '@/context/NotificationsContext';
import { SessionProvider } from '@/context/SessionContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { useNotificationTapHandler } from '@/hooks/useNotificationTapHandler';
import { queryClient } from '@/lib/queryClient';
import { store } from '@/store';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// How a notification behaves when it arrives while the app is FOREGROUNDED.
// (When backgrounded, the OS shows it; this handler only governs the open app.)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // show the slide-down banner
    shouldShowList: true, // and keep it in the notification center
  }),
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // The three state layers (Context / Redux / React Query) + safe area, wrapped once around the whole navigation tree.
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NotificationsProvider>
          <ReduxProvider store={store}>
            <QueryClientProvider client={queryClient}>
              <SessionProvider>
                <RootLayoutNav />
              </SessionProvider>
            </QueryClientProvider>
          </ReduxProvider>
        </NotificationsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  // Drive React Navigation's theme from our context so headers/tab bars match.
  const { isDark } = useTheme();

  // Send the user to the right screen when they tap a notification.
  useNotificationTapHandler();

  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="transaction/[id]" />
        <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
      </Stack>
    </NavThemeProvider>
  );
}
