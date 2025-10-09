// // Temporary instrumentation: log app start to help debug splash hang
// console.log('APP INDEX: module loaded', new Date().toISOString());

// import LoginScreen from './../src/screens/LoginScreen';

// export default function IndexScreen() {
//   console.log('APP INDEX: rendering IndexScreen');
//   return <LoginScreen />;
// }
import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, BackHandler, Platform } from "react-native";
import { useRouter } from "expo-router";
import {
  isAuthenticated,
  getUserType,
  validateAndRefreshToken,
  USER_TYPES,
  initializeAuth,
} from "../src/services/authService";

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  // Keep a ref for synchronous access by the BackHandler
  const isAuthRef = useRef(false);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("INDEX: Starting authentication check");
    let didFinish = false;

    // Safety timeout: if auth check doesn't finish in 8s, redirect to login
    const timeout = setTimeout(() => {
      if (!didFinish) {
        console.warn(
          "INDEX: Auth check timed out, redirecting to Customer-Login"
        );
        try {
          router.replace("/Customer-Login");
        } catch (e) {
          console.error(
            "INDEX: router.replace failed during timeout redirect",
            e
          );
        }
        setIsLoading(false);
      }
    }, 8000);

    (async () => {
      await checkAuthAndRedirect();
      didFinish = true;
      clearTimeout(timeout);
    })();
  }, []);

  // Android hardware back button: when the user is authenticated, block back navigation
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const onBackPress = () => {
      // If user is authenticated, consume the back press so we don't go back to login
      if (isAuthRef.current) {
        console.log("INDEX: Android back press blocked because user is authenticated");
        return true; // handled
      }
      return false; // allow default behavior
    };

    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    };
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      setIsLoading(true);

      // Initialize auth on app start (this validates tokens silently)
      console.log("INDEX: calling initializeAuth()");
      const initResult = await initializeAuth();
      console.log("INDEX: initializeAuth result:", initResult);

      // Check if user is authenticated after initialization
  const authenticated = await isAuthenticated();
  // update ref and state so the BackHandler can read auth synchronously
  isAuthRef.current = !!authenticated;
  setIsAuthenticatedState(!!authenticated);
      console.log("INDEX: isAuthenticated ->", authenticated);

      if (!authenticated || !initResult) {
        // Not authenticated or token invalid, redirect to customer login
        console.log("Not authenticated or token invalid, redirecting to login");
        router.replace("/Customer-Login");
        return;
      }

      // Get user type and redirect to appropriate home screen
      const userType = await getUserType();

      console.log("User authenticated, userType:", userType);

      if (userType === USER_TYPES.CUSTOMER) {
        router.replace("/customer-home");
      } else if (userType === USER_TYPES.CHEF) {
        router.replace("/chef-home");
      } else if (userType === USER_TYPES.MANAGER) {
        router.replace("/dashboard");
      } else {
        // Unknown user type, redirect to customer login
        console.log("Unknown user type, redirecting to login");
        router.replace("/Customer-Login");
      }
    } catch (error) {
      console.error("Error checking auth on app start:", error);
      router.replace("/Customer-Login");
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#a6a6e7",
  },
  loadingText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
});
