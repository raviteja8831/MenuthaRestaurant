import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { isAuthenticated, getUserType, USER_TYPES, initializeAuth } from "../src/services/authService";
import LoaderScreen from "../src/components/LoaderScreen";

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => await checkAuthAndRedirect())();
  }, []);

  const checkAuthAndRedirect = async () => {
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
  };

  return (
    <LoaderScreen
      text={isLoading ? "Loading Menutha..." : "Redirecting..."}
      backgroundColor="#a6a6e7"
    />
  );
}
