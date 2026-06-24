import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/atoms/Button';
import { Brand } from '@/components/molecules/Brand';
import { ControlledField } from '@/components/molecules/ControlledField';
import { Text } from '@/components/Themed';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { spacing } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { useTheme } from '@/context/ThemeContext';

const resetSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});
type ResetForm = z.infer<typeof resetSchema>;

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const { resetPassword } = useSession();
  const [sent, setSent] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await resetPassword(values.email);
      setSent(true);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Could not send reset email';
      setError('root', { message });
    }
  });

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <View style={styles.center}>
          <Brand />

          <View style={styles.form}>
            {sent ? (
              <Text style={{ textAlign: 'center' }}>
                If an account exists for that email, a reset link is on its way.
                Check your inbox.
              </Text>
            ) : (
              <>
                <Text style={{ textAlign: 'center', color: colors.textMuted }}>
                  Enter your email and we&apos;ll send a reset link.
                </Text>
                <ControlledField
                  control={control}
                  name="email"
                  label="Email"
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                />
                {errors.root ? (
                  <Text style={{ color: colors.danger }}>
                    {errors.root.message}
                  </Text>
                ) : null}
                <Button
                  title="Send reset link"
                  onPress={onSubmit}
                  loading={isSubmitting}
                />
              </>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Link href="/login" asChild>
            <Text style={[styles.link, { color: colors.primary }]}>
              Back to log in
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
