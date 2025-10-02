// services/UpiService.js
import { Linking, Alert } from "react-native";
import { getRestaurantById } from "../api/restaurantApi";

class UpiService {
  static async initiatePayment({ restaurantId, amount, transactionRef }) {
    const response = await getRestaurantById(restaurantId);

    if (!response?.upi || !amount) {
      Alert.alert("Missing Info", "UPI ID and Amount are required.");
      return;
    }
    const upiId = response.upi;
    const name = "Menutha Payment";
    const note = "Payment for Menutha Order #1234";
    const refId = transactionRef || "TID" + Date.now();
    const encodedNote = encodeURIComponent(note || "Payment");

    const url = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
      name || "Merchant"
    )}&tn=${encodedNote}&am=${amount}&cu=INR&tr=${refId}`;

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
        return { status: "initiated", url };
      } else {
        Alert.alert("No UPI app found", "Please install a UPI supported app.");
        return { status: "failed", reason: "no_app" };
      }
    } catch (err) {
      console.error("UPI Error:", err);
      return { status: "error", error: err };
    }
  }
}

export default UpiService;
