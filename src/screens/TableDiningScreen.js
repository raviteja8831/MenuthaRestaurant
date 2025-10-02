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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useUserData } from "../services/getUserData";
import { useCallback } from "react";
import { createTableBooking, getAvailableTables } from "../api/tableBookingApi";

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

  useFocusEffect(
    useCallback(() => {
      console.log(
        "Screen focused, fetching data with hotelId:",
        params?.hotelId,
        userId
      );
      if (params?.hotelId) {
        fetchTableBookings();
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
      return;
    }
    const response = await createTableBooking({ userId, selectedTables });
    if (response.success) {
      setSelectedTables([]);
      setTableCount(0);
      setAvailableTablesList([]);
      setTableOrderLength(0);
      fetchTableBookings();
    }

    console.log("Navigating to Payment with params:", selectedTables);

    console.log("availableTablesList:", availableTablesList);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={34} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Table Dining</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Table Image */}
      <Image
        source={require("../assets/images/hotel-dining-table.png")}
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
            tableorderlength == 0 && tableCount == 0 && styles.disabledButton,
          ]}
          onPress={handlePay}
          disabled={tableorderlength === 0}
        >
          <Text style={styles.payButtonText}>
            {tableorderlength === 0
              ? "No Tables Available"
              : `Pay ${tableCount > 0 ? "₹" + tableCount * 50 : ""}`}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D8D8F6",
    paddingHorizontal: width * 0.05,
  },
  card: {
    backgroundColor: "#E8E7FF", // light purple shade
    borderRadius: 15,
    padding: 16,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,

    alignItems: "flex-start",
    width: "70%",
    marginLeft: "15%",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.02,
    marginTop: height * 0.02,
    paddingTop: height * 0.02,
  },
  backButton: {
    padding: width * 0.02,
  },
  headerTitle: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    flex: 1,
  },
  tableImage: {
    width: width * 0.75,
    height: height * 0.28,
    resizeMode: "contain",
    alignSelf: "center",
    // marginTop: height * 0.02,
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
    marginBottom: height * 0.04,
    backgroundColor: "#D8D8F6", // same lavender bg
    paddingVertical: 16,
    borderRadius: 12,
  },

  counterButton: {
    width: width * 0.12,
    height: width * 0.12,
    alignItems: "center",
    justifyContent: "center",
  },

  arrowImage: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  rightArrow: {
    transform: [{ rotate: "180deg" }], // flips right arrow
  },

  counterTextContainer: {
    alignItems: "center",
    width: width * 0.3,
  },

  counterNumber: {
    fontSize: Math.min(width * 0.08, 36),
    fontWeight: "bold",
    color: "#000",
  },

  tableText: {
    fontSize: 16,
    color: "#000",
    marginTop: 4,
  },

  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: width * 0.05,
    paddingBottom: height * 0.03,
  },
  bottomTextContainer: {
    marginBottom: height * 0.02,
  },
  reservationText: {
    fontSize: Math.min(width * 0.055, 24),
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: height * 0.015,
  },
  disclaimerText: {
    fontSize: Math.min(width * 0.035, 14),
    color: "red",
    textAlign: "center",
    marginBottom: height * 0.01,
  },
  autoCancelText: {
    fontSize: Math.min(width * 0.035, 14),
    color: "#000",
    textAlign: "center",
    marginBottom: height * 0.015,
  },
  payButton: {
    width: width * 0.9,
    height: height * 0.07,
    backgroundColor: "#6C63FF",
    borderRadius: width * 0.025,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: height * 0.02,
  },
  payButtonText: {
    color: "#FFF",
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#9994cc", // lighter version of #6C63FF
    opacity: 0.7,
  },
});

export default TableDiningScreen;
