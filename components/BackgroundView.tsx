import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function BackgroundView({ children, style }: { children: React.ReactNode, style?: any }) {
  return (
    <View style={[styles.container, style]}>
      
      {/* --- GEOMETRIC SHAPES (Made Darker & More Visible) --- */}
      
      {/* Top Right - Big Blue Circle */}
      <View style={styles.shapeCircleBig} />
      
      {/* Bottom Left - Medium Blue Circle */}
      <View style={styles.shapeCircleMedium} />
      
      {/* Center - Floating Diamond */}
      <View style={styles.shapeDiamond} />

      {/* Random Dots (Vivid Blue) */}
      <View style={[styles.dot, { top: 120, left: 40 }]} />
      <View style={[styles.dot, { top: 220, right: 60, backgroundColor: '#60a5fa' }]} />
      <View style={[styles.dot, { bottom: 180, left: '35%', width: 18, height: 18, opacity: 0.6 }]} />
      <View style={[styles.dot, { bottom: 80, right: 100, backgroundColor: '#2563eb' }]} />

      {/* --- SCHOOL ICONS (Watermarks - Darker Colors) --- */}
      
      {/* Top Left - School */}
      <View style={styles.iconSchool}>
        <MaterialIcons name="school" size={160} color="#93c5fd" />
      </View>

      {/* Top Right - Computer */}
      <View style={styles.iconComputer}>
        <MaterialIcons name="computer" size={100} color="#bfdbfe" />
      </View>

      {/* Bottom Right - Book */}
      <View style={styles.iconBook}>
        <MaterialIcons name="menu-book" size={130} color="#93c5fd" />
      </View>

      {/* Mid Left - Science */}
      <View style={styles.iconScience}>
        <MaterialIcons name="science" size={90} color="#bfdbfe" />
      </View>

      {/* Floating Pencil */}
      <View style={styles.iconPencil}>
        <MaterialIcons name="edit" size={80} color="#60a5fa" />
      </View>

      {/* --- CONTENT LAYER --- */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f2ff', // Base Light Blue
    position: 'relative',
    overflow: 'hidden', 
  },
  content: {
    flex: 1,
    zIndex: 10, 
  },
  
  /* --- SHAPES (Increased Opacity & Darker Colors) --- */
  shapeCircleBig: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#bfdbfe', // Blue-200 (Visible)
    opacity: 0.5, 
  },
  shapeCircleMedium: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: '#93c5fd', // Blue-300 (Darker)
    opacity: 0.4,
  },
  shapeDiamond: {
    position: 'absolute',
    top: height * 0.25,
    right: -20,
    width: 160,
    height: 160,
    backgroundColor: '#60a5fa', // Blue-400 (Strong)
    borderRadius: 25,
    transform: [{ rotate: '45deg' }],
    opacity: 0.15,
  },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6', // Vivid Blue
    opacity: 0.5,
  },

  /* --- ICONS (Darker Colors for Visibility) --- */
  iconSchool: {
    position: 'absolute',
    top: 80,
    left: -30,
    opacity: 0.2, // Increased Opacity
    transform: [{ rotate: '-15deg' }]
  },
  iconComputer: {
    position: 'absolute',
    top: 160,
    right: 10,
    opacity: 0.15,
    transform: [{ rotate: '15deg' }]
  },
  iconBook: {
    position: 'absolute',
    bottom: 120,
    right: -10,
    opacity: 0.2,
    transform: [{ rotate: '-10deg' }]
  },
  iconScience: {
    position: 'absolute',
    bottom: 280,
    left: 10,
    opacity: 0.15,
    transform: [{ rotate: '10deg' }]
  },
  iconPencil: {
    position: 'absolute',
    top: height * 0.5,
    right: '40%',
    opacity: 0.12,
    transform: [{ rotate: '45deg' }]
  }
});