import { Platform } from 'react-native';

const serif = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, serif',
});

const sans = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const Typography = {
  fontFamily: {
    serif,
    sans,
  },

  // Display
  displayLarge: {
    fontFamily: serif,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  displayMedium: {
    fontFamily: serif,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 32,
  },

  // Headings
  h1: { fontFamily: serif, fontSize: 24, fontWeight: '700', lineHeight: 30 },
  h2: { fontFamily: serif, fontSize: 20, fontWeight: '600', lineHeight: 26 },
  h3: { fontFamily: sans, fontSize: 17, fontWeight: '600', lineHeight: 22 },
  h4: { fontFamily: sans, fontSize: 15, fontWeight: '600', lineHeight: 20 },

  // Body
  bodyLarge: { fontFamily: sans, fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body: { fontFamily: sans, fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodySmall: { fontFamily: sans, fontSize: 12, fontWeight: '400', lineHeight: 18 },

  // Labels
  label: { fontFamily: sans, fontSize: 13, fontWeight: '500', letterSpacing: 0.2 },
  labelSmall: { fontFamily: sans, fontSize: 11, fontWeight: '500', letterSpacing: 0.4, textTransform: 'uppercase' },

  // Caption
  caption: { fontFamily: sans, fontSize: 12, fontWeight: '400', lineHeight: 16, letterSpacing: 0.1 },
};
