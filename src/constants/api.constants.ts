import { Platform } from "react-native";
import Constants from "expo-constants";

// Contract:
// - Reads API_BASE_URL from Expo config extra (Constants.expoConfig?.extra?.API_BASE_URL)
// - Falls back to process.env.API_BASE_URL (when available in dev) or the hardcoded default
// - Default kept as the existing value so existing builds keep working

const DEFAULT_API = "http://13.127.228.119:8090/api";
const DEFAULT_IMG = "http://13.127.228.119:8090/";

export const API_BASE_URL = getBaseURL();
function getBaseURL(): string {
  // 1) Expo runtime config (recommended): app.json / eas.json -> extra -> API_BASE_URL
  const expoExtra = (Constants as any)?.expoConfig?.extra || (Constants as any)?.manifest?.extra;
  if (expoExtra && typeof expoExtra.API_BASE_URL === "string" && expoExtra.API_BASE_URL.length > 0) {
    return expoExtra.API_BASE_URL;
  }

  // 2) process.env (when running in node/dev bundler with env injected)
  if (typeof process !== "undefined" && (process as any).env && (process as any).env.API_BASE_URL) {
    return (process as any).env.API_BASE_URL;
  }

  // 3) platform-specific emulators (if you want to use localhost during development)
  if (Platform.OS === "android") {
    // For Android emulator (API 30 and older) use 10.0.2.2 if your backend runs on localhost
    // Uncomment the next line during local dev: return "http://10.0.2.2:8080/api";
  }

  // Fallback to the production IP used previously
  return DEFAULT_API;
}
export const IMG_BASE_URL = getImgBaseURL();
function getImgBaseURL(): string {
  const expoExtra = (Constants as any)?.expoConfig?.extra || (Constants as any)?.manifest?.extra;
  if (expoExtra && typeof expoExtra.IMG_BASE_URL === "string" && expoExtra.IMG_BASE_URL.length > 0) {
    return expoExtra.IMG_BASE_URL;
  }
  if (typeof process !== "undefined" && (process as any).env && (process as any).env.IMG_BASE_URL) {
    return (process as any).env.IMG_BASE_URL;
  }
  // Fallback
  return DEFAULT_IMG;
}

// Helpful runtime debug log so Android device emulator/devs can see which URL is used
try {
  // eslint-disable-next-line no-console
  console.log("API_BASE_URL ->", API_BASE_URL, "IMG_BASE_URL ->", IMG_BASE_URL, "Platform ->", Platform.OS);
} catch (e) {
  // ignore
}

export const API_ENDPOINTS = {
  REVIEWS: {
    GET_USER_REVIEWS: (userId: number) => `/reviews/user/${userId}`,
    ADD_REVIEW: "/reviews",
  },
  USER: {
    PROFILE: (userId: number) => `/users/profile/${userId}`,
    UPDATE_PROFILE: (userId: number) => `/users/${userId}`,
    FAVORITES: (userId: number) => `/users/${userId}/favorites`,
    TRANSACTIONS: (userId: number) => `/users/${userId}/transactions`,
  },
};
