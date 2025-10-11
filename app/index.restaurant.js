import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { isAuthenticated, getUserType, USER_TYPES, initializeAuth } from "../src/services/authService";
import AnimatedSplashScreen from "../src/components/AnimatedSplashScreen";
import LoaderScreen from "../src/components/LoaderScreen";

export default function IndexScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Don't start auth check until splash screen is done
    if (!showSplash) {
      (async () => await checkAuthAndRedirect())();
    }
  }, [showSplash]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const checkAuthAndRedirect = async () => {
    try {
      await initializeAuth();
      const authenticated = await isAuthenticated();

      if (!authenticated) {
        return router.replace("/login");
      }

      const userType = await getUserType();

      // Restaurant app - handle manager and chef users
      if (userType === USER_TYPES.MANAGER) {
        router.replace("/dashboard");
      } else if (userType === USER_TYPES.CHEF) {
        router.replace("/chef-home");
      } else {
        // If logged in as customer, log them out and show restaurant login
        router.replace("/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.replace("/login");
    } finally {
      setIsLoading(false);
    }
  };

  // Show animated splash screen first
  if (showSplash) {
    return <AnimatedSplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  // Then show loader during auth check
  return (
    <LoaderScreen
      text={isLoading ? "Loading Menuva..." : "Redirecting..."}
      backgroundColor="#FFF5F3"
    />
  );
}
