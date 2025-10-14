import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ManagerOrderClearScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch paid orders that need to be cleared
  const fetchPaidOrders = async () => {
    try {
      setLoading(true);

      // Get manager info from storage
      const userStr = await AsyncStorage.getItem("user_profile");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user || !user.restaurantId) {
        Alert.alert("Error", "Manager information not found");
        return;
      }

      // API call to get paid orders for this restaurant
      const response = await fetch(`/api/manager/orders/paid/${user.restaurantId}`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem("auth_token")}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        Alert.alert("Error", "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching paid orders:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Clear/Complete an order after payment verification
  const clearOrder = async (orderId) => {
    Alert.alert(
      "Clear Order",
      "Have you verified the PhonePe payment and confirmed the customer has paid?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Clear Order",
          style: "default",
          onPress: async () => {
            try {
              setLoading(true);

              const response = await fetch(`/api/manager/orders/clear/${orderId}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${await AsyncStorage.getItem("auth_token")}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  status: 'COMPLETED',
                  clearedBy: 'MANAGER'
                })
              });

              if (response.ok) {
                Alert.alert("Success", "Order cleared successfully!");
                // Refresh the orders list
                fetchPaidOrders();
              } else {
                Alert.alert("Error", "Failed to clear order");
              }
            } catch (error) {
              console.error("Error clearing order:", error);
              Alert.alert("Error", "Network error. Please try again.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Refresh orders
  const onRefresh = () => {
    setRefreshing(true);
    fetchPaidOrders();
  };

  useEffect(() => {
    fetchPaidOrders();
  }, []);

  const renderOrderCard = (order) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderTitle}>Order #{order.id}</Text>
        <Text style={styles.orderTime}>
          {new Date(order.createdAt).toLocaleString()}
        </Text>
      </View>

      <View style={styles.customerInfo}>
        <Text style={styles.customerText}>
          Customer: {order.customer?.firstName} {order.customer?.lastName}
        </Text>
        <Text style={styles.phoneText}>
          Phone: {order.customer?.phoneNumber}
        </Text>
        {order.tableId && (
          <Text style={styles.tableText}>Table: {order.tableId}</Text>
        )}
      </View>

      <View style={styles.orderItems}>
        <Text style={styles.itemsTitle}>Items:</Text>
        {order.orderItems?.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.menuItemName}</Text>
            <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalAmount}>Total: ₹{order.totalAmount}/-</Text>

        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, styles.paidStatus]}>
            <Text style={styles.statusText}>PAID</Text>
          </View>

          <Pressable
            style={styles.clearButton}
            onPress={() => clearOrder(order.id)}
            disabled={loading}
          >
            <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
            <Text style={styles.clearButtonText}>Clear Order</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Order Management</Text>
        <Pressable
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={24}
            color={refreshing ? "#999" : "#000"}
          />
        </Pressable>
      </View>

      {/* Instructions */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          📱 Verify PhonePe payment screen before clearing orders
        </Text>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B4EFF" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-check" size={64} color="#999" />
            <Text style={styles.emptyTitle}>No Paid Orders</Text>
            <Text style={styles.emptyText}>
              All orders have been cleared or no paid orders available.
            </Text>
          </View>
        ) : (
          orders.map(renderOrderCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  instructionContainer: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  instructionText: {
    fontSize: 14,
    color: '#F57C00',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  orderTime: {
    fontSize: 12,
    color: '#666',
  },
  customerInfo: {
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  customerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  tableText: {
    fontSize: 14,
    color: '#666',
  },
  orderItems: {
    marginBottom: 15,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemName: {
    flex: 2,
    fontSize: 14,
    color: '#333',
  },
  itemQuantity: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  itemPrice: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    fontWeight: '600',
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'right',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  paidStatus: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});