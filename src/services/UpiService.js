// services/UpiService.js
import { Linking } from "react-native";
import { getRestaurantById } from "../api/restaurantApi";
import { showError } from "./messagingService";

class UpiService {
  static async initiatePayment({ restaurantId, amount, transactionRef }) {
    const response = await getRestaurantById(restaurantId);

    if (!response?.upi || !amount) {
      showError("UPI ID and Amount are required.", "Missing Info");
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
        showError("Please install a UPI supported app.", "No UPI app found");
        return { status: "failed", reason: "no_app" };
      }
    } catch (err) {
      console.error("UPI Error:", err);
      return { status: "error", error: err };
    }
  }
}

export default UpiService;
