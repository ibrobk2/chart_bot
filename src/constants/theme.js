// Theme and color constants
export const COLORS = {
  // Main palette
  primary: '#6366F1',          // Indigo
  secondary: '#10B981',        // Emerald
  accent: '#F59E0B',           // Amber

  // Signal colors
  buy: '#22C55E',              // Green
  sell: '#EF4444',             // Red
  hold: '#F59E0B',             // Amber

  // Confidence
  highConfidence: '#22C55E',
  mediumConfidence: '#F59E0B',
  lowConfidence: '#EF4444',

  // Dark theme
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#475569',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  padding: 16,
  radius: 12,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};
