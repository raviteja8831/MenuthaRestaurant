import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  // Dimensions, (unused)
  ActivityIndicator,
  // Platform, (unused)
} from "react-native";
import { AlertService } from "../src/services/alert.service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  getOrderItemList,
  deleteOrder,
  // updateOrderStatus, (unused)
} from "../src/api/orderApi";
import { updateOrderStatus } from "../src/api/orderApi";
// import { addReview } from "./api/reviewsApi"; (unused)
import CommentModal from "../src/Modals/CommentModal";
import { useUserData } from "../src/services/getUserData";
// import * as Linking from "expo-linking"; (unused)

// PhonePe SDK import
import UpiService from "../src/services/UpiService";
import QRCode from "react-native-qrcode-svg";
// import { setApiAuthToken } from "./api/api"; (unused)
// import { getRestaurantById } from "./api/restaurantApi"; (unused)

// const { width, height } = Dimensions.get("window"); (unused)

export default function OrderSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [orderItems, setOrderItems] = useState([]);
  // const [orderDetails, setOrderDetails] = useState({}); (unused)
  const [loading, setLoading] = useState(false); // loading is used
  const [totalAmount, setTotalAmount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  // const [hasRated, setHasRated] = useState(false); (unused)
  // const [editingItem, setEditingItem] = useState(null); (unused)
  // const [removedItems, setRemovedItems] = useState([]); (unused)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paying] = useState(false); // Only 'paying' is used
  const [upiUrl, setUpiUrl] = useState("");
  // const [restaurantDetails, setRestaurantDetails] = useState({}); (unused)

  const { userId, error } = useUserData();

  // Always call hooks at the top level. Render error UI below if needed.

  function router_call() {
    router.push({
      pathname: "/menu-list",
      params: {
        restaurantId: params.restaurantId || "",
        ishotel: params.ishotel,
      },
    });
  }

  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteOrder(orderId);
      router_call();
    } catch (error) {
      console.error("Failed to delete order:", error);
      AlertService.error("Failed to delete order. Please try again.", "Error");
    }
  };

  useEffect(() => {
    if (!error) {
      initializeData();
    }
    // Only run initializeData if no error
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.orderID, userId, error]);

  const initializeData = async () => {
    try {
      setLoading(true);
      const menuItems = await getOrderItemList(params.orderID, userId);
      setOrderItems(menuItems.orderItems || []);
  // setOrderDetails(menuItems.order_details || {}); (unused)
      /*  const response = await getRestaurantById(params.restaurantId);
      if (response) {
        setRestaurantDetails(response);
      } */
    } catch (error) {
      console.error("Error initializing data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTotalAmount(
      orderItems.reduce((sum, item) => {
        const qty = parseInt(item.quantity) || 0;
        const price = parseInt(item.price) || 0;
        return sum + qty * price;
      }, 0)
    );

  }, [orderItems]);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router_call();
    }
  };

  const handleStarPress = (rating) => {
    setUserRating(rating);
  };



  const handleModalSubmit = async () => {
    if (params.orderID) {
      await handleDeleteOrder(params.orderID);
    }
    setIsModalOpen(false);
  };

  

  // const handleWebPaymentComplete = async (txnRef, upiId, amount) => {}; (unused)

  const handleSubmitAndPay = async () => {
    if (totalAmount <= 0) {
      AlertService.error("Total amount must be greater than 0 to pay.", "Invalid amount");
      return;
    }
    let payAmount = totalAmount;
    if (payAmount <= 30) {
      payAmount += 1; // Minimum order amount is 30
    } else if (payAmount > 30) {
      payAmount += 3;
    }
    // Generate UPI URL for QR code
    const response = await UpiService.initiatePayment({
      restaurantId: params.restaurantId,
      name: "Menutha Payment",
      amount: payAmount,
      transactionRef: "",
    });
    if (response && response.url) {
      setUpiUrl(response.url);
      // Opened UPI app; ask user to confirm once payment completes
      AlertService.info("UPI Payment initiated. After completing payment in your UPI app, press 'Complete Payment (Test)'.");
    } else if (response && response.status === 'failed') {
      AlertService.error('Failed to initiate UPI payment. Please install a UPI app.');
    } else if (response && response.status === 'error') {
      AlertService.error('Error initiating UPI payment. Please try again.');
    }
    console.log("UPI Payment Result:", response);
  };

  // Simulate or handle payment completion: call server to mark order completed
  const handlePaymentComplete = async () => {
    if (!params.orderID) {
      AlertService.error("No order ID available to complete payment.");
      return;
    }
    try {
      setLoading(true);
      // Build updatedItems payload expected by server: { id: orderProductId, quantity }
      const updatedItems = orderItems.map((it) => ({ id: it.id, quantity: it.quantity }));
      const removedItems = []; // you can collect items with quantity 0 if needed
      const payload = {
        totalAmount: totalAmount,
        updatedItems,
        removedItems,
      };
      const res = await updateOrderStatus(params.orderID, payload);
      console.log("Order update response:", res);
      AlertService.success("Payment recorded and order completed.");
      // After successful payment, navigate back to menu list
      router.push({ pathname: "/menu-list", params: { restaurantId: params.restaurantId || "", ishotel: params.ishotel } });
    } catch (err) {
      console.error("Failed to complete payment:", err);
      AlertService.error("Failed to complete payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const handleQuantityChange = async (itemId, change) => {}; (unused)

  const handleModalClose = () => {
    initializeData();
  };

  // Render error UI if error exists
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Error loading user data. Please try again.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: "#EBEBFF", padding: 15 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.mainScrollViewContent}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBackPress}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Your Order</Text>
          </View>
        </View>

        <Pressable
          style={styles.tableContainer}
          activeOpacity={1}
          // onPress={() => setEditingItem(null)} (editingItem unused)
        >
          <View style={styles.tableHeader}>
            <Text style={[styles.hcell, styles.statusColumn]}>Status</Text>
            <Text style={[styles.hcell, styles.orderColumn]}>Order</Text>
            <Text style={[styles.hcell, styles.qtyColumn]}>Qty</Text>
            <Text style={[styles.hcell, styles.priceColumn]}>Price</Text>
            <Text style={[styles.hcell, styles.totalColumn]}>Total</Text>
          </View>

          {orderItems.map((order) => (
            <View key={order.id} style={styles.tableRow}>
              <Text
                style={[
                  styles.cell,
                  styles.statusColumn,
                  order.status === 1 && { color: "#F4962A" },
                  order.status === 2 && { color: "#F4EE2A" },
                  order.status === 3 && { color: "#2AF441" },
                  order.status === 4 && { color: "#809782" },
                ]}
              >
                {order.statusText}
              </Text>
              <Text style={[styles.cell, styles.orderColumn]}>
                {order.menuItemName}
              </Text>
              <Text style={[styles.cell, styles.qtyColumn]}>
                {order.quantity}
              </Text>
              <Text style={[styles.cell, styles.priceColumn]}>
                {order.price}
              </Text>
              <Text style={[styles.cell, styles.totalColumn]}>
                {order.quantity * order.price}
              </Text>
            </View>
          ))}
        </Pressable>

        <View style={styles.totalRow}>
          <Text style={[styles.cell, styles.statusColumn]} />
          <Text style={[styles.cell, styles.orderColumn]}>Total</Text>
          <Text style={[styles.cell, styles.qtyColumn]} />
          <Text style={[styles.cell, styles.priceColumn]} />
          <Text style={[styles.cell, styles.totalColumn]}>{totalAmount}</Text>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.feedback}>
            Please Rate this Restaurant as a Feedback
          </Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => handleStarPress(star)}
                style={styles.starButton}
              >
                <MaterialCommunityIcons
                  name={star <= userRating ? "star" : "star-outline"}
                  size={28}
                  color={star <= userRating ? "#FFD700" : "#240d0dff"}
                />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.stampContainer}>
          <Text style={styles.thankYouText}>Thank you!</Text>
        </View>


        <Pressable
          style={[styles.payButton]}
          onPress={handleSubmitAndPay}
          disabled={paying}
        >
          {paying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payText}>Submit & Pay</Text>
          )}
        </Pressable>

        <Pressable
          style={[styles.payButton, { marginTop: 12, backgroundColor: '#28a745' }]}
          onPress={handlePaymentComplete}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payText}>Complete Payment (Test)</Text>
          )}
        </Pressable>

        {/* Show QR code for UPI payment as backup */}
        {upiUrl ? (
          <View style={{ alignItems: "center", marginVertical: 20 }}>
            <Text style={{ marginBottom: 10, fontWeight: "bold" }}>Or scan to pay with any UPI app:</Text>
            <QRCode value={upiUrl} size={180} />
          </View>
        ) : null}

        <CommentModal
          visible={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EBEBFF",
    padding: 15,
  },
  mainScrollView: {
    flex: 1,
  },
  mainScrollViewContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    zIndex: 1,
    padding: 5,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    marginBottom: 4,
    backgroundColor: "transparent",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    minHeight: 35,
  },
  hcell: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  cell: {
    fontSize: 14,
    color: "#333",
  },
  statusColumn: {
    width: 70,
    textAlign: "left",
    paddingLeft: 4,
  },
  orderColumn: {
    flex: 1,
    paddingLeft: 8,
    textAlign: "left",
  },
  qtyColumn: {
    width: 50,
    textAlign: "right",
    paddingRight: 8,
  },
  priceColumn: {
    width: 60,
    textAlign: "right",
    paddingRight: 8,
  },
  totalColumn: {
    width: 70,
    textAlign: "right",
    paddingRight: 8,
  },
  ratingSection: {
    backgroundColor: "transparent",
    padding: 20,
    marginVertical: 15,
  },
  feedback: {
    textAlign: "center",
    marginBottom: 15,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  stars: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  starButton: {
    padding: 5,
    marginHorizontal: 2,
  },
  stampContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
    height: 120,
  },
  thankYouText: {
    position: "absolute",
    fontSize: 80,
    fontWeight: "300",
    color: "rgba(0, 0, 0, 0.4)",
    fontStyle: "italic",
    transform: [{ rotate: "-15deg" }],
    marginTop: 20,
    marginLeft: 10,
    zIndex: 1,
  },
  payButton: {
    backgroundColor: "#8C8AEB",
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
  payText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});