/**
 * Kittik Beauty — Red / White / Black color palette
 *
 * Semantic tokens used across the mobile app.
 * Import `AppColors` for brand-specific values.
 */

import { Platform } from 'react-native';

// ─── Brand palette ────────────────────────────────────────────────────────────
export const AppColors = {
  // Primary red
  primary:       '#DC2626',
  primaryDark:   '#991B1B',
  primaryDeep:   '#7F1D1D',
  primaryLight:  '#FEF2F2',
  primaryBorder: '#FECACA',

  // Accent
  accent:        '#EF4444',

  // Backgrounds
  background:    '#FFFFFF',
  surface:       '#F9FAFB',

  // Text
  textPrimary:   '#111827',
  textSecondary: '#6B7280',
  textMuted:     '#9CA3AF',

  // Borders / dividers
  border:        '#E5E7EB',

  // Pure tones
  black:         '#000000',
  white:         '#FFFFFF',

  // Semantic status (keep as-is — not part of brand rebrand)
  success:       '#16A34A',
  warning:       '#B45309',
  error:         '#DC2626',
  star:          '#F59E0B',
} as const;

// ─── Expo / system theme tokens ───────────────────────────────────────────────
const tintColorLight = AppColors.primary;   // Red for light mode
const tintColorDark  = AppColors.white;     // White for dark mode

export const Colors = {
  light: {
    text:            '#11181C',
    background:      '#fff',
    tint:            tintColorLight,
    icon:            '#687076',
    tabIconDefault:  '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text:            '#ECEDEE',
    background:      '#151718',
    tint:            tintColorDark,
    icon:            '#9BA1A6',
    tabIconDefault:  '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans:    'system-ui',
    serif:   'ui-serif',
    rounded: 'ui-rounded',
    mono:    'ui-monospace',
  },
  default: {
    sans:    'normal',
    serif:   'serif',
    rounded: 'normal',
    mono:    'monospace',
  },
  web: {
    sans:    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono:    "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
