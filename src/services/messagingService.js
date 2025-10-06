import { Alert } from "react-native";
import { AlertService } from "./alert.service";

export function showError(message) {
AlertService.error(message, "Error");
}

export function showApiError(error) {
  console.log("API Error (full):", error);
  let msg = 'Something went wrong';
  if (error?.response?.data) {
    if (typeof error.response.data === 'string') msg = error.response.data;
    else if (error.response.data.message) msg = error.response.data.message;
    else msg = JSON.stringify(error.response.data);
  } else if (error?.message) {
    msg = error.message;
  }
  showError(msg);
}
