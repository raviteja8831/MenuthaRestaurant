// Reusable RedStar component
const RedStar = () => (
  <Text style={{ color: 'red', fontSize: 16, fontWeight: 'bold' }}>*</Text>
);
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
} from "react-native";
import { Button, Text, Surface, IconButton } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { registerManager } from "../api/managerApi";
import { showApiError } from "../services/messagingService";
import { FormInput, useFormValidation } from "../components/formHelper";
import { uploadImage } from "../api/imageApi";
import { API_BASE_URL } from "../constants/api.constants";

// Set a default Google address
const DEFAULT_ADDRESS =
  "";

export default function ManagerRegisterScreen() {
  const [address, setAddress] = React.useState(DEFAULT_ADDRESS);
  // Location logic
  const GOOGLE_API_KEY = "AIzaSyCJT87ZYDqm6bVLxRsg4Zde87HyefUfASQ";
  const handleUseCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
       showApiError("Permission to access location was denied");
        setAddress("Location permission denied");
        setFormState((prev) => ({
          ...prev,
          restaurantAddress: "Location permission denied",
        }));
        return;
      }
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      // Use Google Maps Geocoding API
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const addr = data.results[0].formatted_address;
        setAddress(addr);
        handleChange("restaurantAddress", addr);
      } else {
        setAddress("Address not found");
        handleChange("restaurantAddress", "Address not found");
      }
    } catch (error) {
      setAddress("Error fetching location or address");
      handleChange("restaurantAddress", "Error fetching location or address");
    }
  };
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [tableService, setTableService] = React.useState(false);
  const [selfService, setSelfService] = React.useState(false);
  const [pureVeg, setPureVeg] = React.useState(false);
  const [nonVeg, setNonVeg] = React.useState(false);
  const [enableBuffet, setEnableBuffet] = React.useState(false);
  const [enableBoth, setEnableBoth] = React.useState(false);

  // When enableBoth changes, update both service states
  React.useEffect(() => {
    if (enableBoth) {
      setTableService(true);
      setSelfService(true);
    }
  }, [enableBoth]);
  const [ambianceImage, setAmbianceImage] = React.useState(null);
  // const [logo, setLogo] = React.useState(null); // Removed unused variable
  // Remove parent error state for form steps
  const [loading, setLoading] = React.useState(false);
  // const [error, setError] = React.useState(""); // Removed unused variable
 
  // Form validation function
  const validateForm = (values) => {
    const errors = {};

    // Step 1 validations
    if (!values.firstname?.trim()) errors.firstname = "First name is required";
    if (!values.lastname?.trim()) errors.lastname = "Last name is required";
    if (!values.phone?.trim()) errors.phone = "Phone number is required";
    if (values.phone && !/^\d{10}$/.test(values.phone.replace(/[^0-9]/g, ''))) {
      errors.phone = "Phone number must be 10 digits";
    }
    if (!values.upi?.trim()) errors.upi = "UPI is required";
    if (values.upi && !/^[\w.-]+@[\w.-]+$/.test(values.upi)) {
      errors.upi = "Please enter a valid UPI ID (e.g., user@paytm)";
    }

    // Step 2 validations
    if (!values.name?.trim()) errors.name = "Restaurant name is required";
    if (!values.restaurantAddress?.trim()) errors.restaurantAddress = "Restaurant address is required";
    if (!values.restaurantType?.trim()) errors.restaurantType = "Restaurant type is required";
    if (values.restaurantType === 'Other' && !values.restaurantTypeOther?.trim()) {
      errors.restaurantTypeOther = "Please specify the restaurant type";
    }

    return errors;
  };

  // Validate specific step
  const validateStep = (stepNumber) => {
    const errors = validateForm(form);
    if (stepNumber === 1) {
      return ['firstname', 'lastname', 'phone', 'upi'].some(field => errors[field]);
    } else if (stepNumber === 2) {
      return ['name', 'restaurantAddress', 'restaurantType'].some(field => errors[field]) ||
             (form.restaurantType === 'Other' && errors.restaurantTypeOther);
    }
    return false;
  };

  // Use form validation hook
  const {
    values: form,
    setValues: setFormState,
    errors,
    touched,
    handleChange,
    handleBlur,
  } = useFormValidation({
    firstname: "",
    lastname: "",
    phone: "",
    name: "",
    upi: "",
    restaurantAddress: DEFAULT_ADDRESS,
    restaurantType: "",
    restaurantTypeOther: "",
  }, validateForm);

  // Custom setForm to keep restaurantAddress equal to restaurantName
  const setForm = (updater) => {
    setFormState((prev) => {
      let next = typeof updater === "function" ? updater(prev) : updater;
      // If restaurantName is updated, set restaurantAddress to same value
      if (next.name !== undefined) {
        next = {
          ...next,
          restaurantAddress: next.restaurantAddress,
        };
      }
      return next;
    });
  };

  const handleNext = () => {
    // Validate step 1 before proceeding
    if (validateStep(1)) {
      showApiError("Please fill in all required fields correctly");
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
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
    // Validate step 2 before proceeding
    if (validateStep(2)) {
      showApiError("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);
    try {
      // Geocode address to get latitude and longitude
      let latitude = null;
      let longitude = null;
      try {
        const geoRes = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(form.restaurantAddress)}&key=${GOOGLE_API_KEY}`
        );
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          latitude = geoData.results[0].geometry.location.lat;
          longitude = geoData.results[0].geometry.location.lng;
        }
      } catch (geoErr) {
        // If geocoding fails, leave lat/lng null
      }
      // Service type: send array if both selected, else single value or empty
      let ambianceImageUrl = "";
      if (ambianceImage) {
        if (
          ambianceImage.startsWith("file://") ||
          ambianceImage.startsWith("content://")
        ) {
          // Local file, upload as file object
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
            if (imageUrl && !imageUrl.startsWith("http")) {
              imageUrl =
                SERVER_URL +
                (imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl);
            }
            ambianceImageUrl = imageUrl;
          } catch (err) {
            showApiError(err);
            ambianceImageUrl = "";
          }
        } else if (ambianceImage.startsWith("http")) {
          // Already a URL, use as is
          ambianceImageUrl = ambianceImage;
        } else if (ambianceImage.startsWith("data:image/")) {
          // Handle base64 data URL
          try {
            // Extract mime and base64 data
            const matches = ambianceImage.match(
              /^data:(image\/(png|jpeg|jpg));base64,(.+)$/
            );
            if (!matches) throw new Error("Invalid base64 image format");
            const mimeType = matches[1];
            const base64Data = matches[3];
            // Create a blob from base64 (browser only)
            let fileObj;
            if (typeof window !== "undefined" && window.File) {
              const byteCharacters = atob(base64Data);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: mimeType });
              const filename = `ambiance_${Date.now()}.${
                mimeType.split("/")[1]
              }`;
              fileObj = new File([blob], filename, { type: mimeType });
            } else {
              // React Native: just pass uri, name, type
              const filename = `ambiance_${Date.now()}.${
                mimeType.split("/")[1]
              }`;
              fileObj = {
                uri: ambianceImage,
                name: filename,
                type: mimeType,
              };
            }
            const data = await uploadImage(fileObj);
            let imageUrl = data.url;
            console.log(imageUrl, "imageUel");
            ambianceImageUrl = imageUrl;
          } catch (err) {
            showApiError(err);
            ambianceImageUrl = "";
          }
        } else {
          showApiError("Please select a valid image.");
          setLoading(false);
          return;
        }
      }

      // If you add logo upload, repeat the same logic for logo here

      // Always call upload API before registerManager
      const payload = {
        phone: form.phone || "",
        role_id: 1,
        ...form,
        ambianceImage: ambianceImageUrl,
        enableBuffet,
        enableVeg: pureVeg,
        enableNonveg: nonVeg,
        enableTableService: tableService,
        enableSelfService: selfService,
        restaurantType: form.restaurantType === 'Other' ? form.restaurantTypeOther : form.restaurantType,
        latitude,
        longitude,
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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#8D8BEA' }}>
          <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#8D8BEA' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
          
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Surface style={styles.formSurface}>
                 {/* <View style={styles.loginLinkContainer}>
                <Text style={styles.loginLinkText}>Already have an account? </Text>
                <Pressable onPress={() => router.push("/login")}>
                  <Text style={styles.loginLink}>Login here</Text>
                </Pressable>
              </View> */}
                <Pressable onPress={() => step === 1 ? router.push("/login") : setStep(1)}>
                  <Image
                    source={require("../assets/images/logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </Pressable>
                <View style={styles.formWrapper}>
                  {step === 1 && (
                    <View style={styles.stepBox}>
                      <View style={styles.stepFormAreaScroll}>
                        <FormInput
                          label="First Name *"
                          name="firstname"
                          value={form.firstname}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.firstname}
                          touched={touched.firstname}
                          type="text"
                        />
                        <FormInput
                          label="Last Name *"
                          name="lastname"
                          value={form.lastname}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.lastname}
                          touched={touched.lastname}
                          type="text"
                        />
                        <FormInput
                          label="Phone Number *"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.phone}
                          touched={touched.phone}
                          type="text"
                          keyboardType="phone-pad"
                        />
                        <FormInput
                          label="UPI *"
                          name="upi"
                          value={form.upi}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.upi}
                          touched={touched.upi}
                          type="text"
                        />
                      </View>
                    </View>
                  )}
                {step === 2 && (
                  <View style={styles.stepBox}>
                    {/* <View style={styles.backIconContainer}>
                      <IconButton
                        icon="arrow-left"
                        iconColor="#fff"
                        size={32}
                        onPress={handleBack}
                        style={styles.backIconButton}
                      />
                    </View> */}
                    <View style={styles.stepFormAreaScroll}>
                      <FormInput
                        label="Restaurant Name *"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.name}
                        touched={touched.name}
                        type="text"
                      />
                      <FormInput
                        label="Restaurant Address *"
                        name="restaurantAddress"
                        value={form.restaurantAddress}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.restaurantAddress}
                        touched={touched.restaurantAddress}
                        type="textarea"
                      />
                      {/* Use Current Location button below address */}
                      <Button
                        mode="contained"
                        style={styles.locationBtnStep2}
                        icon="crosshairs-gps"
                        onPress={handleUseCurrentLocation}
                      >
                        Use Current Location
                      </Button>
                      <FormInput
                        label="Restaurant Type *"
                        name="restaurantType"
                        value={form.restaurantType}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.restaurantType}
                        touched={touched.restaurantType}
                        type="select"
                        options={[
                          { label: "Multi-cuisine", value: "Multi-cuisine" },
                          { label: "Cafe", value: "Cafe" },
                          { label: "3 Star", value: "3 Star" },
                          { label: "5 Star", value: "5 Star" },
                          { label: "Other", value: "Other" },
                        ]}
                      />
                      {/* If 'Other' is selected, show a text input for custom value */}
                      {form.restaurantType === 'Other' && (
                        <FormInput
                          label="Enter Restaurant Type *"
                          name="restaurantTypeOther"
                          value={form.restaurantTypeOther}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.restaurantTypeOther}
                          touched={touched.restaurantTypeOther}
                          type="text"
                        />
                      )}
                       <Text style={styles.sectionTitleStep2Grid}>
                          Upload Ambiance Photo
                        </Text>
                        <Pressable
                          style={styles.photoUploadBoxStep2}
                          onPress={pickImage}
                        >
                          {ambianceImage ? (
                            <Image
                              source={{ uri: ambianceImage }}
                              style={styles.photoPreviewStep2}
                              onError={() =>
                                showApiError(
                                  "Image failed to load. Check the URL or server."
                                )
                              }
                            />
                          ) : (
                            <Image
                              source={require("../assets/images/camera-icon.png")}
                              style={styles.cameraIconStep2}
                            />
                          )}
                        </Pressable>
                      {/* Extra controls below the form, not inside it */}
                      <View style={{ marginTop: 4 }}>
                        <Text style={styles.sectionTitleStep2Grid}>
                        </Text>
                        <View style={styles.typeFoodGridRow}>
                          <View style={styles.typeFoodGridCol}>
                            <Pressable
                              style={[
                                styles.typeBoxStep2,
                                tableService && styles.typeBoxActiveStep2,
                              ]}
                              onPress={() => {
                                if (enableBoth) return; // Prevent toggling if both enabled
                                setTableService(!tableService);
                              }}
                            >
                              <Image
                                source={require("../assets/images/table_service.jpg")}
                                style={styles.typeIconStep2}
                              />
                            </Pressable>
                            <Text style={styles.typeLabelStep2Small}>
                              Table Service
                            </Text>
                          </View>
                          <View style={styles.typeFoodGridCol}>
                            <Pressable
                              style={[
                                styles.typeBoxStep2,
                                selfService && styles.typeBoxActiveStep2,
                              ]}
                              onPress={() => {
                                if (enableBoth) return; // Prevent toggling if both enabled
                                setSelfService(!selfService);
                              }}
                            >
                              <Image
                                source={require("../assets/images/self_service.jpg")}
                                style={styles.typeIconStep2}
                              />
                            </Pressable>
                            <Text style={styles.typeLabelStep2Small}>
                              Self Service
                            </Text>
                          </View>
                        </View>
                        <View style={styles.enableBothRowCenter}>
                          <Pressable
                            style={styles.checkboxRowStep2Grid}
                            onPress={() => {
                              if (!enableBoth) {
                                setEnableBoth(true);
                              } else {
                                setEnableBoth(false);
                                setTableService(false);
                                setSelfService(false);
                              }
                            }}
                          >
                            <View
                              style={[
                                styles.checkboxStep2,
                                enableBoth && styles.checkboxActiveStep2,
                              ]}
                            />
                            <Text style={styles.enableTextStep2Grid}>
                              Enable Both
                            </Text>
                          </Pressable>
                        </View>
                        <View style={styles.typeFoodGridRow}>
                          <View style={styles.typeFoodGridCol}>
                            <Pressable
                              style={[
                                styles.foodTypeBoxStep2,
                                styles.foodTypeBoxVeg,
                                pureVeg && styles.foodTypeBoxVegActive,
                              ]}
                              onPress={() => setPureVeg(!pureVeg)}
                              activeOpacity={0.8}
                            >
                              <Image
                                source={require("../assets/images/veg.png")}
                                style={styles.foodCircleVegStep2}
                              />
                            </Pressable>
                            <Text style={styles.foodLabelStep2}>Pure Veg</Text>
                          </View>
                          <View style={styles.typeFoodGridCol}>
                            <Pressable
                              style={[
                                styles.foodTypeBoxStep2,
                                styles.foodTypeBoxNonVeg,
                                nonVeg && styles.foodTypeBoxNonVegActive,
                              ]}
                              onPress={() => setNonVeg(!nonVeg)}
                              activeOpacity={0.8}
                            >
                              <Image
                                source={require("../assets/images/non-veg.png")}
                                style={styles.foodCircleNonVegStep2}
                              />
                            </Pressable>
                            <Text style={styles.foodLabelStep2}>Non Veg</Text>
                          </View>
                        </View>
                        <View style={styles.buffetRowGrid}>
                          <Pressable
                            style={styles.checkboxRowStep2Grid}
                            onPress={() => setEnableBuffet(!enableBuffet)}
                          >
                            <View
                              style={[
                                styles.checkboxStep2,
                                enableBuffet && styles.checkboxActiveStep2,
                              ]}
                            />
                            <Text style={styles.checkboxLabelStep2Grid}>
                              Enable Buffet
                            </Text>
                          </Pressable>
                        </View>

                      </View>
                    </View>
                  </View>
                )}
                </View>

            {/* Fixed bottom bar for Next/Register button */}
            <View style={styles.buttonContainer}>
              {step === 1 && (
                <Button
                  mode="contained"
                  style={styles.bottomButtonStep}
                  labelStyle={styles.buttonTextStep}
                  onPress={handleNext}
                  loading={loading}
                >
                  Next
                </Button>
              )}
              {step === 2 && (
                <View style={styles.buttonRow}>
                  {/* <Button
                    mode="outlined"
                    style={[styles.bottomButtonStep, styles.backButton]}
                    labelStyle={[styles.buttonTextStep, styles.backButtonText]}
                    onPress={handleBack}
                    disabled={loading}
                  >
                    Back
                  </Button> */}
                  <Button
                    mode="contained"
                    style={[styles.bottomButtonStep, styles.registerButton]}
                    labelStyle={styles.buttonTextStep}
                    onPress={handleRegister}
                    loading={loading}
                  >
                    Register
                  </Button>
                </View>
              )}

              {/* Login Link */}
             
            </View>
                </Surface>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
     
      );
 
    }

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, backgroundColor: "#8D8BEA" },
  appbar: { backgroundColor: "#8D8BEA", elevation: 0 },
  appbarTitle: { fontWeight: "bold", fontSize: 20, textAlign: "center" },
  formSurface: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 0,
    backgroundColor: "transparent",
    elevation: 0,
  },
  formWrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 120,
    marginBottom: 40,
    marginTop: 20,
    alignSelf: "center",
  },
  typeFoodGridRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    gap: 20,
  },
  input: {
    // ...existing input styles...
  },
  enableBothRowCenter: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    marginBottom: 16,
    marginTop: 8,
    flexDirection: "row",
  },
  buffetRowGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
    gap: 10,
    width: "100%",
    display: "flex",
  },
  checkboxRowStep2Grid: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    alignSelf: "center",
    marginLeft: 0,
  },
  photoUploadBoxStep2: {
    width: "100%",
    height: 200,
    backgroundColor: "#D9D9D9",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  typeIcon: { width: 60, height: 60, marginBottom: 5 },
  typeLabel: { fontSize: 14, fontWeight: "bold", color: "#333" },
  enableText: {
    fontSize: 13,
    color: "#7b6eea",
    marginVertical: 5,
    textAlign: "center",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#7b6eea",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  checkboxActive: { backgroundColor: "#7b6eea" },
  checkboxLabel: { fontSize: 14, color: "#333" },
  foodTypeRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  foodTypeBox: {
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#eae6ff",
    marginHorizontal: 10,
  },
  foodTypeBoxActive: {
    borderColor: "#7b6eea",
    borderWidth: 2,
    backgroundColor: "#d1c4e9",
  },
  foodCircle: { width: 30, height: 30, borderRadius: 15, marginBottom: 5 },
  foodLabel: { fontSize: 14, fontWeight: "bold", color: "#333" },
  photoUploadBox: {
    width: 180,
    height: 120,
    backgroundColor: "#eae6ff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  cameraIcon: { width: 60, height: 60 },
  photoPreview: { width: 120, height: 100, borderRadius: 10 },
  bottomBar: {
    padding: 16,
    backgroundColor: "#8D8BEA",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    alignItems: "center",
  },
  bottomButton: {
    borderRadius: 24,
    width: "95%",
    alignSelf: "center",
    paddingVertical: 10,
    backgroundColor: "#7b6eea",
    marginTop: 16,
  },
  outerStep1Box: {
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  innerStep1Box: {
    width: "100%",
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  formFullWidth: {
    width: "100%",
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  buttonBar: {
    display: "none",
  },
  fixedBottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "#8D8BEA",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 34,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  stepBox: {
    flex: 1,
    width: "100%",
    backgroundColor: "#8D8BEA",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  backIconContainer: {
    width: "100%",
    alignItems: "flex-start",
    paddingLeft: 8,
    paddingTop: 16,
    marginBottom: 16,
  },
  backIconButton: {
    margin: 0,
  },
  stepFormArea: {
    width: "90%",
    backgroundColor: "transparent",
    alignItems: "flex-start",
    marginBottom: 0,
    flex: 1,
    justifyContent: "flex-start",
  },
  stepFormAreaScroll: {
    width: "100%",
    maxWidth: 600,
    backgroundColor: "transparent",
    alignItems: "center",
    marginBottom: 0,
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 32,
    paddingTop: 0,
    alignSelf: "center",
  },
  inputStep: {
    width: "100%",
    alignSelf: "stretch",
    minHeight: 44,
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 15,
    borderWidth: 0,
    color: "#222",
  },
  labelStep: {
    color: "#fff",
    fontSize: 13,
    marginBottom: 4,
    marginLeft: 2,
  },
  requiredstyle: {
      color: 'red',
      fontSize: 16,
      fontWeight: 'bold',
    },
  fixedBottomBarStep: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "#8D8BEA",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    alignItems: "center",
    padding: 12,
    zIndex: 10,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  bottomButtonStep: {
    borderRadius: 12,
    width: "100%",
    minWidth: 280,
    maxWidth: 600,
    alignSelf: "center",
    paddingVertical: 10,
    backgroundColor: "#6c6cf2",
    marginTop: 0,
    marginBottom: 0,
    marginHorizontal: "auto",
    elevation: 3,
    height: 60,
  },
  buttonTextStep: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderColor: "#fff",
    borderWidth: 2,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 20,
  },
  registerButton: {
    flex: 1,
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  loginLinkText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "400",
  },
  loginLink: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  stepFormAreaStep2: {
    width: "92%",
    backgroundColor: "transparent",
    alignItems: "center",
    marginBottom: 0,
    flex: 1,
    justifyContent: "flex-start",
  },
  locationBtnStep2: {
    marginBottom: 24,
    backgroundColor: "#7b6eea",
    width: "100%",
    borderRadius: 12,
    alignSelf: "center",
  },
  sectionTitleStep2: {
    fontSize: 15,
    fontWeight: "bold",
    marginVertical: 8,
    textAlign: "center",
    color: "#fff",
  },
  sectionTitleStep2Grid: {
    fontSize: 16,
    fontWeight: "400",
    marginTop: 16,
    marginBottom: 16,
    textAlign: "center",
    color: "#fff",
    alignSelf: "center",
  },

  typeFoodGridCol: {
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },

  enableTextStep2Grid: {
    fontSize: 14,
    color: "#fff",
    marginRight: 8,
    fontWeight: "400",
  },

  checkboxLabelStep2Grid: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 6,
  },
  typeRowStep2: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  typeBoxStep2: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#7B6EEA",
    marginHorizontal: 0,
    borderWidth: 4,
    borderColor: "#7B6EEA",
    width: 110,
    height: 110,
  },
  typeBoxActiveStep2: {
    borderColor: "#fff",
    borderWidth: 4,
    backgroundColor: "#7B6EEA",
  },
  typeIconStep2: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  typeLabelStep2: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    flexWrap: "wrap",
    width: "100%",
    marginTop: 4,
  },
  typeLabelStep2Small: {
    fontSize: 15,
    fontWeight: "400",
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
  },
  foodTypeRowStep2: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  foodTypeBoxStep2: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    marginHorizontal: 0,
    borderWidth: 5,
    borderColor: "#fff",
    width: 110,
    height: 110,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 2.0,
    elevation: 4,
  },
  foodTypeBoxVeg: {
    borderColor: "#d0d0d0",
    borderWidth: 5,
    backgroundColor: "#fff",
  },
  foodTypeBoxNonVeg: {
    borderColor: "#d0d0d0",
    borderWidth: 5,
    backgroundColor: "#fff",
  },
  foodTypeBoxVegActive: {
    borderColor: "#1ca11c",
    borderWidth: 5,
    backgroundColor: "#fff",
  },
  foodTypeBoxNonVegActive: {
    borderColor: "#c22a2a",
    borderWidth: 5,
    backgroundColor: "#fff",
  },
  foodCircleVegStep2: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 12,
  },
  foodCircleNonVegStep2: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 12,
  },
  foodLabelStep2: {
    fontSize: 15,
    fontWeight: "400",
    color: "#fff",
    marginTop: 8,
    textAlign: "center",
  },
  enableTextStep2: {
    fontSize: 13,
    color: "#fff",
    marginVertical: 5,
    textAlign: "center",
  },
  checkboxRowStep2: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "center",
  },
  checkboxStep2: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 0,
    borderColor: "#fff",
    marginRight: 10,
    backgroundColor: "#fff",
  },
  checkboxActiveStep2: { backgroundColor: "#00ff00" },
  checkboxLabelStep2: { fontSize: 15, color: "#fff", fontWeight: "400" },

  cameraIconStep2: { width: 80, height: 80 },
  photoPreviewStep2: { width: "100%", height: 180, borderRadius: 10 },
});