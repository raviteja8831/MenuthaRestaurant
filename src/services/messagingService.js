import { Alert } from "react-native";

export function showError(message) {
  Alert.alert("Error", message);
}

export function showApiError(error) {
  /* if (error?.response?.data?.message) msg = error.response.data.message;
  else if (error?.message) msg = error.message; */
  console.log("API Error:", error);
  showError(error);
}
