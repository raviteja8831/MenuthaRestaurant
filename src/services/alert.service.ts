import { Alert } from "react-native";

// Import the new snackbar alert service
// Note: For TypeScript compatibility, we'll keep the static methods as fallback
export const AlertService = {
  success: (message: string, title = "Success") => {
    // Try to use the new snackbar service first
    try {
      const { AlertService: SnackbarService } = require('../contexts/AlertContext');
      if (SnackbarService._instance) {
        SnackbarService.success(message, title);
        return;
      }
    } catch (error) {
      console.log('Fallback to default alert');
    }
    // Fallback to default alert
    Alert.alert(title, message);
  },

  error: (error: any, title = "Error") => {
    const message = error?.message || "Something went wrong";
    // Try to use the new snackbar service first
    try {
      const { AlertService: SnackbarService } = require('../contexts/AlertContext');
      if (SnackbarService._instance) {
        SnackbarService.error(message, title);
        return;
      }
    } catch (error) {
      console.log('Fallback to default alert');
    }
    // Fallback to default alert
    Alert.alert(title, message);
  },

  warning: (message: string, title = "Warning") => {
    // Try to use the new snackbar service first
    try {
      const { AlertService: SnackbarService } = require('../contexts/AlertContext');
      if (SnackbarService._instance) {
        SnackbarService.warning(message, title);
        return;
      }
    } catch (error) {
      console.log('Fallback to default alert');
    }
    // Fallback to default alert
    Alert.alert(title, message);
  },

  info: (message: string, title = "Info") => {
    // Try to use the new snackbar service first
    try {
      const { AlertService: SnackbarService } = require('../contexts/AlertContext');
      if (SnackbarService._instance) {
        SnackbarService.info(message, title);
        return;
      }
    } catch (error) {
      console.log('Fallback to default alert');
    }
    // Fallback to default alert
    Alert.alert(title, message);
  },

  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    // Confirmation dialogs should stay as native alerts for better UX
    Alert.alert(title, message, [
      {
        text: "Cancel",
        style: "cancel",
        onPress: onCancel,
      },
      {
        text: "OK",
        onPress: onConfirm,
      },
    ]);
  },
};
