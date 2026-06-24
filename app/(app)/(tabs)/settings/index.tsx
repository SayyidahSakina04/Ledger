import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Stack, type Href } from 'expo-router';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/Themed';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { radius, spacing } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { useTheme } from '@/context/ThemeContext';

type IconName = ComponentProps<typeof FontAwesome>['name'];

// One tappable settings row: coloured icon badge + label + chevron. Wrapped in a
// Link so the whole row navigates.
function SettingsRow({
  icon,
  label,
  href,
}: {
  icon: IconName;
  label: string;
  href: Href;
}) {
  const { colors } = useTheme();
  return (
    <Link href={href} asChild>
      <Pressable style={styles.row}>
        <View style={[styles.iconBadge, { backgroundColor: colors.primary }]}>
          <FontAwesome name={icon} size={15} color={colors.onPrimary} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
        <FontAwesome name="chevron-right" size={14} color={colors.textMuted} />
      </Pressable>
    </Link>
  );
}

// Settings home: a grouped card of preferences + logout (wired to the session).
export default function SettingsScreen() {
  const { colors } = useTheme();
  const { signOut } = useSession();

  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          Preferences
        </Text>
        <View
          style={[
            styles.group,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingsRow
            icon="paint-brush"
            label="Appearance"
            href="/settings/appearance"
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow
            icon="bell"
            label="Notifications"
            href="/settings/notifications"
          />
        </View>

        <View style={styles.spacer} />

        <Button title="Log out" variant="danger" onPress={signOut} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.sm },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
  },
  group: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 56 },
  spacer: { flex: 1 },
});
