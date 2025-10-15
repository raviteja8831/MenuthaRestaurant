import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../api/axiosService';
import { AlertService } from '../contexts/AlertContext';

export const AUTH_KEYS = {
  TOKEN: 'auth_token',
  USER_PROFILE: 'user_profile',
  USER_TYPE: 'user_type', // 'customer' or 'restaurant'
};

export const USER_TYPES = {
  CUSTOMER: 'customer',
  MANAGER: 'manager',
  CHEF: 'chef',

};

/**
 * Get stored authentication token
 */
export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem(AUTH_KEYS.TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Get stored user profile
 */
export const getUserProfile = async () => {
  try {
    const profile = await AsyncStorage.getItem(AUTH_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Get stored user type
 */
export const getUserType = async () => {
  try {
    return await AsyncStorage.getItem(AUTH_KEYS.USER_TYPE);
  } catch (error) {
    console.error('Error getting user type:', error);
    return null;
  }
};

/**
 * Store authentication data
 */
export const storeAuthData = async (token, userProfile, userType) => {
  try {
    await AsyncStorage.multiSet([
      [AUTH_KEYS.TOKEN, token],
      [AUTH_KEYS.USER_PROFILE, JSON.stringify(userProfile)],
      [AUTH_KEYS.USER_TYPE, userType],
    ]);

    // Set token in axios default headers
    setAuthToken(token);

    return true;
  } catch (error) {
    console.error('Error storing auth data:', error);
    return false;
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([
      AUTH_KEYS.TOKEN,
      AUTH_KEYS.USER_PROFILE,
      AUTH_KEYS.USER_TYPE,
    ]);

    // Remove token from axios headers
    setAuthToken(null);

    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  try {
    const token = await getAuthToken();
    const userProfile = await getUserProfile();
    const userType = await getUserType();

    return !!(token && userProfile && userType);
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Initialize auth state on app start
 */
export const initializeAuth = async () => {
  try {
    const token = await getAuthToken();
    if (token) {
      // Validate token before setting it in axios headers
      const isTokenValid = await validateAndRefreshToken(false); // Don't show alert during initialization
      if (isTokenValid) {
        setAuthToken(token);
        return token;
      } else {
        // Token is invalid/expired, clear it
        await clearAuthData();
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error initializing auth:', error);
    // Clear any potentially corrupted auth data
    await clearAuthData();
    return null;
  }
};

/**
 * Validate token and refresh if needed
 */
export const validateAndRefreshToken = async (showAlert = true) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.log('validateAndRefreshToken: no token found');
      return false;
    }
    // Try to decode JWT payload in a safe way (atob is not available in React Native
    // and would throw). We'll attempt to use Buffer if available, otherwise skip
    // decoding and assume the token is valid (so app doesn't crash on startup).
    let payload = null;
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const base64Url = parts[1];
        // Convert from base64url to base64
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        let decoded = null;
        // Prefer Buffer (Node polyfill) if present
        if (typeof Buffer !== 'undefined' && Buffer.from) {
          decoded = Buffer.from(base64, 'base64').toString('utf8');
        } else if (typeof globalThis.atob === 'function') {
          // If atob is polyfilled somewhere, use it
          decoded = globalThis.atob(base64);
        }

        if (decoded) {
          payload = JSON.parse(decoded);
        }
      }
    } catch (e) {
      console.warn('Token payload decode failed, skipping expiry check', e);
      payload = null;
    }

  const currentTime = Date.now() / 1000;
  console.log('validateAndRefreshToken: token payload decoded:', payload);

    // If we could decode the payload, check expiry. If not, assume token is valid
    // to avoid crashing the app during startup. Server calls will still fail for
    // invalid/expired tokens and handle it appropriately.
    if (payload && payload.exp && payload.exp < currentTime + 300) {
      console.log('Token expired or expiring soon');

      // Clear auth data first
      await clearAuthData();

      // Show user-friendly alert message if requested
      if (showAlert) {
        AlertService.error(
          "Your session has expired. Please login again to continue.",
          "Session Expired"
        );
        await logout();
      }

      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating token:', error);

    // Clear auth data first
    await clearAuthData();

    // Show error alert for invalid token if requested
    if (showAlert) {
      AlertService.error(
        "Your session is invalid. Please login again.",
        "Authentication Error"
      );
      await logout();
    }

    return false;
  }
};

/**
 * Logout user and redirect to appropriate login screen
 */
export const logout = async () => {
  try {
    const userType = await getUserType();

    // Clear auth data
    await clearAuthData();

    // Import router dynamically to avoid circular dependency
    const { router } = await import('expo-router');

    // Redirect to appropriate login screen based on user type
    if (userType === USER_TYPES.CUSTOMER) {
      router.replace('/Customer-Login');
    } else if (userType === USER_TYPES.MANAGER || userType === USER_TYPES.CHEF) {
      router.replace('/login');
    } else {
      // Default to manager/chef login page
      router.replace('/login');
    }

    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    return false;
  }
};