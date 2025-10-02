import React, { useState } from "react";
import {
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  View,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { TextInput, Button, Text, Surface } from "react-native-paper";
import { MESSAGES } from "../constants/constants";
import { AlertService } from "../services/alert.service";
import { createCustomer } from "../api/customerApi";
import { router, useNavigation, useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function CustomerRegisterScreen() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstname.trim() || !lastname.trim() || !phone.trim()) {
      Alert.alert(
        "Error",
        "Please enter your first name, last name and phone number"
      );
      return;
    }

    try {
      setLoading(true);
      const response = await createCustomer({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        phone: phone.trim(),
      });

      if (response) {
        Alert.alert("Success", MESSAGES.registrationSuccess);
        useRouter().push("/Customer-Login");
      }
    } catch (error) {
      AlertService.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Surface style={styles.container}>
        {/* Top-right icon */}
        {/* <View style={styles.topRightIcon}>
          <Image
            source={require("../assets/images/logo.png")}
            style={{ width: 28, height: 28 }}
          />
        </View> */}

        {/* Title */}
        {/* <Text style={styles.title}>Menutha</Text> */}

        {/* Form */}
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            label="First Name"
            value={firstname}
            onChangeText={setFirstname}
            mode="outlined"
            theme={{ colors: { primary: "#6B4EFF" } }}
          />
          <TextInput
            style={styles.input}
            label="Last Name"
            value={lastname}
            onChangeText={setLastname}
            mode="outlined"
            theme={{ colors: { primary: "#6B4EFF" } }}
          />
          <TextInput
            style={styles.input}
            label="Phone Number"
            keyboardType="numeric"
            maxLength={10}
            value={phone}
            // onChangeText={setPhone}
            onChangeText={(value) => {
              const numericValue = value.replace(/\D/g, "");
              setPhone(numericValue);
            }}
            mode="outlined"
            theme={{ colors: { primary: "#6B4EFF" } }}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Loading indicator */}
        {loading && (
          <ActivityIndicator
            size="large"
            color="#6B4EFF"
            style={styles.loadingIndicator}
          />
        )}

        {/* Register button */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={styles.registerButton}
            labelStyle={styles.buttonText}
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
          >
            Register
          </Button>
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingIndicator: {
    marginVertical: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#A6A6E7",
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
  },
  topRightIcon: {
    position: "absolute",
    top: height * 0.05,
    right: width * 0.05,
  },
  logo: {
    width: 180,
    height: 120,
    marginBottom: 24,
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: height * 0.08,
    marginBottom: height * 0.05,
    fontFamily: "Cochin", // replace with custom font for exact match
    color: "black",
  },
  formContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  input: {
    marginBottom: 20,
    backgroundColor: "white",
    fontSize: 16,
  },
  buttonContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: height * 0.05,
  },
  registerButton: {
    width: "70%",
    borderRadius: 12,
    paddingVertical: 8,
    backgroundColor: "#D0CEF8",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "black",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});
