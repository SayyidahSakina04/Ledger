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

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type SignupForm = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const { colors } = useTheme();
  const { signUp } = useSession();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signUp(values.email, values.password, values.name);
      // With email confirmation off, this signs us in and the guard redirects.
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not sign up';
      setError('root', { message });
    }
  });

  return (
    <ScreenLayout>
      <View style={{ gap: spacing.md }}>
        <Text style={{ fontSize: 28, fontWeight: '700' }}>Sign up</Text>

        <ControlledField
          control={control}
          name="name"
          label="Name"
          placeholder="Jane Doe"
          autoCapitalize="words"
        />
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

        <Button
          title="Create account"
          onPress={onSubmit}
          loading={isSubmitting}
        />

        <Link href="/login" asChild>
          <Text style={{ fontWeight: '600' }}>← Back to log in</Text>
        </Link>
      </View>
    </ScreenLayout>
  );
}
