import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/Theme';

/**
 * Reusable Button Component
 * Consolidates all button styles for consistency
 */
export const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'text'
  size = 'medium', // 'small' | 'medium' | 'large'
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  ...props
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const buttonTextStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? Colors.textPrimary : Colors.primary} 
          size="small" 
        />
      ) : (
        <Text style={buttonTextStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 30, // Corner radius 30 from Figma
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    // Combined shadow effect (using the more prominent shadow as primary)
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(9, 11, 11, 0.2)', // Second shadow (more prominent) - UIColor(red: 0.037, green: 0.042, blue: 0.042, alpha: 0.2)
        shadowOffset: { width: 2, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 14.1,
      },
      android: {
        elevation: 8, // Approximate shadow for Android
      },
    }),
  },
  
  // Variants
  primary: {
    backgroundColor: 'rgba(255, 176, 102, 1)', // UIColor(red: 1, green: 0.69, blue: 0.4, alpha: 1)
  },
  secondary: {
    backgroundColor: Colors.buttonSecondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  text: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  small: {
    height: 36,
    paddingHorizontal: Spacing.md,
  },
  medium: {
    height: 54, // Button height from Figma
    paddingHorizontal: Spacing.lg,
  },
  large: {
    height: 60,
    paddingHorizontal: Spacing.xl,
  },
  
  // Text styles for variants
  primaryText: {
    color: Colors.buttonTextDark, // Dark text for buttons
    fontFamily: Typography.fontSecondary, // RedHatText_400Regular
    fontWeight: '800', // Semi-bold weight (between Regular and Bold)
    fontSize: 16, // Font size 16 from Figma
    lineHeight: 21.17, // Line height 21.17 from Figma
    textAlign: 'center', // Center alignment
  },
  secondaryText: {
    color: Colors.buttonTextDark, // Same dark text as primary buttons
    fontFamily: Typography.fontSecondary, // RedHatText_400Regular
    fontWeight: '800', // Semi-bold weight (between Regular and Bold)
    fontSize: 16, // Font size 16 from Figma
    lineHeight: 21.17, // Line height 21.17 from Figma
    textAlign: 'center', // Center alignment
  },
  outlineText: {
    color: Colors.textPrimary,
    fontFamily: Typography.fontBold,
  },
  textText: {
    color: Colors.primary,
    fontFamily: Typography.fontBold,
  },
  
  // Text styles for sizes
  smallText: {
    fontSize: Typography.small,
  },
  mediumText: {
    // Font size already set in primaryText (16), so no override needed
    fontSize: 16,
  },
  largeText: {
    fontSize: Typography.h4,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
  
  // Layout
  fullWidth: {
    width: 335, // Button width from Figma
  },
  
  text: {
    // Base text style
  },
});

