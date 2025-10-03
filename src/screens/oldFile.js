import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  View,
  Pressable,
  ScrollView,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Button, Text, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { registerManager } from "../api/managerApi";
import { showApiError } from "../services/messagingService";
import { FormInput, useFormValidation } from "../components/formHelper";
import { uploadImage } from "../api/imageApi";
import { API_BASE_URL } from "../constants/api.constants";

// Set a default Google address
const DEFAULT_ADDRESS =
  "1600 Amphitheatre Parkway, Mountain View, CA 94043, USA";

export default function ManagerRegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  // Form state
  const [restaurantName, setRestaurantName] = React.useState("");
  const [restaurantAddress, setRestaurantAddress] = React.useState("");

  // Service type state
  const [tableService, setTableService] = React.useState(false);
  const [selfService, setSelfService] = React.useState(false);
  const [enableBoth, setEnableBoth] = React.useState(false);

  // Food type state
  const [pureVeg, setPureVeg] = React.useState(false);
  const [nonVeg, setNonVeg] = React.useState(false);

  // Buffet state
  const [enableBuffet, setEnableBuffet] = React.useState(false);

  // Image state
  const [ambianceImage, setAmbianceImage] = React.useState(null);

  // When enableBoth changes, update both service states
  React.useEffect(() => {
    if (enableBoth) {
      setTableService(true);
      setSelfService(true);
    } else {
      setTableService(false);
      setSelfService(false);
    }
  }, [enableBoth]);

  // Location logic
  const GOOGLE_API_KEY = "AIzaSyCJT87ZYDqm6bVLxRsg4Zde87HyefUfASQ";
  const handleUseCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showApiError("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const addr = data.results[0].formatted_address;
        setRestaurantAddress(addr);
      } else {
        setRestaurantAddress("Address not found");
      }
    } catch (error) {
      setRestaurantAddress("Error fetching location or address");
    }
  };
  const handleServiceSelection = (type) => {
    if (type === 'table') {
      if (enableBoth) return; // Don't allow manual toggle if both is enabled
      setTableService(!tableService);
      setSelfService(false);
    } else if (type === 'self') {
      if (enableBoth) return; // Don't allow manual toggle if both is enabled
      setSelfService(!selfService);
      setTableService(false);
    }
  };

  const handleEnableBoth = () => {
    setEnableBoth(!enableBoth);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: false,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setAmbianceImage(asset.uri); // just preview local image
    }
  };

  const handleRegister = async () => {
    // Basic validation
    if (!restaurantName.trim()) {
      showApiError("Restaurant name is required");
      return;
    }
    if (!restaurantAddress.trim()) {
      showApiError("Restaurant address is required");
      return;
    }

    setLoading(true);
    try {
      // Geocode address to get latitude and longitude
      let latitude = null;
      let longitude = null;
      try {
        const geoRes = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(restaurantAddress)}&key=${GOOGLE_API_KEY}`
        );
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          latitude = geoData.results[0].geometry.location.lat;
          longitude = geoData.results[0].geometry.location.lng;
        }
      } catch (geoErr) {
        // If geocoding fails, leave lat/lng null
      }

      // Handle image upload if present
      let ambianceImageUrl = "";
      if (ambianceImage) {
        if (
          ambianceImage.startsWith("file://") ||
          ambianceImage.startsWith("content://")
        ) {
          const filename = ambianceImage.split("/").pop();
          const match = /\.(\w+)$/.exec(filename ?? "");
          const typeMime = match ? `image/${match[1]}` : `image/jpeg`;
          const fileObj = {
            uri: ambianceImage,
            name: filename,
            type: typeMime,
          };
          try {
            const data = await uploadImage(fileObj);
            const SERVER_URL = API_BASE_URL;
            let imageUrl = data.url;
            imageUrl =
              SERVER_URL +
              (imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl);
            ambianceImageUrl = imageUrl;
          } catch (err) {
            showApiError("Image upload failed");
            ambianceImageUrl = "";
          }
        }
      }

      // Prepare payload
      const payload = {
        name: restaurantName,
        restaurantAddress,
        ambianceImage: ambianceImageUrl,
        enableBuffet,
        enableVeg: pureVeg,
        enableNonveg: nonVeg,
        enableTableService: tableService,
        enableSelfService: selfService,
        restaurantType: "Restaurant", // Default type
        latitude,
        longitude,
        role_id: 1,
      };

      const data = await registerManager(payload);
      showApiError(data.message || "Registered successfully");
      router.push("/login");
    } catch (err) {
      showApiError(err);
      const msg =
        err?.response?.data?.message || err?.message || "Registration failed";
      showApiError(msg);
    }
    setLoading(false);
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Restaurant Name Input */}
          <View style={styles.inputContainer}>
            {/* <Text style={styles.inputLabel}>Restaurant Name:</Text> */}
            <TextInput
              style={styles.textInput}
              value={restaurantName}
              onChangeText={setRestaurantName}
              placeholder="Restaurant Name"
            />
          </View>

          {/* Restaurant Address Input */}
          <View style={styles.inputContainer}>
            {/* <Text style={styles.inputLabel}>Restaurant Address:</Text> */}
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={restaurantAddress}
              onChangeText={setRestaurantAddress}
              placeholder="Restaurant Address"
              multiline={true}
              numberOfLines={4}
            />
          </View>

          {/* Use Current Location Button */}
          <Pressable style={styles.locationButton} onPress={handleUseCurrentLocation}>
            <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#fff" />
            <Text style={styles.locationButtonText}>Use Current Location</Text>
          </Pressable>

          {/* Choose your Restaurant Type */}
          {/* <Text style={styles.sectionTitle}>Choose your Restaurant Type</Text> */}
 {/* Upload Ambiance Photo */}
          <Text style={styles.sectionTitle}>Upload Ambiance Photo</Text>
          <Pressable style={styles.photoUploadBox} onPress={pickImage}>
            {ambianceImage ? (
              <Image
                source={{ uri: ambianceImage }}
                style={styles.photoPreview}
                resizeMode="cover"
              />
            ) : (
              <MaterialCommunityIcons name="camera" size={60} color="#333" />
            )}
          </Pressable>

          {/* Service Type Selection */}
          <View style={styles.serviceTypeContainer}>
            <Pressable
              style={[
                styles.serviceTypeBox,
                tableService && styles.serviceTypeBoxActive,
              ]}
              onPress={() => handleServiceSelection('table')}
            >
              <View style={styles.serviceIconContainer}>
                <MaterialCommunityIcons
                  name="silverware-fork-knife"
                  size={40}
                  color="#333"
                />
              </View>
              <Text style={styles.serviceTypeLabel}>Table Service</Text>
            </Pressable>

            <Pressable
              style={[
                styles.serviceTypeBox,
                selfService && styles.serviceTypeBoxActive,
              ]}
              onPress={() => handleServiceSelection('self')}
            >
              <View style={styles.serviceIconContainer}>
                <View style={styles.selfServiceIcon}>
                  <Text style={styles.selfServiceText}>SELF SERVICE</Text>
                </View>
              </View>
              <Text style={styles.serviceTypeLabel}>Self Service</Text>
            </Pressable>
          </View>

          {/* Enable Both */}
          <View style={styles.enableBothContainer}>
            <Pressable
              style={styles.checkboxContainer}
              onPress={handleEnableBoth}
            >
              <View style={[styles.checkbox, enableBoth && styles.checkboxActive]}>
                {enableBoth && (
                  <MaterialCommunityIcons name="check" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Enable Both</Text>
            </Pressable>
          </View>

          {/* Food Type Selection */}
          <View style={styles.foodTypeContainer}>
            <Pressable
              style={[
                styles.foodTypeBox,
                styles.vegBox,
                pureVeg && styles.vegBoxActive,
              ]}
              onPress={() => setPureVeg(!pureVeg)}
            >
              <View style={styles.vegIndicator} />
              <Text style={styles.foodTypeLabel}>Pure Veg</Text>
            </Pressable>

            <Pressable
              style={[
                styles.foodTypeBox,
                styles.nonVegBox,
                nonVeg && styles.nonVegBoxActive,
              ]}
              onPress={() => setNonVeg(!nonVeg)}
            >
              <View style={styles.nonVegIndicator} />
              <Text style={styles.foodTypeLabel}>Non Veg</Text>
            </Pressable>
          </View>

          {/* Enable Buffet */}
          <View style={styles.enableBuffetContainer}>
            <Pressable
              style={styles.checkboxContainer}
              onPress={() => setEnableBuffet(!enableBuffet)}
            >
              <View style={[styles.checkbox, enableBuffet && styles.checkboxActive]}>
                {enableBuffet && (
                  <MaterialCommunityIcons name="check" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Enable Buffet</Text>
            </Pressable>
          </View>

         
          {/* Register Button */}
          <Pressable
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? "Registering..." : "Register"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
 
    }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8D8BEA",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    minHeight: 48,
  },
  textAreaInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  locationButton: {
    backgroundColor: "#6c63b5",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  locationButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
  },
  serviceTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 24,
  },
  serviceTypeBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "transparent",
  },
  serviceTypeBoxActive: {
    borderColor: "#6c63b5",
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  selfServiceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#8B4513",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  selfServiceText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  serviceTypeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  enableBothContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: "#6c63b5",
    borderColor: "#6c63b5",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  foodTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 32,
  },
  foodTypeBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 3,
  },
  vegBox: {
    borderColor: "#22c55e",
  },
  vegBoxActive: {
    borderColor: "#16a34a",
    borderWidth: 4,
  },
  nonVegBox: {
    borderColor: "#ef4444",
  },
  nonVegBoxActive: {
    borderColor: "#dc2626",
    borderWidth: 4,
  },
  vegIndicator: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#22c55e",
    marginBottom: 12,
  },
  nonVegIndicator: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    marginBottom: 12,
  },
  foodTypeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  enableBuffetContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  photoUploadBox: {
    backgroundColor: "#E8E8E8",
    borderRadius: 16,
    height: 160,
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
  },
  photoPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  registerButton: {
    backgroundColor: "#6c63b5",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  registerButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});