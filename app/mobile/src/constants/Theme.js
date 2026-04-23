import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Main System Colors (Synced with Web)
  primary: '#8b5cf6',
  primaryHover: '#7c3aed',
  mainTitle: '#8b5cf6',
  mainTitleDark: '#6d28d9',
  mainTitleText: '#ffffff',
  
  // Text Colors
  text: '#2c3e50',
  textSecondary: '#636e72',
  textLight: '#94a3b8',
  
  // Background Colors
  background: '#f8f9fa',
  background2: '#ffffff',
  bgLight: '#f9f9f9',
  
  // UI Element Colors
  buttonBackground: '#ba1a56',
  buttonText: 'white',
  inputBorder: '#eff2f5',
  checked: '#ba1a56',
  checkoutButton: '#ba1a56',
  
  // Status Colors
  danger: '#ff4d4f',
  success: '#52c41a',
  warning: '#faad14',
  info: '#1890ff',
  
  // Palette
  lightPink: '#fce4ec',
  secondary: '#f9c2d6',
  gray: '#999999',
  border: '#eff2f5',
};

export const SIZES = {
  h1: 24,
  h2: 20,
  h3: 18,
  h4: 16,
  h5: 14,
  h6: 12,
  padding: 16,
  paddingSide: 20,
  buttonHeight: 56,
  buttonRadius: 12,
  radiusSm: 4,
  radiusMd: 8,
  radiusLg: 12,
  width,
  height,
  isSmallDevice: width < 375
};

export const FONTS = {
  interRegular: 'System',
  interBold: 'System',
  interMedium: 'System',
  main: 'System',
};

export const SHADOWS = {
    light: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
    },
    heavy: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 10,
    }
};
