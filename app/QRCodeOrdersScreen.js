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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchQRCodeOrders } from "../src/services/qrcodeService";
import { updateTable, deleteTable } from "../src/constants/tableApi";
import { showApiError } from "../src/services/messagingService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { updateOrderStatus } from "../src/constants/orderApi";

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
  const [actionMenuPos, setActionMenuPos] = useState({ x: 0, y: 0 });
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
      Alert.alert("Success", "Table name updated");
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
        Alert.alert("Error", "QR code not available");
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
      Alert.alert("Failed to download QR code");
    }
  };
  // Delete table (with confirm)
  const doDeleteTable = async () => {
    setEditLoading(true);
    try {
      await deleteTable(qrcode.id);
      setShowEditModal(false);
      Alert.alert("Deleted", "Table deleted");
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
            Alert.alert("Deleted", "Table deleted");
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
    const response = await updateOrderStatus(orderId, {
      status: "Completed",
    });
    fetch();
    console.log("Order cleared:", response);
    // TODO: Update order status to cleared
    if (response.status == "success") setActionMenuOrderId(null);
  };
  const handlePrintOrder = async (order) => {
    setActionMenuOrderId(null);
    // Compose HTML for PDF
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h2 { color: #6c63b5; }
            .section { margin-bottom: 18px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ece9fa; padding: 8px 12px; text-align: left; }
            th { background: #e6e1fa; color: #6c63b5; }
          </style>
        </head>
        <body>
          <h2>Order Details</h2>
          <div class="section"><b>Table Name:</b> ${qrcode.name || ""}</div>
          <div class="section"><b>Restaurant Name:</b> ${
            order.restaurantName || ""
          }</div>
          <div class="section">
            <table>
              <tr><th>Name</th><th>Contact</th><th>Time</th><th>Amount</th><th>Status</th></tr>
              <tr>
                <td>${order.name}</td>
                <td>${order.contact}</td>
                <td>${order.time ? String(order.time).slice(11, 19) : ""}</td>
                <td>${order.amount}</td>
                <td>${order.status}</td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share or Save PDF",
      });
    } catch (err) {
      Alert.alert("Error", "Failed to generate PDF");
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
      Alert.alert("Error", err.message || "Failed to load orders");
    }
    setLoading(false);
  };

  useEffect(() => {
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
              <QRCode value={editValue} size={64} getRef={qrSvgRef} />
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
                onPress={(event) => {
                  // Get the position of the pressed icon
                  event.target.measure((fx, fy, width, height, px, py) => {
                    setActionMenuPos({ x: px + width, y: py });
                    setActionMenuOrderId(item.id);
                  });
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
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                    activeOpacity={1}
                    onPressOut={() => setActionMenuOrderId(null)}
                  >
                    <View
                      style={{
                        position: "absolute",
                        left: actionMenuPos.x - 140, // adjust for menu width
                        top: actionMenuPos.y,
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        elevation: 12,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 12,
                        zIndex: 9999,
                        minWidth: 120,
                        borderWidth: 1,
                        borderColor: "#ece9fa",
                        paddingVertical: 4,
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
                    </View>
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
            borderRadius: 8,
            marginTop: 8,
            maxHeight: 340,
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
    fontWeight: "bold",
    fontSize: 20,
    color: "#222",
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
    color: "#222",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
    textAlign: "center",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#e6e1fa",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 6,
  },
  tableHeader: {
    flex: 1,
    color: "#6c63b5",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ece9fa",
    paddingVertical: 4,
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
  tableCell: { flex: 1, color: "#222", fontSize: 13, textAlign: "center" },
});

// ...removed duplicate styles...
