import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/atoms/Button';
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
      <View style={{ gap: spacing.md }}>
        <Text style={{ fontSize: 28, fontWeight: '700' }}>Log in</Text>

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
          <Text style={{ color: colors.danger }}>{errors.root.message}</Text>
        ) : null}

        <Button title="Log in" onPress={onSubmit} loading={isSubmitting} />

        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          <Text>New here?</Text>
          <Link href="/signup" asChild>
            <Text style={{ fontWeight: '600' }}>Create an account</Text>
          </Link>
        </View>
        <Link href="/forgot-password" asChild>
          <Text style={{ fontWeight: '600' }}>Forgot password?</Text>
        </Link>
      </View>
    </ScreenLayout>
  );
}
