import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/Theme';

const { width, height } = Dimensions.get('window');

/**
 * Decorative background pattern with large partial circles
 * Much larger than screen, crossing each other, avoiding form area
 */
export const BackgroundPattern = () => {
  // Form area is centered, 335px wide
  const formCenterX = width / 2;
  const formCenterY = height / 2;
  const formWidth = 335;
  const formPadding = 50; // Extra padding to avoid form area
  
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Large circle from top-left, crossing screen but avoiding center */}
      <View style={[styles.circle, styles.circle1]} />
      
      {/* Large circle from top-right, crossing screen */}
      <View style={[styles.circle, styles.circle2]} />
      
      {/* Large circle from bottom-left, crossing screen */}
      <View style={[styles.circle, styles.circle3]} />
      
      {/* Large circle from bottom-right, crossing screen */}
      <View style={[styles.circle, styles.circle4]} />
      
      {/* Large circle from left side, crossing screen */}
      <View style={[styles.circle, styles.circle5]} />
      
      {/* Large circle from right side, crossing screen */}
      <View style={[styles.circle, styles.circle6]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.primary, // Orange theme color
    opacity: 0.12, // Subtle appearance
  },
  // Very large circle from top-left corner, extends beyond screen
  circle1: {
    width: 600,
    height: 600,
    borderRadius: 300,
    top: -200,
    left: -150,
    // Show only bottom-right arc (avoiding center form area)
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  // Very large circle from top-right corner
  circle2: {
    width: 550,
    height: 550,
    borderRadius: 275,
    top: -180,
    right: -120,
    // Show only bottom-left arc
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  // Very large circle from bottom-left corner
  circle3: {
    width: 650,
    height: 650,
    borderRadius: 325,
    bottom: -250,
    left: -200,
    // Show only top-right arc
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  // Very large circle from bottom-right corner
  circle4: {
    width: 580,
    height: 580,
    borderRadius: 290,
    bottom: -220,
    right: -150,
    // Show only top-left arc
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  // Very large circle from left side, crossing vertically
  circle5: {
    width: 700,
    height: 700,
    borderRadius: 350,
    top: height * 0.5 - 350, // Center vertically
    left: -300,
    // Show only right side arc (avoiding center form)
    borderRightWidth: 2,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  // Very large circle from right side, crossing vertically
  circle6: {
    width: 620,
    height: 620,
    borderRadius: 310,
    top: height * 0.5 - 310, // Center vertically
    right: -250,
    // Show only left side arc
    borderLeftWidth: 2,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
});

