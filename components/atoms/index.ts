// Atoms barrel. Import any primitive from one place:
//   import { Button, Input, Text, View } from '@/components/atoms';
// Text/View are the themed primitives reused from components/Themed.tsx
// (not duplicated here) so there is a single source for each.
export {
  Text,
  View,
  type TextProps,
  type ViewProps,
} from '@/components/Themed';
export { Button, type ButtonProps } from './Button';
export { Input, type InputProps } from './Input';
export { Spinner } from './Spinner';
