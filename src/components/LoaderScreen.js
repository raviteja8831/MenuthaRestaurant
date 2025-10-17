import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

// Get app name from expo config to determine which logo to use
const appName = Constants.expoConfig?.name || 'Menutha';
const isCustomerApp = appName === 'Menutha';
const APP_LOGO = isCustomerApp
  ? require('../assets/menutha.png')
  : require('../assets/menuva.png');

/**
 * Animated Loader Component
 * Shows app logo with pulse and spinner animation
 * Automatically uses Menutha logo for customer app, Menuva logo for restaurant app
 *
 * @param {string} text - Loading text to display (optional)
 * @param {string} backgroundColor - Background color (default: '#BEBEBE')
 */
const LoaderScreen = ({
  text = 'Loading...',
  backgroundColor = '#a9a1e2'
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Spin animation for the circular spinner
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Logo with rounded purple background */}
      <View style={styles.logoContainer}>
        <View style={styles.logoWrapper}>
          <Image source={APP_LOGO} style={styles.logo} resizeMode="contain" />
        </View>
      </View>

      {/* Spinning Circle Loader */}
      <Animated.View style={[styles.spinnerWrapper, { transform: [{ rotate: spin }] }]}>
        <View style={styles.spinner} />
      </Animated.View>

      {/* Loading Text */}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: '#7b6eea',
    borderRadius: 30,
    padding: 30,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 180,
  },
  spinnerWrapper: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  spinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#E0E0E0',
    borderTopColor: '#4A90E2',
    borderRightColor: '#4A90E2',
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default LoaderScreen;
