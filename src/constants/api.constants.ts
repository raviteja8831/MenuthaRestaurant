import { Platform } from "react-native";

export const API_BASE_URL = getBaseURL();
function getBaseURL(): string {
  // if (Platform.OS === "android") {
  //   // For Android emulator use 10.0.2.2
  //   return "http://10.0.2.2:8080/api";
  // } else if (Platform.OS === "ios") {
  //   // For iOS simulator use localhost
  //   return "http://localhost:8080/api";
  // } else {
    // For web/laptop browser
    return "http://frootcity.com:8090/api";
  //}
}
export const IMG_BASE_URL = getImgBaseURL();
function getImgBaseURL(): string {
  // if (Platform.OS === "android") {
  //   // For Android emulator use 10.0.2.2
  //   return "http://10.0.2.2:8080";
  // } else if (Platform.OS === "ios") {
  //   // For iOS simulator use localhost
  //   return "http://localhost:8080";
  // } else {
    // For web/laptop browser
    return "http://frootcity.com:8090";
  //}
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
