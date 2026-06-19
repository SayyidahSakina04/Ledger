import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/atoms/Button';
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
      <View style={{ gap: spacing.md }}>
        <Text style={{ fontSize: 28, fontWeight: '700' }}>Reset password</Text>

        {sent ? (
          <Text>
            If an account exists for that email, a reset link is on its way.
            Check your inbox.
          </Text>
        ) : (
          <>
            <Text>Enter your email and we&apos;ll send a reset link.</Text>
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

        <Link href="/login" asChild>
          <Text style={{ fontWeight: '600' }}>← Back to log in</Text>
        </Link>
      </View>
    </ScreenLayout>
  );
}
