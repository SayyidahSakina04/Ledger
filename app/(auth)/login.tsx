import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/atoms/Button';
import { Brand } from '@/components/molecules/Brand';
import { ControlledField } from '@/components/molecules/ControlledField';
import { Text } from '@/components/Themed';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useSession } from '@/context/SessionContext';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { colors } = useTheme();
  const { signIn } = useSession();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn(values.email, values.password);
      // On success the session changes and the (auth) guard redirects us in.
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not sign in';
      setError('root', { message });
    }
  });

  return (
    <ScreenLayout>
      <View style={styles.container}>
        {/* Brand + form sit as one centered block. */}
        <View style={styles.center}>
          <Brand />

          <View style={styles.form}>
            <ControlledField
              control={control}
              name="email"
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />
            <ControlledField
              control={control}
              name="password"
              label="Password"
              placeholder="••••••••"
              secureTextEntry
            />

            {errors.root ? (
              <Text style={{ color: colors.danger }}>
                {errors.root.message}
              </Text>
            ) : null}

            <Button title="Log in" onPress={onSubmit} loading={isSubmitting} />

            <Link href="/forgot-password" asChild>
              <Text style={[styles.link, { color: colors.primary }]}>
                Forgot password?
              </Text>
            </Link>
          </View>
        </View>

        {/* Sign-up prompt pinned to the bottom. */}
        <View style={styles.footer}>
          <Text style={{ color: colors.textMuted }}>New here?</Text>
          <Link href="/signup" asChild>
            <Text style={[styles.link, { color: colors.primary }]}>
              Create an account
            </Text>
          </Link>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', gap: spacing.xl },
  form: { gap: spacing.md },
  link: { textAlign: 'center', fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
});
