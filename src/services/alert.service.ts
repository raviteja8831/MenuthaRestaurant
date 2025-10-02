import { Alert } from "react-native";

export const AlertService = {
  success: (message: string, title = "Success") => {
    Alert.alert(title, message);
  },

  error: (error: any, title = "Error") => {
    const message = error?.message || "Something went wrong";
    Alert.alert(title, message);
  },

  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
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
