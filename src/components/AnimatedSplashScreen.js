import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
} from 'react-native';
import Constants from 'expo-constants';

// Determine which app is running based on expo config
const appName = Constants.expoConfig?.name || 'Menutha';
const isCustomerApp = appName === 'Menutha';

// Use appropriate logo and colors based on app type
const APP_LOGO = isCustomerApp
  ? require('../assets/menutha.png')
  : require('../assets/menuva.png');

const BACKGROUND_COLOR = isCustomerApp ? '#F5F3FF' : '#FFF5F3';

/**
 * Simple Splash Screen Component
 * Shows logo with clean background for Menutha (customer) or Menuva (restaurant)
 *
 * @param {function} onAnimationComplete - Callback when display time finishes
 */
const AnimatedSplashScreen = ({ onAnimationComplete }) => {
  useEffect(() => {
    // Auto-dismiss after 2 seconds
    const timeout = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: BACKGROUND_COLOR }]}>
      <Image
        source={APP_LOGO}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default AnimatedSplashScreen;
