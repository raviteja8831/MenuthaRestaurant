import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import OrderMostImg from "../assets/images/order_most.png";
import { router } from "expo-router";
import {
  chefLogout,
  fetchChefMessages,
  fetchChefOrders,
  updateOrderStatus,
} from "../api/chefApi";
import { setApiAuthToken } from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ChefHomeScreen() {
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chefName, setChefName] = useState("");
  const [loginAt, setLoginAt] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Use common user profile and token keys
        const userStr = await AsyncStorage.getItem("user_profile");
        const token = await AsyncStorage.getItem("auth_token");
        let user = null;
        if (token) {
          setApiAuthToken(token);
        }
        if (userStr) {
          user = JSON.parse(userStr);
          setChefName(user.firstname || user.name || "");
          setLoginAt(user.loginAT || "");
        }
        const ordersRes = await fetchChefOrders(user ? user.id : null);
        setOrders(ordersRes.orders || []);
        const msgRes = await fetchChefMessages(user ? user.id : null);
        setMessages(msgRes.messages || []);
      } catch (e) {}
      setLoading(false);
    };
    loadData();
  }, []);
  const handleOrderStatusUpdate = async (data) => {
    const response = await updateOrderStatus(data);
    if (response.status === "success") {
      const userStr = await AsyncStorage.getItem("user_profile");
      let user = null;
      if (userStr) {
        user = JSON.parse(userStr);
      }
      const ordersRes = await fetchChefOrders(user ? user.id : null);
      setOrders(ordersRes.orders || []);
    }
  };

  return (
    <View style={styles.container}>
      {/* Absolute icons at corners */}
      <Pressable
        style={styles.powerIcon}
        onPress={async () => {
          let user = null;
          const userStr = await AsyncStorage.getItem("user_profile");
          if (userStr) {
            user = JSON.parse(userStr);
            setChefName(user.firstname+ "" + user.lastname );
            setLoginAt(user.loginAT || "");
          }
           const logout = await chefLogout(user ? user.id : null);
           console.log("Logout:", logout);
          AsyncStorage.removeItem("auth_token");
          AsyncStorage.removeItem("user_profile");

          router.replace("/login");
        }}
      >
        <MaterialCommunityIcons name="power" size={28} color="#222" />
      </Pressable>
      <Pressable
        style={styles.bellIcon}
        onPress={() => setShowMsgModal(true)}
      >
        <MaterialCommunityIcons name="bell-outline" size={28} color="#222" />
      </Pressable>
      {/* Message Modal */}
      <Modal
        visible={showMsgModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMsgModal(false)}
      >
        <View style={styles.msgModalOverlay}>
          <View style={styles.msgModalCard}>
            <Text style={styles.msgModalTitle}>Messages</Text>
            {messages.length === 0 && (
              <Text style={styles.msgText}>No messages</Text>
            )}
            {messages.map((msg, i) => (
              <View key={i} style={styles.msgBox}>
                <Text style={styles.msgText}>{msg.message}</Text>
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.msgMeta}>
                    From: {msg.fromUser && (msg.fromUser.firstname || msg.fromUser.lastname)
                      ? `${msg.fromUser.firstname || ''} ${msg.fromUser.lastname || ''}`.trim()
                      : 'Unknown'}
                    {msg.fromUser && msg.fromUser.role && msg.fromUser.role.name ? ` (${msg.fromUser.role.name})` : ''}
                  </Text>
                  <Text style={styles.msgMeta}>
                    Sent: {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
                  </Text>
                </View>
              </View>
            ))}
            <Pressable
              style={styles.msgCloseBtn}
              onPress={() => setShowMsgModal(false)}
            >
              <MaterialCommunityIcons name="close" size={28} color="#222" />
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.profileImgRow}>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => router.push("/chef-profile")}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
            style={styles.profileImgLarge}
          />
        </Pressable>
      </View>
      {/* Name, login, filter row */}
      <View style={styles.nameRow}>
        <View>
          <Text style={styles.greetText}>Hi</Text>
          <Text style={styles.greetText}>{chefName || "Chef"}</Text>
          <Text style={styles.loginText}>{loginAt || ""}</Text>
        </View>
        <Pressable style={styles.filterIcon}>
          <MaterialCommunityIcons
            name="filter-variant"
            size={28}
            color="#1976d2"
          />
        </Pressable>
      </View>
      {/* Orders Title */}
      <Text style={styles.ordersTitle}>Your Orders</Text>
      {/* Orders List */}
      <View style={{ marginHorizontal: 16, marginTop: 8 }}>
        {loading ? (
          <ActivityIndicator color="#7b6eea" size="large" />
        ) : (
          orders.map((order, i) =>
            order.orderProducts.map((firstProduct, j) => {
              const menuItemName =
                firstProduct && firstProduct.menuitem
                  ? firstProduct.menuitem.name
                  : "Order";

              const tableNumber = order.tableId ? `Table ${order.tableId}` : "";

              return (
                firstProduct.id && (
                  <View
                    key={`${order.id}-${firstProduct.id || j}`}
                    style={styles.orderCard}
                  >
                    <View>
                      <Text style={styles.orderName}>{menuItemName}</Text>
                      <Text style={styles.orderTable}>{tableNumber}</Text>
                    </View>

                    <Image
                      source={OrderMostImg}
                      style={[
                        styles.orderIcon,
                        {
                          width: 32,
                          height: 32,
                          tintColor:
                            firstProduct.status == 1
                              ? "#f0ad4e"
                              : firstProduct.status == 2
                              ? "#5bc0de"
                              : firstProduct.status == 3
                              ? "#5cb85c"
                              : firstProduct.status == 4
                              ? "#0275d8"
                              : "#666",
                        },
                      ]}
                      resizeMode="contain"
                    />

                    <Modal
                      visible={firstProduct.showDropdown || false}
                      transparent={true}
                      animationType="fade"
                    >
                      <View style={styles.modalOverlay}>
                        <View
                          style={[styles.profileCard, { alignItems: "center" }]}
                        >
                          <Pressable
                            style={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              zIndex: 20,
                            }}
                            onPress={() => {
                              const updatedOrders = [...orders];
                              updatedOrders[i]["orderProducts"][
                                j
                              ].showDropdown = false;
                              setOrders(updatedOrders);
                            }}
                          >
                            <MaterialCommunityIcons
                              name="close"
                              size={28}
                              color="#222"
                            />
                          </Pressable>

                          <Text
                            style={{
                              fontWeight: "bold",
                              fontSize: 18,
                              marginBottom: 12,
                              color: "#6c63b5",
                            }}
                          >
                            Update Order Status
                          </Text>

                          {[
                            { id: 1, label: "Waiting", color: "#f0ad4e" },
                            { id: 2, label: "Preparing", color: "#5bc0de" },
                            { id: 3, label: "Ready", color: "#5cb85c" },
                            { id: 4, label: "Served", color: "#0275d8" },
                          ].map((status) => (
                            <Pressable
                              key={`${firstProduct.id || j}-${status.id}`}
                              style={[
                                styles.profileCloseBtn,
                                {
                                  backgroundColor:
                                    firstProduct.status === status.id
                                      ? status.color
                                      : "#a9a1e2",
                                  marginBottom: 8,
                                  width: "80%",
                                },
                              ]}
                              onPress={async () => {
                                const updatedOrders = [...orders];
                                updatedOrders[i]["orderProducts"][j].status =
                                  status.id;
                                updatedOrders[i]["orderProducts"][
                                  j
                                ].showDropdown = false;
                                setOrders(updatedOrders);
                                handleOrderStatusUpdate({
                                  id: firstProduct.id,
                                  status: status.id,
                                });
                                // Directly call updateOrderStatus here
                                /*  const response = await updateOrderStatus({
                                  id: firstProduct.id,
                                  status: status.id,
                                }); */
                              }}
                            >
                              <Text style={{ color: "white" }}>
                                {status.label}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    </Modal>

                    <Pressable
                      onPress={() => {
                        const updatedOrders = [...orders];
                        updatedOrders[i]["orderProducts"][
                          j
                        ].showDropdown = true;
                        setOrders(updatedOrders);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 8,
                      }}
                    >
                      <Text style={{ color: "#666", marginRight: 8 }}>
                        {firstProduct.status === 1
                          ? "Waiting"
                          : firstProduct.status === 2
                          ? "Preparing"
                          : firstProduct.status === 3
                          ? "Ready"
                          : firstProduct.status === 4
                          ? "Served"
                          : "Unknown"}
                      </Text>
                      <MaterialCommunityIcons
                        name="chevron-down"
                        size={24}
                        color="#666"
                      />
                    </Pressable>
                  </View>
                )
              );
            })
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#a9a1e2", paddingTop: 24 },
  powerIcon: { position: "absolute", top: 18, left: 24, zIndex: 10 },
  bellIcon: { position: "absolute", top: 18, right: 24, zIndex: 10 },
  profileImgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 32,
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  profileImgLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#fff",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 32,
    marginTop: 4,
    marginBottom: 8,
  },
  greetText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "bold",
    lineHeight: 20,
  },
  loginText: { fontSize: 13, color: "#222", marginTop: 2, fontWeight: "500" },
  filterIcon: {
    marginLeft: 18,
    backgroundColor: "#ece9fa",
    borderRadius: 20,
    padding: 6,
  },
  ordersTitle: {
    fontSize: 16,
    color: "#222",
    fontWeight: "bold",
    marginLeft: 16,
    marginTop: 24,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderName: { fontWeight: "bold", color: "#222", fontSize: 15 },
  orderTable: { color: "#333", fontSize: 13, marginTop: 2 },
  orderIcon: { marginLeft: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: "#ece9fa",
    borderRadius: 16,
    padding: 24,
    width: 320,
    alignItems: "center",
  },
  profileCircle: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  profileName: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 8,
    color: "#6c63b5",
  },
  profileStat: {
    fontSize: 15,
    color: "#333",
    marginBottom: 6,
    textAlign: "center",
  },
  profileCloseBtn: {
    marginTop: 12,
    backgroundColor: "#a9a1e2",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  messageCard: {
    backgroundColor: "#ece9fa",
    borderRadius: 16,
    padding: 24,
    width: 320,
    alignItems: "center",
  },
  messageTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
    color: "#6c63b5",
  },
  messageBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    width: "100%",
  },
  messageText: { color: "#333", fontSize: 15 },
  messageMeta: { color: "#888", fontSize: 12, marginTop: 4 },
  messageCloseBtn: {
    marginTop: 12,
    backgroundColor: "#a9a1e2",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  sendCard: {
    backgroundColor: "#ece9fa",
    borderRadius: 16,
    padding: 24,
    width: 320,
    alignItems: "center",
  },
  sendInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    width: "90%",
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  sendMsgInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    width: "90%",
    height: 80,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  sendBtn: {
    backgroundColor: "#a9a1e2",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginBottom: 8,
  },

  // Message Modal Styles
  msgModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  msgModalCard: {
    backgroundColor: "#d6d0f7",
    borderRadius: 24,
    marginTop: 24,
    padding: 18,
    width: "92%",
    alignItems: "center",
    elevation: 8,
  },
  msgModalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
    marginBottom: 10,
  },
  msgBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    width: "100%",
    minHeight: 60,
    marginBottom: 10,
  },
  msgText: { color: "#222", fontSize: 15, fontWeight: "500" },
  msgMeta: { color: "#888", fontSize: 12, marginTop: 2 },
  msgCloseBtn: {
    marginTop: 4,
    backgroundColor: "#ece9fa",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
});
