import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Alert,
  View,
  KeyboardAvoidingView,
  Platform,
  Image,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput, Text } from "react-native-paper";
import axios from "axios";
import { useRouter } from "expo-router";
import { getCustomerLogin } from "../api/customerApi";

export default function CustomerLoginScreen() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpInputs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const router = useRouter();

  const handleOtpChange = (text, idx) => {
    if (/^\d?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[idx] = text;
      setOtp(newOtp);
      if (text && idx < 3) {
        otpInputs[idx + 1].current.focus();
      }
      if (!text && idx > 0) {
        otpInputs[idx - 1].current.focus();
      }
    }
  };

  React.useEffect(() => {
    if (otp.every((d) => d.length === 1)) {
      handleLogin(phone, otp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleLogin = async () => {
    if (!phone.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    try {
      //   setLoading(true);
      const response = await getCustomerLogin({
        phone: phone.trim(),
        otp: otp.join(""),
      });

      if (response) {
        // Save user data
        await AsyncStorage.setItem("user_profile", JSON.stringify(response));
        if (response.token) {
          await AsyncStorage.setItem("auth_token", response.token);
        }
        // Navigate to customer home
        router.push("/customer-home");
      }
    } catch (err) {
      Alert.alert("Login Failed", err?.message || "Invalid credentials");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          // keyboardType="phone-pad"
          keyboardType="numeric"
          value={phone}
          // onChangeText={setPhone}
          onChangeText={(value) => {
            const numericValue = value.replace(/\D/g, "");
            setPhone(numericValue);
          }}
          maxLength={10}
          mode="flat"
          underlineColor="#fff"
          activeUnderlineColor="#1a237e"
        />
      </View>
      <View style={styles.inputGroup}>
        <View style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={otpInputs[idx]}
              style={styles.otpBox}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, idx)}
              keyboardType="number-pad"
              maxLength={1}
              returnKeyType={idx === 3 ? "done" : "next"}
              mode="flat"
              underlineColor="#fff"
              activeUnderlineColor="#1a237e"
            />
          ))}
        </View>
      </View>
      {/* No Login button, auto-submit on OTP complete */}

      {/* Register Link */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don’t have an account? </Text>
        <Pressable onPress={() => router.push("/customer-register")}>
          <Text style={styles.registerLink}>Register</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: "#a6a6e7",
    alignItems: "center",
    justifyContent: "flex-start",
    // marginTop: 25,
  },
  log1inButton: {
    // backgroundColor: "#8C8AEB",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    marginTop: "auto",
    width: 350,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },

  registerText: {
    fontSize: 14,
    color: "#444",
  },

  registerLink: {
    fontSize: 14,
    color: "#007BFF", // nice blue link color
    fontWeight: "bold",
  },

  // Removed formSurface and formWrapper for flat design
  logo: {
    width: 180,
    height: 120,
    marginBottom: 24,
    alignSelf: "center",
  },
  inputGroup: {
    width: 260,
    marginBottom: 22,
    alignSelf: "center",
  },
  label: {
    fontSize: 15,
    color: "#222",
    marginBottom: 6,
    marginLeft: 2,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    fontSize: 18,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 0,
    marginBottom: 0,
    elevation: 0,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 210,
    marginTop: 6,
    marginBottom: 10,
    alignSelf: "center",
  },
  otpBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    fontSize: 22,
    textAlign: "center",
    backgroundColor: "#fff",
    marginHorizontal: 4,
    borderWidth: 0,
    elevation: 0,
  },
});
