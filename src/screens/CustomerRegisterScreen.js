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
  Pressable,
} from "react-native";
import { TextInput, Button, Text, Surface } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { MESSAGES } from "../constants/constants";
import { AlertService } from "../services/alert.service";
import { createCustomer } from "../api/customerApi";
import { uploadImage } from "../api/imageApi";
import { API_BASE_URL } from "../constants/api.constants";
import { router, useNavigation, useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function CustomerRegisterScreen() {
  const router = useRouter(); // Move router hook to component level
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setProfileImage(asset.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      AlertService.error("Error picking image");
    }
  };

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

      let profileImageUrl = "";

      // Upload profile image if selected
      if (profileImage) {
        try {
          if (profileImage.startsWith("file://") || profileImage.startsWith("content://")) {
            // Local file, upload as file object
            const filename = profileImage.split("/").pop();
            const match = /\.(\w+)$/.exec(filename ?? "");
            const typeMime = match ? `image/${match[1]}` : `image/jpeg`;
            const fileObj = {
              uri: profileImage,
              name: filename,
              type: typeMime,
            };

            const uploadResponse = await uploadImage(fileObj);
            profileImageUrl = uploadResponse.url;
          }
        } catch (uploadError) {
          console.error("Error uploading profile image:", uploadError);
          AlertService.error("Error uploading profile image. Registration will continue without image.");
          profileImageUrl = "";
        }
      }

      const response = await createCustomer({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        phone: phone.trim(),
        profileImage: profileImageUrl,
      });

      // Registration successful
      Alert.alert("Success", MESSAGES.registrationSuccess, [
        {
          text: "OK",
          onPress: () => router.push("/Customer-Login")
        }
      ]);
    } catch (error) {
      console.error("Registration error:", error);
      // Improved error handling
      let errorMessage = "Something went wrong. Please try again.";

      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      AlertService.error({ message: errorMessage });
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

          {/* Profile Image Upload */}
          <View style={styles.imageUploadContainer}>
            <Text style={styles.imageLabel}>Profile Picture (Optional)</Text>
            <Pressable style={styles.imageUploadBox} onPress={pickImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
                </View>
              )}
            </Pressable>
          </View>

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
  imageUploadContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  imageUploadBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#6B4EFF",
    borderStyle: "dashed",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 58,
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
});
