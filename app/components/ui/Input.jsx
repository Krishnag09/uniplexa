import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/Theme';

/**
 * Reusable Input Component
 * Consolidates all input field styles for consistency
 */
export const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  disabled = false,
  style,
  inputStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          disabled && styles.inputDisabled,
          inputStyle,
        ]}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        editable={!disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: Typography.small,
    fontFamily: Typography.fontSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    height: 49,
    width: '100%', // Use 100% so it respects parent width
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // UIColor(red: 0, green: 0, blue: 0, alpha: 0.2)
    borderWidth: 1,
    borderColor: 'rgba(41, 51, 50, 1)', // UIColor(red: 0.161, green: 0.2, blue: 0.196, alpha: 1)
    borderRadius: 30, // Corner radius 30
    paddingHorizontal: 16,
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontFamily: Typography.fontSecondary,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  inputDisabled: {
    opacity: 0.5,
  },
  errorText: {
    color: '#FF4444',
    fontSize: Typography.tiny,
    marginTop: Spacing.xs,
    fontFamily: Typography.fontSecondary,
  },
});

