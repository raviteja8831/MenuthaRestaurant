import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { AlertService } from "./alert.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useUserData() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const userProfile = await AsyncStorage.getItem("user_profile");
        //console.log("Raw user profile:", userProfile);

        if (userProfile) {
          const user = JSON.parse(userProfile);
          //console.log("Parsed user profile:", user);
          setUserId(user.id);
        } else {
          //console.log("No user profile found");
          router.replace("/");
        }
      } catch (error) {
        //console.error("Error initializing profile:", error);
        setError(error);
        AlertService.error("Error loading profile");
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router]);

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
