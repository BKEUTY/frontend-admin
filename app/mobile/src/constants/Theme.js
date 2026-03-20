import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  background: '#f9f9f9',
  background2: '#ffffff',
  mainTitle: '#ba1a56',
  mainTitleDark: '#880e4f',
  mainTitleText: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  buttonBackground: '#ba1a56',
  buttonText: 'white',
  inputBorder: '#dddddd',
  checked: '#ba1a56',
  checkoutButton: '#ba1a56',
  lightPink: '#fce4ec',
  secondary: '#f9c2d6',
  gray: '#999999',
  danger: '#d32f2f',
  success: '#27ae60',
  warning: '#f1c40f'
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    }
};
