// services/UpiService.js
import { Linking, Alert } from "react-native";
import { getRestaurantById } from "../api/restaurantApi";
import { showError } from "./messagingService";

class UpiService {
  // Popular UPI apps with their deep link schemes
  static UPI_APPS = [
    {
      name: "PhonePe",
      scheme: "phonepe://",
      deepLink: "phonepe://pay",
      packageName: "com.phonepe.app",
    },
    {
      name: "Google Pay",
      scheme: "gpay://",
      deepLink: "gpay://upi/pay",
      packageName: "com.google.android.apps.nbu.paisa.user",
    },
    {
      name: "Paytm",
      scheme: "paytm://",
      deepLink: "paytm://pay",
      packageName: "net.one97.paytm",
    },
    {
      name: "BHIM",
      scheme: "bhim://",
      deepLink: "bhim://pay",
      packageName: "in.org.npci.upiapp",
    },
    {
      name: "Amazon Pay",
      scheme: "amazonpay://",
      deepLink: "amazonpay://pay",
      packageName: "in.amazon.mShop.android.shopping",
    },
    {
      name: "Generic UPI",
      scheme: "upi://",
      deepLink: "upi://pay",
      packageName: null,
    },
  ];

  static async checkAppAvailability() {
    const availableApps = [];

    for (const app of UpiService.UPI_APPS) {
      try {
        const isAvailable = await Linking.canOpenURL(app.scheme);
        if (isAvailable) {
          availableApps.push(app);
          console.log(`✅ ${app.name} is available`);
        } else {
          console.log(`❌ ${app.name} is not available`);
        }
      } catch (error) {
        console.log(`🔍 Error checking ${app.name}:`, error);
      }
    }

    return availableApps;
  }

  static buildUpiUrl({ upiId, name, note, amount, refId }) {
    const encodedNote = encodeURIComponent(note || "Payment");
    const encodedName = encodeURIComponent(name || "Merchant");

    return `upi://pay?pa=${upiId}&pn=${encodedName}&tn=${encodedNote}&am=${amount}&cu=INR&tr=${refId}`;
  }

  static async initiatePayment({ restaurantId, amount, transactionRef }) {
    try {
      const response = await getRestaurantById(restaurantId);

      if (!response?.upi || !amount) {
        showError("UPI ID and Amount are required.", "Missing Info");
        return { status: "failed", reason: "missing_info" };
      }

      const upiId = response.upi;
      const name = "Menutha Payment";
      const note = "Payment for Menutha Order";
      const refId = transactionRef || "TID" + Date.now();

      console.log("🚀 Initiating UPI Payment:", { upiId, amount, refId });

      // Check available UPI apps
      const availableApps = await UpiService.checkAppAvailability();

      if (availableApps.length === 0) {
        console.log("❌ No UPI apps found");
        showError("Please install a UPI app (PhonePe, Google Pay, Paytm, etc.)", "No UPI App Found");
        return { status: "failed", reason: "no_app" };
      }

      console.log(`✅ Found ${availableApps.length} UPI apps:`, availableApps.map(app => app.name));

      // Build UPI URL
      const upiUrl = UpiService.buildUpiUrl({ upiId, name, note, amount, refId });
      console.log("🔗 UPI URL:", upiUrl);

      // Try to open the UPI URL - this will show app chooser if multiple apps are available
      const canOpen = await Linking.canOpenURL(upiUrl);

      if (canOpen) {
        await Linking.openURL(upiUrl);
        console.log("✅ UPI payment initiated successfully");
        return {
          status: "initiated",
          url: upiUrl,
          availableApps: availableApps.map(app => app.name),
          refId
        };
      } else {
        // Fallback: Try opening specific apps
        console.log("🔄 Generic UPI URL failed, trying specific apps...");

        for (const app of availableApps.slice(0, 3)) { // Try top 3 available apps
          try {
            console.log(`🔄 Trying ${app.name}...`);

            if (app.name === "PhonePe") {
              // PhonePe specific URL format
              const phonePeUrl = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&tn=${encodeURIComponent(note)}&am=${amount}&cu=INR&tr=${refId}`;
              console.log("📱 PhonePe URL:", phonePeUrl);
              await Linking.openURL(phonePeUrl);
              return { status: "initiated", app: "PhonePe", url: phonePeUrl, refId };
            } else if (app.name === "Google Pay") {
              // Google Pay specific URL format
              const gpayUrl = `gpay://upi/pay?pa=${upiId}&pn=${encodeURIComponent(name)}&tn=${encodeURIComponent(note)}&am=${amount}&cu=INR&tr=${refId}`;
              console.log("💳 Google Pay URL:", gpayUrl);
              await Linking.openURL(gpayUrl);
              return { status: "initiated", app: "Google Pay", url: gpayUrl, refId };
            } else {
              // Generic format for other apps
              await Linking.openURL(upiUrl);
              return { status: "initiated", app: app.name, url: upiUrl, refId };
            }
          } catch (appError) {
            console.log(`❌ Failed to open ${app.name}:`, appError);
            continue;
          }
        }

        // If all specific attempts fail
        console.log("❌ All UPI app attempts failed");
        showError("Unable to open UPI apps. Please try again.", "Payment Failed");
        return { status: "failed", reason: "app_open_failed" };
      }

    } catch (error) {
      console.error("❌ UPI Payment Error:", error);
      showError("Payment initialization failed. Please try again.", "Error");
      return { status: "error", error: error.message };
    }
  }
}

export default UpiService;
