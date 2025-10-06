import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  isAuthenticated,
  getUserType,
  validateAndRefreshToken,
  USER_TYPES,
  initializeAuth
} from '../services/authService';

/**
 * SessionGuard component to protect routes based on authentication and user type
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected content
 * @param {string} props.requiredUserType - Required user type ('customer' or 'restaurant')
 * @param {boolean} props.requireAuth - Whether authentication is required (default: true)
 */
export default function SessionGuard({
  children,
  requiredUserType = null,
  requireAuth = true
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      setIsLoading(true);

      // Initialize auth on app start
      await initializeAuth();

      // If authentication is not required, just show the content
      if (!requireAuth) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // Check if user is authenticated
      const authenticated = await isAuthenticated();

      if (!authenticated) {
        // Not authenticated, redirect to login
        redirectToLogin();
        return;
      }

      // Validate and refresh token if needed
      const tokenValid = await validateAndRefreshToken();

      if (!tokenValid) {
        // Token invalid, redirect to login
        redirectToLogin();
        return;
      }

      // If specific user type is required, check it
      if (requiredUserType) {
        const userType = await getUserType();

        if (userType !== requiredUserType) {
          // Wrong user type, redirect to appropriate login
          redirectToLogin(userType);
          return;
        }
      }

      // All checks passed
      setIsAuthorized(true);
    } catch (error) {
      console.error('Error in session guard:', error);
      redirectToLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToLogin = async (currentUserType = null) => {
    const userType = currentUserType || await getUserType();

    if (requiredUserType === USER_TYPES.CUSTOMER || userType === USER_TYPES.CUSTOMER) {
      router.replace('/Customer-Login');
    } else if (requiredUserType === USER_TYPES.RESTAURANT || userType === USER_TYPES.RESTAURANT) {
      router.replace('/chef-login');
    } else {
      // Default to customer login for unknown cases
      router.replace('/Customer-Login');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  if (!isAuthorized) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Text style={styles.unauthorizedText}>Redirecting to login...</Text>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  unauthorizedText: {
    fontSize: 16,
    color: '#666',
  },
});