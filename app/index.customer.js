import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { isAuthenticated, getUserType, USER_TYPES, initializeAuth } from "../src/services/authService";
import AnimatedSplashScreen from "../src/components/AnimatedSplashScreen";
import LoaderScreen from "../src/components/LoaderScreen";

export default function IndexScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuthAndRedirect = useCallback(async () => {
    try {
      await initializeAuth();
      const authenticated = await isAuthenticated();

      if (!authenticated) {
        return router.replace("/Customer-Login");
      }

      const userType = await getUserType();

      // Customer app - only handle customer login
      if (userType === USER_TYPES.CUSTOMER) {
        router.replace("/customer-home");
      } else {
        // If logged in as restaurant user, log them out and show customer login
        router.replace("/Customer-Login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.replace("/Customer-Login");
    } finally {
      setIsLoading(false);
    }
  }, [router, setIsLoading]);

  useEffect(() => {
    // Don't start auth check until splash screen is done
    if (!showSplash) {
      checkAuthAndRedirect();
    }
  }, [showSplash, checkAuthAndRedirect]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Show animated splash screen first
  if (showSplash) {
    return <AnimatedSplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  // Then show loader during auth check
  return (
    <LoaderScreen
      text={isLoading ? "Loading Menutha..." : "Redirecting..."}
      backgroundColor="#F5F3FF"
    />
  );
}
