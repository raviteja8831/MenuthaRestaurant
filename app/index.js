// // Temporary instrumentation: log app start to help debug splash hang
// console.log('APP INDEX: module loaded', new Date().toISOString());

// import LoginScreen from './../src/screens/LoginScreen';

// export default function IndexScreen() {
//   console.log('APP INDEX: rendering IndexScreen');
//   return <LoginScreen />;
// }
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  isAuthenticated,
  getUserType,
  validateAndRefreshToken,
  USER_TYPES,
  initializeAuth
} from '../src/services/authService';

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      setIsLoading(true);

      // Initialize auth on app start
      await initializeAuth();

      // Check if user is authenticated
      const authenticated = await isAuthenticated();

      if (!authenticated) {
        // Not authenticated, redirect to customer login as default
        router.replace('/Customer-Login');
        return;
      }

      // Validate and refresh token if needed
      const tokenValid = await validateAndRefreshToken();

      if (!tokenValid) {
        // Token invalid, redirect to customer login as default
        router.replace('/Customer-Login');
        return;
      }

      // Get user type and redirect to appropriate home screen
      const userType = await getUserType();

      if (userType === USER_TYPES.CUSTOMER) {
        router.replace('/customer-home');
      } else if (userType === USER_TYPES.RESTAURANT) {
        router.replace('/chef-home');
      } else {
        // Unknown user type, redirect to customer login
        router.replace('/Customer-Login');
      }
    } catch (error) {
      console.error('Error checking auth on app start:', error);
      router.replace('/Customer-Login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Redirecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#a6a6e7',
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});
