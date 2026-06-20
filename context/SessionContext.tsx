import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { log } from '@/lib/logger';
import { queryClient } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';

const SCOPE = 'auth';

type SessionContextValue = {
  // The Supabase session, or null when logged out.
  session: Session | null;
  // True until we've checked for a saved session on launch.
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Restore any saved session once on launch.
    supabase.auth.getSession().then(({ data }) => {
      log.info(SCOPE, 'restored session on launch', {
        hasSession: Boolean(data.session),
      });
      setSession(data.session);
      setIsLoading(false);
    });

    // 2. Keep our state in sync with every later auth change
    //    (sign-in, sign-out, token refresh).
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      log.info(SCOPE, 'auth state change', {
        event,
        hasSession: Boolean(next),
      });
      setSession(next);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      isLoading,
      signIn: async (email, password) => {
        log.info(SCOPE, 'signIn attempt', { email });
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          log.warn(SCOPE, 'signIn failed', error.message);
          throw new Error(error.message);
        }
      },
      signUp: async (email, password, name) => {
        log.info(SCOPE, 'signUp attempt', { email });
        // `name` is stashed in user metadata; the DB trigger copies it into
        // the profiles row on signup (raw_user_meta_data ->> 'name').
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) {
          log.warn(SCOPE, 'signUp failed', error.message);
          throw new Error(error.message);
        }
      },
      signOut: async () => {
        log.info(SCOPE, 'signOut');
        await supabase.auth.signOut();
        // Drop all cached server data so the next user starts clean.
        queryClient.clear();
      },
      resetPassword: async (email) => {
        log.info(SCOPE, 'resetPassword', { email });
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
          log.warn(SCOPE, 'resetPassword failed', error.message);
          throw new Error(error.message);
        }
      },
    }),
    [session, isLoading],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used inside a SessionProvider');
  }
  return ctx;
}
