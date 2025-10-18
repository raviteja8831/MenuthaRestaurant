import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { isAuthenticated, getUserType } from '../services/authService';
import { getHomeRouteForUserType, isLoginRoute, isHomeRoute } from '../utils/navigationHelper';

/**
 * Global back button handler for both hardware and app back buttons
 * Prevents navigation to login screens when user has an active session
 */
export default function BackButtonHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const backAction = async () => {
      try {
        // Check if user is authenticated
        const authenticated = await isAuthenticated();

        if (!authenticated) {
          // Not authenticated - allow default back behavior
          return false;
        }

        // User is authenticated - check current route and user type
        const userType = await getUserType();
        const userHomeRoute = getHomeRouteForUserType(userType);

        // Check if we're currently on a login page
        if (isLoginRoute(pathname)) {
          // Prevent going back from login to any other screen when authenticated
          // Redirect to appropriate home screen instead
          console.log('BackButtonHandler: Preventing back from login, redirecting to home');
          router.replace(userHomeRoute);
          return true; // Prevent default back action
        }

        // Check if we're on home screen
        if (isHomeRoute(pathname, userType)) {
          // On home screen - exit app on back press
          BackHandler.exitApp();
          return true; // Prevent default back action
        }

        // For all other screens, check if back navigation would go to login
        // We'll use router.canGoBack() to determine if there's navigation history
        if (router.canGoBack && router.canGoBack()) {
          // Allow normal back navigation for non-login screens
          return false;
        } else {
          // No back history - redirect to home instead of login
          console.log('BackButtonHandler: No back history, redirecting to home');
          router.replace(userHomeRoute);
          return true; // Prevent default back action
        }

      } catch (error) {
        console.error('BackButtonHandler: Error in back action handler:', error);
        // On error, allow default back behavior
        return false;
      }
    };

    // Add hardware back button listener
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    // Cleanup
    return () => backHandler.remove();
  }, [pathname, router]);

  // This component doesn't render anything
  return null;
}
