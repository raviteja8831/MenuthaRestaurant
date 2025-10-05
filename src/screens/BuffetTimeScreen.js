import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Image,
  ScrollView,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { buffetsimescreenstyles } from "../styles/responsive";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";

// Extend the existing styles
Object.assign(buffetsimescreenstyles, {
  buffetCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    marginHorizontal: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    width: "95%",
    alignSelf: "center",
  },
  selectedCard: {
    backgroundColor: "#f0f0ff",
    borderColor: "#6c63ff",
    borderWidth: 1,
  },
  cardContent: {
    width: "100%",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardBody: {
    flexDirection: "column",
  },
  checkboxContainer: {
    padding: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#6c63ff",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxSelected: {
    backgroundColor: "#fff",
  },
  buffetName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  buffetMenu: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  buffetCardPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6c63ff",
    alignSelf: "flex-end",
  },
  qrCodeContainer: {
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  qrCodeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  qrCodeNote: {
    fontSize: 16,
    color: "#6c63ff",
    marginTop: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  qrCodeDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
});
// import { buffetData } from "./Mock/CustomerHome";
import { useEffect } from "react";
import { createBuffetOrder } from "../api/buffetOrder";
import { getRestaurantById } from "../api/restaurantApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getBuffetDetails } from "../api/buffetApi";

// UPI Payment imports
import UpiService from "../services/UpiService";
import QRCode from "react-native-qrcode-svg";
const BuffetTimeScreen = () => {
  const [persons, setPersons] = React.useState(0);
  const [currentBuffet, setcurrentBuffet] = React.useState([]);
  const [selectedBuffet, setSelectedBuffet] = React.useState(null);
  const [userId, setUserId] = React.useState(null);
  const params = useLocalSearchParams();

  // UPI Payment states
  const [paying, setPaying] = React.useState(false);
  const [upiUrl, setUpiUrl] = React.useState("");
  // const currentBuffet = buffetData[0];
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        const userProfile = await AsyncStorage.getItem("user_profile");
        if (userProfile) {
          const user = JSON.parse(userProfile);
          console.log("User Profile:", user); // Debug log
          setUserId(user.id);
          // Only fetch profile data if we have a userId
          if (user.id) {
            await fetchProfileData(user.id);
          }
        } else {
          console.log("No user profile found");
          router.push("/customer-login");
        }
      } catch (error) {
        console.error("Error initializing profile:", error);
        // AlertService.error("Error loading profile");
      }
    };

    initializeProfile();
  }, []);
  const handleBack = () => {
    router.push({
      pathname: "/menu-list",
      params: {
        hotelName: params.hotelName,
        hotelId: params.hotelId,
        ishotel: params.ishotel,
      },
    });
  };
  useFocusEffect(
    React.useCallback(() => {
      const fetchRestaurantData = async () => {
        try {
          if (params.hotelId) {
            const data = await getBuffetDetails(params.hotelId);
            console.log("Fetched restaurant data:", data);
            // Filter only active buffets
            const activeBuffets = Array.isArray(data)
              ? data.filter((buffet) => buffet.isActive === true)
              : [];
            setcurrentBuffet(activeBuffets);
          }
        } catch (error) {
          console.error("Error fetching restaurant details:", error);
          // Alert.alert("Error", "Failed to load restaurant details");
        }
      };

      fetchRestaurantData();
    }, [params.hotelId])
  );
  const handleCreateBuffetOrder = async () => {
    if (!selectedBuffet) {
      Alert.alert("Selection Required", "Please select a buffet option");
      return;
    }

    if (persons === 0) {
      Alert.alert("Invalid Count", "Please select number of persons");
      return;
    }

    try {
      setPaying(true);

      // Calculate total amount
      const totalAmount = selectedBuffet.price * persons;

      // Create buffet order object
      const orderObj = {
        userId: userId,
        restaurantId: params.hotelId || 1,
        persons: persons,
        buffetId: selectedBuffet.id,
        price: selectedBuffet.price,
        totalAmount: totalAmount,
      };

      // Create the buffet order
      const response = await createBuffetOrder(orderObj);

      if (response) {
        // Generate UPI URL for payment
        const upiResponse = await UpiService.initiatePayment({
          restaurantId: params.hotelId,
          name: "Buffet Order Payment",
          amount: totalAmount,
          transactionRef: `BUFFET_${Date.now()}`,
        });

        if (upiResponse && upiResponse.url) {
          setUpiUrl(upiResponse.url);
          Alert.alert(
            "Payment Required",
            `Please complete the payment of ₹${totalAmount} for your buffet order.\n\nPersons: ${persons}\nBuffet: ${selectedBuffet.name}`
          );
        }

        console.log("Buffet order created and UPI payment initiated:", {
          orderObj,
          totalAmount,
          upiResponse
        });
      }
    } catch (error) {
      console.error("Error creating buffet order:", error);
      Alert.alert("Error", "Failed to create buffet order. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <SafeAreaView style={buffetsimescreenstyles.container}>
      <Pressable
        style={buffetsimescreenstyles.backButton}
        onPress={handleBack}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
      </Pressable>
      <ScrollView
        contentContainerStyle={buffetsimescreenstyles.scrollContainer}
      >
        {/* Header */}

        <Text style={buffetsimescreenstyles.header}>Buffet Time</Text>

        {/* Clock Image */}
        <View style={buffetsimescreenstyles.centerContent}>
          <Image
            source={require("../assets/images/hotel-buffet-time.png")} // replace with your clock image
            style={buffetsimescreenstyles.clock}
            resizeMode="contain"
          />
        </View>

        {/* Buffet Table Image */}
        <Image
          source={require("../assets/images/hotel-buffet-table.png")} // replace with your buffet image
          style={buffetsimescreenstyles.buffet}
          resizeMode="contain"
        />

        {/* Buffet Info */}
        <View style={buffetsimescreenstyles.buffetInfo}>
          <Text style={buffetsimescreenstyles.buffetTitle}>
            Available Buffet Items
          </Text>

          {/* Buffet Cards */}
          {currentBuffet.map((buffet, index) => (
            <Pressable
              key={buffet.id}
              style={[
                buffetsimescreenstyles.buffetCard,
                selectedBuffet?.id === buffet.id &&
                  buffetsimescreenstyles.selectedCard,
              ]}
              onPress={() => {
                setSelectedBuffet(
                  selectedBuffet?.id === buffet.id ? null : buffet
                );
              }}
            >
              <View style={buffetsimescreenstyles.cardContent}>
                <View style={buffetsimescreenstyles.cardHeader}>
                  <Text style={buffetsimescreenstyles.buffetName}>
                    {buffet.name}
                  </Text>
                  <View style={buffetsimescreenstyles.checkboxContainer}>
                    <View
                      style={[
                        buffetsimescreenstyles.checkbox,
                        selectedBuffet?.id === buffet.id &&
                          buffetsimescreenstyles.checkboxSelected,
                      ]}
                    >
                      {selectedBuffet?.id === buffet.id && (
                        <MaterialCommunityIcons
                          name="check"
                          size={16}
                          color="#6c63ff"
                        />
                      )}
                    </View>
                  </View>
                </View>
                <View style={buffetsimescreenstyles.cardBody}>
                  <Text
                    style={buffetsimescreenstyles.buffetMenu}
                    numberOfLines={2}
                  >
                    {JSON.parse(buffet.menu || "[]").join(" • ")}
                  </Text>
                  <Text style={buffetsimescreenstyles.buffetCardPrice}>
                    ₹{buffet.price}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}

          <Text style={buffetsimescreenstyles.personsLabel}>
            No. of Persons
          </Text>
          <View style={buffetsimescreenstyles.personsInputContainer}>
            <Pressable
              style={buffetsimescreenstyles.personButton}
              onPress={() => setPersons(Math.max(0, persons - 1))}
            >
              <Text style={buffetsimescreenstyles.personButtonText}>-</Text>
            </Pressable>
            <TextInput
              style={buffetsimescreenstyles.personsInput}
              value={persons.toString()}
              keyboardType="numeric"
              onChangeText={(text) => {
                const value = parseInt(text) || 0;
                setPersons(Math.max(0, value));
              }}
            />
            <Pressable
              style={buffetsimescreenstyles.personButton}
              onPress={() => setPersons(persons + 1)}
            >
              <Text style={buffetsimescreenstyles.personButtonText}>+</Text>
            </Pressable>
          </View>
          <Text style={buffetsimescreenstyles.buffetItems}>
            {currentBuffet.buffetitems}
          </Text>
        </View>

        {/* Price */}
        <Text style={buffetsimescreenstyles.price}>
          Buffet Price Per Person Rs {selectedBuffet?.price}
        </Text>

        {/* Total Amount and Pay Button */}
        <View style={buffetsimescreenstyles.actionContainer}>
          <View style={buffetsimescreenstyles.totalContainer}>
            <Text style={buffetsimescreenstyles.totalLabel}>Total Amount:</Text>
            <Text style={buffetsimescreenstyles.totalAmount}>
              Rs {(selectedBuffet?.price || 0) * persons}
            </Text>
          </View>

          <Pressable
            style={[
              buffetsimescreenstyles.payButton,
              (persons === 0 || paying) && buffetsimescreenstyles.payButtonDisabled,
            ]}
            onPress={handleCreateBuffetOrder}
            disabled={persons === 0 || paying}
          >
            {paying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={buffetsimescreenstyles.payText}>Pay</Text>
            )}
          </Pressable>
        </View>

        {/* Show QR code for UPI payment */}
        {upiUrl ? (
          <View style={buffetsimescreenstyles.qrCodeContainer}>
            <Text style={buffetsimescreenstyles.qrCodeTitle}>Scan to pay with any UPI app:</Text>
            <QRCode value={upiUrl} size={180} />
            <Text style={buffetsimescreenstyles.qrCodeNote}>
              Amount: ₹{(selectedBuffet?.price || 0) * persons}
            </Text>
            <Text style={buffetsimescreenstyles.qrCodeDetails}>
              {persons} person{persons > 1 ? 's' : ''} • {selectedBuffet?.name}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BuffetTimeScreen;
