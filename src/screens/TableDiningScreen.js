import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useUserData } from "../services/getUserData";
import { useCallback } from "react";
import { createTableBooking, getAvailableTables } from "../api/tableBookingApi";
import { getBuffetDetails } from "../api/buffetApi";
import { createBuffetOrder } from "../api/buffetOrder";

// UPI Payment imports
import UpiService from "../services/UpiService";
import QRCode from "react-native-qrcode-svg";

const { width, height } = Dimensions.get("window");

const TableDiningScreen = () => {
  const params = useLocalSearchParams();
  const [tableCount, setTableCount] = useState(0);
  const { userId, error } = useUserData();
  const [loading, setLoading] = useState(false);
  const [tableorderlength, setTableOrderLength] = useState(0);
  const [availableTablesList, setAvailableTablesList] = useState([]);
  const [tableData, setTableData] = useState({
    totalTables: 0,
    reservedTables: 0,
    availableTables: 0,
    reservedTableNumbers: [],
  });
  const [selectedTables, setSelectedTables] = useState([]);

  // Buffet-related states
  const [buffetsList, setBuffetsList] = useState([]);
  const [currentBuffetIndex, setCurrentBuffetIndex] = useState(0);
  const [selectedBuffet, setSelectedBuffet] = useState(null);
  const [buffetLoading, setBuffetLoading] = useState(false);

  // UPI Payment states
  const [paying, setPaying] = useState(false);
  const [upiUrl, setUpiUrl] = useState("");

  useFocusEffect(
    useCallback(() => {
      console.log(
        "Screen focused, fetching data with hotelId:",
        params?.hotelId,
        userId
      );
      if (params?.hotelId) {
        fetchTableBookings();
        fetchBuffets();
      }
      return () => {
        console.log("Screen lost focus");
      };
    }, [params?.hotelId, userId])
  );

  const fetchTableBookings = async () => {
    try {
      setLoading(true);
      if (!params?.hotelId) {
        console.error("No hotelId provided");
        Alert.alert("Error", "No restaurant ID found.");
        return;
      }

      console.log("Calling API with hotelId:", params.hotelId);
      const response = await getAvailableTables(params.hotelId, userId);
      console.log("API Response:", response);

      if (response?.success && response?.data) {
        const {
          availableTables,
          totalTables,
          reservedTables,
          tables,
          availableTablesList,
        } = response.data;
        setTableOrderLength(availableTables);
        setTableData({
          totalTables,
          reservedTables,
          availableTables,
          reservedTableNumbers: [],
        });
        setAvailableTablesList(availableTablesList);
      } else {
        console.error("Invalid response format:", response);
        Alert.alert("Error", "Invalid data received from server.");
      }
    } catch (error) {
      console.error("Error in fetchTableBookings:", error);
      Alert.alert(
        "Error",
        "Failed to fetch table booking information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchBuffets = async () => {
    try {
      setBuffetLoading(true);
      if (!params?.hotelId) {
        console.error("No hotelId provided for buffets");
        return;
      }

      console.log("Fetching buffets for hotelId:", params.hotelId);
      const response = await getBuffetDetails(params.hotelId, userId);
      console.log("Buffets API Response:", response);

      if (response?.success && response?.data) {
        setBuffetsList(response.data);
        if (response.data.length > 0) {
          setSelectedBuffet(response.data[0]);
        }
      } else {
        console.error("Invalid buffets response format:", response);
      }
    } catch (error) {
      console.error("Error in fetchBuffets:", error);
      // Don't show alert for buffets as it's optional
    } finally {
      setBuffetLoading(false);
    }
  };

  const handleOrderBuffet = async () => {
    if (!selectedBuffet) {
      Alert.alert("No Buffet Selected", "Please select a buffet to order.");
      return;
    }

    try {
      setPaying(true);

      const orderData = {
        userId,
        restaurantId: params.hotelId,
        buffetId: selectedBuffet.id || selectedBuffet._id,
        buffetName: selectedBuffet.name,
        price: selectedBuffet.price,
        type: selectedBuffet.type,
        orderDate: new Date().toISOString(),
        status: "PAYMENT_PENDING"
      };

      console.log("Creating buffet order:", orderData);
      const response = await createBuffetOrder(orderData);

      if (response?.success) {
        // Initiate UPI payment
        const upiResponse = await UpiService.initiatePayment({
          restaurantId: params.hotelId,
          name: `Buffet Order - ${selectedBuffet.name}`,
          amount: selectedBuffet.price,
          transactionRef: `BUFFET_${Date.now()}`,
        });

        console.log("Buffet order created with PAYMENT_PENDING status:", response);

        // Immediately redirect to user profile screen
        Alert.alert(
          "Buffet Order Placed",
          "Buffet order placed successfully! Manager will verify your payment.",
          [
            {
              text: "OK",
              onPress: () => router.push({ pathname: "/user-profile" })
            }
          ]
        );
      } else {
        Alert.alert("Order Failed", "Failed to place buffet order. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleOrderBuffet:", error);
      Alert.alert("Error", "Failed to place buffet order. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  const handleBack = () => {
    router.push({
      pathname: "/HotelDetails",
      params: {
        // hotelName: params.hotelName,
        id: params.hotelId,
        // ishotel: params.ishotel,
      },
    });
  };

  const handlePay = async () => {
    if (tableCount === 0) {
      Alert.alert("No Tables Selected", "Please select at least one table to proceed.");
      return;
    }

    try {
      setPaying(true);

      // Calculate total amount (50 Rs per table)
      const totalAmount = tableCount * 50;

      // First create the table booking with PAYMENT_PENDING status
      const bookingResponse = await createTableBooking({
        userId,
        selectedTables,
        status: "PAYMENT_PENDING"
      });

      if (bookingResponse.success) {
        // Initiate UPI payment
        const upiResponse = await UpiService.initiatePayment({
          restaurantId: params.hotelId,
          name: "Table Reservation Payment",
          amount: totalAmount,
          transactionRef: `TABLE_${Date.now()}`,
        });

        console.log("Table booking created with PAYMENT_PENDING status:", {
          selectedTables,
          totalAmount,
          upiResponse
        });

        // Immediately redirect to user profile screen
        Alert.alert(
          "Booking Placed",
          "Table booking placed successfully! Manager will verify your payment.",
          [
            {
              text: "OK",
              onPress: () => router.push({ pathname: "/user-profile" })
            }
          ]
        );
      } else {
        Alert.alert("Booking Failed", "Failed to create table booking. Please try again.");
      }
    } catch (error) {
      console.error("Error in handlePay:", error);
      Alert.alert("Error", "Failed to process payment. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={34} color="#000" />
          </Pressable>
          <Text style={styles.headerTitle}>Table Booking</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Table Image */}
        <Image
          source={require("../assets/images/book-table.png")}
          style={styles.tableImage}
        />

        <View style={styles.counterContainer}>
        {/* Left Arrow */}
        <Pressable
          style={styles.counterButton}
          onPress={() => {
            if (tableCount > 0) {
              const newCount = tableCount - 1;
              setTableCount(newCount);
              // Remove the last selected table
              const updatedSelectedTables = [...selectedTables];
              const removedTable = updatedSelectedTables.pop();
              setSelectedTables(updatedSelectedTables);

              // Update availableTablesList by adding back the removed table
              if (removedTable) {
                setAvailableTablesList((prev) => [...prev, removedTable]);
              }
            }
          }}
        >
          <Image
            source={require("../assets/images/left-arrow.png")}
            style={styles.arrowImage}
          />
        </Pressable>

        {/* Number + Label */}
        <View style={styles.counterTextContainer}>
          <Text style={styles.counterNumber}>{tableCount}</Text>
          <Text style={styles.tableText}>
            {tableCount} {tableCount > 1 ? "Tables" : "Table"}
          </Text>
        </View>

        {/* Right Arrow */}
        <Pressable
          style={styles.counterButton}
          onPress={() => {
            if (
              tableCount < tableorderlength &&
              availableTablesList.length > 0
            ) {
              const newCount = tableCount + 1;
              setTableCount(newCount);

              // Take the first available table from the list
              const [selectedTable, ...remainingTables] = availableTablesList;
              setSelectedTables((prev) => [...prev, selectedTable]);
              setAvailableTablesList(remainingTables);
            }
          }}
        >
          <Image
            source={require("../assets/images/left-arrow.png")}
            style={[styles.arrowImage, styles.rightArrow]}
          />
        </Pressable>
      </View>

      {/* Buffet Selection Section */}
      {buffetsList.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Available Buffets</Text>
          <View style={styles.buffetContainer}>
            {/* Left Arrow */}
            <Pressable
              style={styles.buffetArrowButton}
              onPress={() => {
                if (currentBuffetIndex > 0) {
                  const newIndex = currentBuffetIndex - 1;
                  setCurrentBuffetIndex(newIndex);
                  setSelectedBuffet(buffetsList[newIndex]);
                }
              }}
              disabled={currentBuffetIndex === 0}
            >
              <Image
                source={require("../assets/images/left-arrow.png")}
                style={[
                  styles.buffetArrowImage,
                  currentBuffetIndex === 0 && styles.disabledArrow
                ]}
              />
            </Pressable>

            {/* Buffet Card */}
            <View style={styles.buffetCard}>
              {buffetLoading ? (
                <ActivityIndicator size="large" color="#5A4FCF" />
              ) : selectedBuffet ? (
                <>
                  <Text style={styles.buffetName}>{selectedBuffet.name || 'Buffet'}</Text>
                  <Text style={styles.buffetPrice}>₹{selectedBuffet.price || 0}</Text>
                  <Text style={styles.buffetDescription}>
                    {selectedBuffet.description || 'Delicious buffet meal'}
                  </Text>
                  <Text style={styles.buffetType}>
                    Type: {selectedBuffet.type || 'Standard'}
                  </Text>
                </>
              ) : (
                <Text style={styles.noBuffetText}>No buffet selected</Text>
              )}
            </View>

            {/* Right Arrow */}
            <Pressable
              style={styles.buffetArrowButton}
              onPress={() => {
                if (currentBuffetIndex < buffetsList.length - 1) {
                  const newIndex = currentBuffetIndex + 1;
                  setCurrentBuffetIndex(newIndex);
                  setSelectedBuffet(buffetsList[newIndex]);
                }
              }}
              disabled={currentBuffetIndex === buffetsList.length - 1}
            >
              <Image
                source={require("../assets/images/left-arrow.png")}
                style={[
                  styles.buffetArrowImage,
                  styles.rightArrow,
                  currentBuffetIndex === buffetsList.length - 1 && styles.disabledArrow
                ]}
              />
            </Pressable>
          </View>

          {/* Order Buffet Button */}
          <Pressable
            style={styles.orderBuffetButton}
            onPress={handleOrderBuffet}
            disabled={!selectedBuffet || buffetLoading}
          >
            <Text style={styles.orderBuffetButtonText}>
              Order Buffet - ₹{selectedBuffet?.price || 0}
            </Text>
          </Pressable>
        </>
      )}

      {/* Card Section */}
      <View style={styles.card}>
        <Text style={styles.text}>
          Number of tables in Restaurant: {tableData.totalTables || 0}
        </Text>
        <Text style={styles.text}>
          Number of tables reserved:{" "}
          {Math.max(
            0,
            (tableData.totalTables || 0) - tableData.availableTables
          )}
        </Text>
        <Text style={styles.text}>
          Number of tables available to book: {tableData.availableTables || 0}
        </Text>
        <Text style={styles.text}>
          Reserved table No:{" "}
          {selectedTables.length > 0
            ? selectedTables
                .map((table) => table.name || table.tableName)
                .join(", ")
            : "None"}
        </Text>
      </View>
      </View>

      {/* Bottom Info Container */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomTextContainer}>
          <Text style={styles.reservationText}>
            Each Table will cost 50 Rs{"\n"}to Reserve
          </Text>
          <Text style={styles.disclaimerText}>(Once Reserved No Refund)</Text>
          <Text style={styles.autoCancelText}>
            (Automatic it will cancel after 45 Min)
          </Text>
        </View>

        {/* Pay Button */}
        <Pressable
          style={[
            styles.payButton,
            (tableorderlength == 0 && tableCount == 0) || paying ? styles.disabledButton : null,
          ]}
          onPress={handlePay}
          disabled={tableorderlength === 0 || paying}
        >
          {paying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>
              {tableorderlength === 0
                ? "No Tables Available"
                : `Pay ${tableCount > 0 ? "₹" + tableCount * 50 : ""}`}
            </Text>
          )}
        </Pressable>

        {/* Show QR code for UPI payment - COMMENTED OUT */}
        {/* {upiUrl ? (
          <View style={styles.qrCodeContainer}>
            <Text style={styles.qrCodeTitle}>Scan to pay with any UPI app:</Text>
            <QRCode value={upiUrl} size={180} />
            <Text style={styles.qrCodeNote}>
              Amount: ₹{tableCount * 50}
            </Text>
          </View>
        ) : null} */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#BBBAEF",
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.35, // Increased to ensure card is fully visible
  },
  card: {
    backgroundColor: "#E2E2FF",
    borderRadius: 20,
    paddingVertical: height * 0.025,
    paddingHorizontal: width * 0.05,
    marginHorizontal: width * 0.05,
    marginTop: height * 0.015,
    marginBottom: height * 0.02,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    alignItems: "flex-start",
    minHeight: height * 0.16,
    justifyContent: "flex-start",
  },
  text: {
    fontSize: Math.min(width * 0.04, 16),
    color: "#000",
    marginBottom: height * 0.01,
    lineHeight: height * 0.028,
    fontWeight: "400",
    width: "100%",
    flexWrap: "wrap",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.015,
    marginTop: height * 0.01,
    paddingTop: height * 0.015,
    paddingHorizontal: width * 0.02,
  },
  backButton: {
    padding: width * 0.02,
  },
  headerTitle: {
    fontSize: Math.min(width * 0.065, 26),
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    flex: 1,
  },
  tableImage: {
    width: width * 0.7,
    height: height * 0.22,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: height * 0.02,
    marginBottom: height * 0.015,
  },
  // counterContainer: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   justifyContent: "space-between",
  //   marginBottom: height * 0.04,
  //   paddingHorizontal: width * 0.1,
  // },
  // counterButton: {
  //   width: width * 0.12,
  //   height: width * 0.12,
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
  // counterTextContainer: {
  //   alignItems: "center",
  //   width: width * 0.3,
  // },
  // counterNumber: {
  //   fontSize: Math.min(width * 0.08, 36),
  //   fontWeight: "bold",
  //   color: "#000",
  // },
  // tableText: {
  //   fontSize: Math.min(width * 0.035, 14),
  //   color: "#000",
  //   marginTop: height * 0.01,
  // },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: height * 0.025,
    paddingHorizontal: width * 0.1,
    paddingVertical: height * 0.02,
  },

  counterButton: {
    width: Math.min(width * 0.15, 60),
    height: Math.min(width * 0.15, 60),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  arrowImage: {
    width: Math.min(width * 0.12, 48),
    height: Math.min(width * 0.12, 48),
    resizeMode: "contain",
    tintColor: "#000",
  },

  rightArrow: {
    transform: [{ rotate: "180deg" }], // flips right arrow
  },

  counterTextContainer: {
    alignItems: "center",
    marginHorizontal: width * 0.08,
    minWidth: width * 0.25,
  },

  counterNumber: {
    fontSize: Math.min(width * 0.15, 60),
    fontWeight: "700",
    color: "#000",
  },

  tableText: {
    fontSize: Math.min(width * 0.045, 18),
    color: "#000",
    marginTop: height * 0.008,
    fontWeight: "500",
  },

  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.02,
    paddingBottom: Math.max(height * 0.03, 20),
    backgroundColor: "#BBBAEF",
    minHeight: height * 0.28,
    justifyContent: "space-between",
  },
  bottomTextContainer: {
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  reservationText: {
    fontSize: Math.min(width * 0.068, 28),
    fontWeight: "900",
    color: "#000",
    textAlign: "center",
    marginBottom: height * 0.01,
    lineHeight: Math.min(width * 0.088, 36),
  },
  disclaimerText: {
    fontSize: Math.min(width * 0.04, 16),
    color: "#FF0000",
    textAlign: "center",
    marginBottom: height * 0.008,
    fontWeight: "400",
  },
  autoCancelText: {
    fontSize: Math.min(width * 0.04, 16),
    color: "#000",
    textAlign: "center",
    marginBottom: height * 0.015,
    fontWeight: "400",
  },
  payButton: {
    width: width * 0.88,
    height: Math.min(height * 0.075, 65),
    backgroundColor: "#5A4FCF",
    borderRadius: Math.min(height * 0.0375, 32),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: height * 0.01,
    shadowColor: "#5A4FCF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: Math.min(width * 0.06, 26),
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  disabledButton: {
    backgroundColor: "#9994cc", // lighter version of #6C63FF
    opacity: 0.7,
  },
  qrCodeContainer: {
    alignItems: "center",
    marginTop: height * 0.02,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
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
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
    fontWeight: "600",
  },

  // Buffet Styles
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: height * 0.02,
    marginTop: height * 0.01,
  },
  buffetContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.02,
    paddingHorizontal: width * 0.05,
  },
  buffetArrowButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 20,
  },
  buffetArrowImage: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    tintColor: "#000",
  },
  disabledArrow: {
    opacity: 0.3,
  },
  buffetCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  buffetName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  buffetPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#5A4FCF",
    textAlign: "center",
    marginBottom: 8,
  },
  buffetDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 18,
  },
  buffetType: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
  },
  noBuffetText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  orderBuffetButton: {
    width: width * 0.8,
    height: 50,
    backgroundColor: "#FF6B35",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: height * 0.02,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  orderBuffetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default TableDiningScreen;
