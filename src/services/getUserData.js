import { useState, useEffect } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { AlertService } from "./alert.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

export function useUserData() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userProfile = await AsyncStorage.getItem("user_profile");
      console.log("useUserData - Checking user profile:", userProfile);

      if (userProfile) {
        const user = JSON.parse(userProfile);
        console.log("useUserData - Setting userId to:", user.id);
        setUserId(user.id);
      } else {
        console.log("useUserData - No user profile found");
        setUserId(null);
      }
    } catch (error) {
      console.error("useUserData - Error loading profile:", error);
      setError(error);
      AlertService.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect instead of useEffect to handle both initial load and focus
  // This prevents duplicate data fetching and hook order issues
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  return { userId, loading, error };
}

// For non-component usage
export async function getUserDataDirect() {
  try {
    const userProfile = await AsyncStorage.getItem("user_profile");
    if (userProfile) {
      const user = JSON.parse(userProfile);
      return user.id;
    }
    return null;
  } catch (error) {
    //console.error("Error getting user data:", error);
    return null;
  }
}
