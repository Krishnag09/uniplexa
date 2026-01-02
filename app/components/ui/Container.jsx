import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, ContainerSizes } from '@/constants/Theme';

/**
 * Reusable Container Component
 * For consistent container styling
 */
export const Container = ({
  children,
  width,
  height,
  centered = false,
  style,
  ...props
}) => {
  const containerStyle = [
    styles.container,
    width && { width },
    height && { height },
    centered && styles.centered,
    style,
  ];

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Base container styles
  },
  centered: {
    alignSelf: 'center',
    position: 'absolute',
    top: '50%',
  },
});

// Predefined container sizes
export const LoginContainer = ({ children, style, ...props }) => (
  <Container
    width={ContainerSizes.loginContainer.width}
    height={ContainerSizes.loginContainer.height}
    centered
    style={[{ marginTop: -ContainerSizes.loginContainer.height / 2 }, style]}
    {...props}
  >
    {children}
  </Container>
);

