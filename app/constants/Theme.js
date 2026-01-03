// Design System Constants
// Consolidate all design tokens here for consistency

export const Colors = {
  // Background
  background: 'rgba(28, 32, 31, 1)', // Dark background
  backgroundLight: 'rgba(255, 255, 255, 1)',
  
  // Primary/Accent
  primary: 'rgba(255, 176, 102, 1)', // #FFB066 - Orange accent
  primaryDark: 'rgba(255, 150, 70, 1)',
  primaryLight: 'rgba(255, 200, 140, 1)',
  
  // Text
  textPrimary: 'rgba(255, 255, 255, 1)',
  textSecondary: 'rgba(170, 170, 170, 1)',
  textDark: 'rgba(60, 60, 107, 1)', // #3C3C6B
  buttonTextDark: 'rgba(24, 29, 27, 1)', // Dark text for buttons - UIColor(red: 0.094, green: 0.114, blue: 0.106, alpha: 1)
  
  // UI Elements
  border: 'rgba(255, 255, 255, 0.2)',
  borderLight: 'rgba(255, 255, 255, 1)',
  inputBorder: 'rgba(41, 51, 50, 1)', // Dark border for inputs
  inputBackground: 'rgba(0, 0, 0, 0.2)', // Semi-transparent black background
  
  // Buttons
  buttonPrimary: 'rgba(255, 176, 102, 1)',
  buttonSecondary: 'rgba(139, 144, 241, 1)', // #8B90F1
  buttonTeal: 'rgba(0, 180, 180, 1)', // Teal for register button
  buttonDisabled: 'rgba(128, 128, 128, 0.5)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Typography = {
  // Font Families
  fontPrimary: 'SpaceGrotesk-Medium', // TODO: Add this font
  fontSecondary: 'RedHatText_400Regular',
  fontBold: 'RedHatText_700Bold',
  
  // Font Sizes
  h1: 60,
  h2: 40,
  h3: 32,
  h4: 24,
  body: 16,
  small: 14,
  tiny: 12,
  
  // Line Heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.8,
};

export const BorderRadius = {
  sm: 5,
  md: 10,
  lg: 20,
  xl: 50, // Pill shape
  full: 9999,
};

export const ContainerSizes = {
  loginContainer: { width: 335, height: 279 },
  buttonHeight: 50,
  inputHeight: 50,
};

