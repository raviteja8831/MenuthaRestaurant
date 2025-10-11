import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { isAuthenticated, getUserType, USER_TYPES, initializeAuth } from "../src/services/authService";
import AnimatedSplashScreen from "../src/components/AnimatedSplashScreen";
import LoaderScreen from "../src/components/LoaderScreen";

export default function IndexScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();


  const handleSplashComplete = () => {
    console.log('[DEBUG] Splash complete, hiding splash and starting auth check');
    setShowSplash(false);
  };

  const checkAuthAndRedirect = useCallback(async () => {
    try {
      console.log('[DEBUG] Initializing auth...');
      await initializeAuth();
      const authenticated = await isAuthenticated();
      console.log('[DEBUG] Authenticated:', authenticated);

      if (!authenticated) {
        console.log('[DEBUG] Not authenticated, redirecting to /Customer-Login');
        return router.replace("/Customer-Login");
      }

      const userType = await getUserType();
      console.log('[DEBUG] User type:', userType);

      // Customer app - only handle customer login
      if (userType === USER_TYPES.CUSTOMER) {
        console.log('[DEBUG] Redirecting to /customer-home');
        router.replace("/customer-home");
      } else {
        // If logged in as restaurant user, log them out and show customer login
        console.log('[DEBUG] Not customer, redirecting to /Customer-Login');
        router.replace("/Customer-Login");
      }
    } catch (error) {
      console.error("[DEBUG] Auth check error:", error);
      router.replace("/Customer-Login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!showSplash) {
      checkAuthAndRedirect();
    }
  }, [showSplash, checkAuthAndRedirect]);



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
