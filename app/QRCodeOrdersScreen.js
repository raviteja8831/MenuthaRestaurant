import React, { useEffect, useState, useRef } from "react";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import QRCode from "react-native-qrcode-svg";
import * as FileSystem from "expo-file-system";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  TextInput,
} from "react-native";
import { AlertService } from "../src/services/alert.service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchQRCodeOrders } from "../src/services/qrcodeService";
import { updateTable, deleteTable } from "../src/constants/tableApi";
import { showApiError } from "../src/services/messagingService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { updateOrderStatus, getOrderItemList } from "../src/api/orderApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PERIODS = [
  { label: "Week", value: "week" },
  { label: "Today", value: "today" },
  { label: "Month", value: "month" },
];

export default function QRCodeOrdersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // qrcode is passed as a param, but objects can't be passed directly in Expo Router, so pass id, name, etc. as params
  const qrcode = {
    id: params.id,
    name: params.name,
    // add more fields if needed
  };
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editValue, setEditValue] = useState(qrcode.name || "");
  const [editLoading, setEditLoading] = useState(false);
  const [actionMenuOrderId, setActionMenuOrderId] = useState(null);
  const [restaurantName, setRestaurantName] = useState("");
  // Handler for QR code edit
  const handleEditQRCode = () => {
    setShowEditModal(true);
    setEditValue(qrcode.name || "");
  };
  // Save edited table name
  const handleSaveQRCode = async () => {
    setEditLoading(true);
    try {
      await updateTable(qrcode.id, { name: editValue });
      setShowEditModal(false);
      AlertService.success("Table name updated", "Success");
      // Optionally reload orders or parent QR list
    } catch (err) {
      showApiError(err);
    }
    setEditLoading(false);
  };
  // Download QR code as PNG
  const handleDownloadQRCode = async () => {
    try {
      if (!qrSvgRef.current) {
        AlertService.error("QR code not available", "Error");
        return;
      }
      qrSvgRef.current.toDataURL(async (data) => {
        const base64Data = data.replace("data:image/png;base64,", "");
        if (Platform.OS === "web") {
          // Convert base64 to Blob and trigger download
          function base64ToBlob(base64, mime) {
            const byteChars = atob(base64);
            const byteNumbers = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) {
              byteNumbers[i] = byteChars.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            return new Blob([byteArray], { type: mime });
          }
          const blob = base64ToBlob(base64Data, "image/png");
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          // Save to file and share
          const fileUri =
            FileSystem.cacheDirectory + `${editValue || "qrcode"}.png`;
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          await Sharing.shareAsync(fileUri);
        }
      });
    } catch (_e) {
      AlertService.error("Failed to download QR code");
    }
  };
  // Delete table (with confirm)
  const doDeleteTable = async () => {
    setEditLoading(true);
    try {
      await deleteTable(qrcode.id);
      setShowEditModal(false);
      AlertService.success("Table deleted", "Deleted");
      // Optionally reload parent QR list or navigate away
    } catch (err) {
      showApiError(err);
    }
    setEditLoading(false);
  };
  const handleDeleteQRCode = async () => {
    Alert.alert("Delete Table", "Are you sure you want to delete this table?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setEditLoading(true);
          try {
            await deleteTable(qrcode.id);
            setShowEditModal(false);
            AlertService.success("Table deleted", "Deleted");
            // Optionally reload parent QR list or navigate away
            router.push("/qrcodes"); // Navigate to home or main screen
          } catch (err) {
            showApiError(err);
          }
          setEditLoading(false);
        },
      },
    ]);
  };
  // Ref for QR SVG
  const qrSvgRef = useRef();
  // Action menu handlers
  const handleClearOrder = async (orderId) => {
    try {
      await updateOrderStatus(orderId, {
        status: "CLEARED",
      });
      setActionMenuOrderId(null);
      fetch(); // Reload orders after clearing
      AlertService.success("Order cleared successfully");
    } catch (error) {
      console.error("Error clearing order:", error);
      AlertService.error("Failed to clear order");
    }
  };
  const handlePrintOrder = async (order) => {
    setActionMenuOrderId(null);

    // Fetch full order details with items
    let orderItems = [];
    try {
      const response = await getOrderItemList(order.id);
      orderItems = response?.orderItems || [];
    } catch (error) {
      console.error('Error fetching order items:', error);
      AlertService.error('Failed to fetch order items');
    }

    // Build order items HTML if available
    let orderItemsHTML = '';
    if (orderItems && Array.isArray(orderItems) && orderItems.length > 0) {
      orderItemsHTML = `
        <div class="section">
          <h3>Order Items</h3>
          <table>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
            ${orderItems.map(item => `
              <tr>
                <td>${item.menuItemName || ''}</td>
                <td>${item.quantity || 1}</td>
                <td>₹${item.price || 0}</td>
                <td>₹${(item.quantity || 1) * (item.price || 0)}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      `;
    }

    // Compose HTML for PDF
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h2 { color: #6c63b5; margin-bottom: 10px; }
            h3 { color: #6c63b5; margin-top: 16px; margin-bottom: 8px; font-size: 18px; }
            .section { margin-bottom: 18px; }
            .info { margin-bottom: 8px; }
            table { border-collapse: collapse; width: 100%; margin-top: 8px; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
            th { background: #e6e1fa; color: #6c63b5; font-weight: bold; }
            .total-row { font-weight: bold; background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h2>Order Receipt</h2>
          <div class="section">
            <div class="info"><b>Restaurant Name:</b> ${restaurantName || order.restaurant?.name || order.restaurantName || "N/A"}</div>
            <div class="info"><b>Table Name:</b> ${qrcode.name || "N/A"}</div>
            <div class="info"><b>Customer Name:</b> ${order.name || "N/A"}</div>
            <div class="info"><b>Contact:</b> ${order.contact || "N/A"}</div>
            <div class="info"><b>Order Time:</b> ${order.time ? String(order.time).slice(0, 19).replace('T', ' ') : "N/A"}</div>
            <div class="info"><b>Status:</b> ${order.status || "N/A"}</div>
          </div>
          ${orderItemsHTML}
          <div class="section">
            <div class="info"><b>Total Amount: ₹${order.amount || 0}</b></div>
          </div>
        </body>
      </html>
    `;
    try {
      // Use printAsync to show print dialog
      await Print.printAsync({ html });
      AlertService.success("Print initiated");
    } catch (err) {
      console.error("Print error:", err);
      AlertService.error("Failed to print", "Error");
    }
  };
  const handleDownloadOrder = (order) => {
    // TODO: Download order details logic
    setActionMenuOrderId(null);
  };
  const fetch = async () => {
    setLoading(true);
    try {
      const data = await fetchQRCodeOrders(qrcode.id, period);
      setOrders(data);
    } catch (err) {
      AlertService.error(err.message || "Failed to load orders", "Error");
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadRestaurantName = async () => {
      try {
        const userProfile = await AsyncStorage.getItem('user_profile');
        const parsed = JSON.parse(userProfile || '{}');
        setRestaurantName(parsed?.restaurant?.name || "");
      } catch (err) {
        console.error('Failed to load restaurant name', err);
      }
    };

    loadRestaurantName();
    if (qrcode.id) fetch();
  }, [period, qrcode.id]);

  const totalAmount = orders.reduce(
    (sum, o) => sum + (Number(o.amount) || 0),
    0
  );

  return (
    <View style={styles.container}>
      {/* QR code and edit icon */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 12,
          marginBottom: 8,
        }}
      >
        <Pressable
          onPress={() => {
            if (router.canGoBack && router.canGoBack()) {
              router.back();
            } else {
              router.replace("/"); // fallback to home or main screen
            }
          }}
          style={{ marginRight: 8 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </Pressable>
        <Text style={styles.tableTitle}>{editValue}</Text>
        <Pressable onPress={handleEditQRCode} style={{ marginLeft: 8 }}>
          <MaterialCommunityIcons name="pencil" size={22} color="#6c63b5" />
        </Pressable>
        <View style={{ flex: 1 }} />
        <View style={{ position: "relative", zIndex: 10000 }}>
          <Pressable
            style={styles.periodDropdown}
            onPress={() => setShowPeriodDropdown((v) => !v)}
          >
            <Text style={styles.periodText}>
              {PERIODS.find((p) => p.value === period)?.label}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color="#7b6eea"
            />
          </Pressable>
        </View>
      </View>

      {/* /* QR Code Edit Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#e6e1fa",
              borderRadius: 16,
              padding: 18,
              width: 260,
              alignItems: "flex-start",
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <QRCode
                value={JSON.stringify({
                  restaurantId: qrcode.id,
                  tableId: qrcode.id,
                  tableName: editValue,
                  type: 'table_order',
                  timestamp: Date.now()
                })}
                size={64}
                getRef={qrSvgRef}
              />
              <Pressable
                onPress={handleDeleteQRCode}
                style={{ marginLeft: 8 }}
              >
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={28}
                  color="#444"
                />
              </Pressable>
            </View>
            <Text style={{ marginTop: 12, fontWeight: "bold", color: "#222" }}>
              Name:
            </Text>
            <View
              style={{
                width: "100%",
                marginTop: 4,
                marginBottom: 12,
                backgroundColor: "#fff",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#ccc",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="table"
                size={20}
                color="#bbb"
                style={{ marginLeft: 8 }}
              />
              <TextInput
                value={editValue}
                onChangeText={setEditValue}
                maxLength={20}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  paddingHorizontal: 6,
                  color: "#222",
                }}
                placeholder="Table No/ Room No"
                placeholderTextColor="#888"
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                marginTop: 8,
                width: "100%",
                justifyContent: "flex-end",
              }}
            >
              <Pressable
                onPress={handleDownloadQRCode}
                style={{ marginRight: 16 }}
              >
                <MaterialCommunityIcons
                  name="download"
                  size={28}
                  color="#6c63b5"
                />
              </Pressable>
              <Pressable
                onPress={handleSaveQRCode}
                disabled={editLoading}
              >
                <MaterialCommunityIcons
                  name="content-save"
                  size={28}
                  color={editLoading ? "#aaa" : "#6c63b5"}
                />
              </Pressable>
            </View>
            <Pressable
              onPress={() => setShowEditModal(false)}
              style={{ position: "absolute", top: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="close" size={24} color="#888" />
            </Pressable>
          </View>
        </View>
      </Modal>
      {showPeriodDropdown && (
        <View
          style={[
            styles.periodDropdownMenu,
            { top: 58, right: 16, position: "absolute", zIndex: 10000 },
          ]}
        >
          {PERIODS.map((p) => (
            <Pressable
              key={p.value}
              style={styles.periodDropdownItem}
              onPress={() => {
                setPeriod(p.value);
                setShowPeriodDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.periodText,
                  { color: period === p.value ? "#4a148c" : "#7b6eea" },
                ]}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      <Text style={styles.totalText}>
        Total Transaction {PERIODS.find((p) => p.value === period)?.label} :{" "}
        <Text style={{ fontWeight: "bold" }}>{totalAmount}</Text>
      </Text>
      <View style={styles.tableHeaderRow}>
        <Text style={styles.tableHeader}>Name</Text>
        <Text style={styles.tableHeader}>Contact</Text>
        <Text style={styles.tableHeader}>Time</Text>
        <Text style={styles.tableHeader}>Amount</Text>
        <Text style={styles.tableHeader}>Status</Text>
      </View>
      {loading ? (
        <ActivityIndicator color="#6c63b5" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.name}</Text>
              <Text style={styles.tableCell}>{item.contact}</Text>
              <Text style={styles.tableCell}>
                {item.time ? String(item.time).slice(11, 19) : ""}
              </Text>
              <Text style={styles.tableCell}>{item.amount}</Text>
              <Text style={styles.tableCell}>{item.status}</Text>
              <Pressable
                onPress={() => {
                  setActionMenuOrderId(item.id);
                }}
                style={{ marginLeft: 4 }}
              >
                <MaterialCommunityIcons
                  name="dots-vertical"
                  size={22}
                  color="#6c63b5"
                />
              </Pressable>
              {/* Action menu for this order */}
              {actionMenuOrderId === item.id && (
                <Modal
                  visible={true}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setActionMenuOrderId(null)}
                >
                  <Pressable
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    activeOpacity={1}
                    onPress={() => setActionMenuOrderId(null)}
                  >
                    <Pressable
                      onPress={(e) => e.stopPropagation()}
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        elevation: 12,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 12,
                        zIndex: 9999,
                        minWidth: 160,
                        borderWidth: 1,
                        borderColor: "#ece9fa",
                        paddingVertical: 8,
                      }}
                    >
                      <Pressable
                        onPress={() => handleClearOrder(item.id)}
                        style={{
                          padding: 12,
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <MaterialCommunityIcons
                          name="delete-outline"
                          size={20}
                          color="#c22a2a"
                        />
                        <Text style={{ marginLeft: 8, color: "#c22a2a" }}>
                          Clear
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handlePrintOrder(item)}
                        style={{
                          padding: 12,
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <MaterialCommunityIcons
                          name="printer"
                          size={20}
                          color="#6c63b5"
                        />
                        <Text style={{ marginLeft: 8 }}>Print</Text>
                      </Pressable>
                    </Pressable>
                  </Pressable>
                </Modal>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: "#222", textAlign: "center", marginTop: 16 }}>
              No orders found.
            </Text>
          }
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            marginTop: 0,
            maxHeight: 500,
          }}
          contentContainerStyle={{
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#8D8BEA", padding: 12 },
  tableTitle: {
    flex: 1,
    fontWeight: "700",
    fontSize: 24,
    color: "#000",
    textAlign: "center",
  },
  periodDropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6e1fa",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  periodText: {
    color: "#7b6eea",
    fontWeight: "bold",
    fontSize: 15,
    marginRight: 4,
  },
  totalText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "400",
    marginBottom: 12,
    marginTop: 8,
    textAlign: "center",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  tableHeader: {
    flex: 1,
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  // Add dropdown menu styles
  periodDropdownMenu: {
    position: "absolute",
    top: 38,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    zIndex: 9999,
    minWidth: 110,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#ece9fa",
  },
  periodDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tableCell: { flex: 1, color: "#000", fontSize: 13, textAlign: "center", fontWeight: "400" },
});

// ...removed duplicate styles...
