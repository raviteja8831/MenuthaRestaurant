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

  return (
    <LoaderScreen
      text={isLoading ? "Loading Menuva..." : "Redirecting..."}
      backgroundColor="#a6a6e7"
    />
  );
}
