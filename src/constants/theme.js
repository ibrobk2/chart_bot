// Theme and color constants
export const COLORS = {
  // Main palette (Universal)
  primary: '#6366F1',          // Indigo
  secondary: '#10B981',        // Emerald
  accent: '#F59E0B',           // Amber

  // Signal colors
  buy: '#22C55E',              // Green
  sell: '#EF4444',             // Red
  hold: '#F59E0B',             // Amber

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const LIGHT_THEME = {
  ...COLORS,
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  cardBackground: '#FFFFFF',
};

export const DARK_THEME = {
  ...COLORS,
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#475569',
  cardBackground: '#1E293B',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};



