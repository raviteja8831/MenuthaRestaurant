import { router } from 'expo-router';
import { isAuthenticated, getUserType, USER_TYPES } from '../services/authService';

/**
 * Safe navigation helper that prevents navigation to login when authenticated
 */
export const safeNavigate = async (route, options = {}) => {
  try {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      // Not authenticated - allow any navigation
      if (options.replace) {
        router.replace(route);
      } else {
        router.push(route);
      }
      return;
    }

    // User is authenticated - check if trying to navigate to login
    const loginRoutes = [
      '/Customer-Login',
      '/customer-login',
      '/login',
      '/chef-login',
    ];

    const isNavigatingToLogin = loginRoutes.some(loginRoute =>
      route.toLowerCase().includes(loginRoute.toLowerCase())
    );

    if (isNavigatingToLogin) {
      // Prevent navigation to login, redirect to appropriate home instead
      const userType = await getUserType();
      const homeRoute = getHomeRouteForUserType(userType);

      console.log('safeNavigate: Preventing navigation to login, redirecting to home:', homeRoute);

      if (options.replace) {
        router.replace(homeRoute);
      } else {
        router.push(homeRoute);
      }
    } else {
      // Normal navigation
      if (options.replace) {
        router.replace(route);
      } else {
        router.push(route);
      }
    }
  } catch (error) {
    console.error('safeNavigate: Error during navigation:', error);
    // On error, attempt normal navigation
    if (options.replace) {
      router.replace(route);
    } else {
      router.push(route);
    }
  }
};

/**
 * Safe back navigation that respects authentication state
 */
export const safeGoBack = async () => {
  try {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      // Not authenticated - allow default back
      if (router.canGoBack && router.canGoBack()) {
        router.back();
      }
      return;
    }

    // Authenticated - go back or redirect to home if no history
    if (router.canGoBack && router.canGoBack()) {
      router.back();
    } else {
      const userType = await getUserType();
      const homeRoute = getHomeRouteForUserType(userType);
      router.replace(homeRoute);
    }
  } catch (error) {
    console.error('safeGoBack: Error during back navigation:', error);
    if (router.canGoBack && router.canGoBack()) {
      router.back();
    }
  }
};

/**
 * Get home route based on user type
 */
export const getHomeRouteForUserType = (userType) => {
  const homeRoutes = {
    [USER_TYPES.CUSTOMER]: '/customer-home',
    [USER_TYPES.MANAGER]: '/dashboard',
    [USER_TYPES.CHEF]: '/chef-home',
  };

  return homeRoutes[userType] || '/customer-home'; // Default to customer home
};

/**
 * Check if current route is a login route
 */
export const isLoginRoute = (pathname) => {
  const loginRoutes = [
    '/Customer-Login',
    '/customer-login',
    '/login',
    '/chef-login',
  ];

  return loginRoutes.some(route =>
    pathname.toLowerCase().includes(route.toLowerCase())
  );
};

/**
 * Check if current route is a home route
 */
export const isHomeRoute = (pathname, userType) => {
  const homeRoute = getHomeRouteForUserType(userType);
  return pathname === homeRoute;
};
