// Polyfills web URL APIs that supabase-js needs but React Native lacks.
// Must be imported BEFORE createClient runs.
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Fail loudly at startup if the .env values are missing, instead of
// getting confusing "fetch failed" errors deep in the app later.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env and fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist the logged-in session on the device so the user stays signed in.
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // No URL-based session detection in a native app (that's a web/OAuth concern).
    detectSessionInUrl: false,
  },
});

// Refresh the auth token only while the app is in the foreground.
// Supabase recommends this so tokens don't silently expire/refresh in the background.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
