/**
 * Themed primitives. These wrap React Native's Text/View and pull their
 * colors from our ThemeContext, so they follow the light/dark/system toggle.
 * Optional lightColor/darkColor props let a caller override per use.
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

import type { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

// Use a caller's override for the active scheme if given; otherwise the theme palette.
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ThemeColors,
) {
  const { colors, isDark } = useTheme();
  const override = isDark ? props.dark : props.light;
  return override ?? colors[colorName];
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background',
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
