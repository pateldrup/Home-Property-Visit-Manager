import { Colors } from './Colors';

export const theme = {
  colors: Colors,
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    s: 4,
    m: 8,
    l: 16,
    xl: 24,
    round: 9999,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  typography: {
    h1: { fontSize: 28, fontWeight: '700', color: Colors.text },
    h2: { fontSize: 24, fontWeight: '700', color: Colors.text },
    h3: { fontSize: 20, fontWeight: '600', color: Colors.text },
    h4: { fontSize: 18, fontWeight: '600', color: Colors.text },
    body1: { fontSize: 16, fontWeight: '400', color: Colors.text },
    body2: { fontSize: 14, fontWeight: '400', color: Colors.textSecondary },
    caption: { fontSize: 12, fontWeight: '400', color: Colors.textSecondary },
  },
};
