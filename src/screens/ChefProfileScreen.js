import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import RocketImg from "../assets/images/rocket.png";
import { router } from "expo-router";
import {
  fetchChefStats,
  fetchChefOrders,
  fetchChefMessages,
} from "../api/chefApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setApiAuthToken } from "../api/api";
import { IMG_BASE_URL } from "../constants/api.constants";

export default function ChefProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("auth_token");
        const user = await AsyncStorage.getItem("user_profile");

        if (token) {
          setApiAuthToken(token);
        }
        const statsRes = await fetchChefStats(
          user ? JSON.parse(user).id : null
        );
        setStats(statsRes);
        const chefProfile = await AsyncStorage.getItem("user_profile");
        const parsedProfile = chefProfile ? JSON.parse(chefProfile) : null;
        console.log("Chef profile loaded:", parsedProfile); // Debug log
        setProfile(parsedProfile);
      } catch (e) {
        console.error("Error loading chef profile:", e);
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Row: Back, Profile, Send */}
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </Pressable>
        <Image
          source={RocketImg}
          style={{ width: 32, height: 32 }}
          resizeMode="contain"
        />
      </View>
      <View style={{ alignItems: "center", marginTop: 8, marginBottom: 8 }}>
        {(() => {
          const imageUrl = profile?.profileImage || profile?.image_url;
          console.log("Profile image URL:", imageUrl); // Debug log

          if (imageUrl && typeof imageUrl === 'string') {
            const finalUrl = imageUrl.startsWith('http')
              ? imageUrl
              : `${IMG_BASE_URL}${imageUrl}`;
            console.log("Final image URL:", finalUrl); // Debug log

            return (
              <Image
                source={{ uri: finalUrl }}
                style={styles.profileImgLarge}
                onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
              />
            );
          } else {
            return (
              <View style={[styles.profileImgLarge, { backgroundColor: '#d1c4e9', alignItems: 'center', justifyContent: 'center' }]}>
                <MaterialCommunityIcons name="account-circle" size={100} color="#7b6eea" />
              </View>
            );
          }
        })()}
      </View>
      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator color="#7b6eea" size="large" />
        ) : (
          <View style={styles.row}>
            {/* Number of Items */}
            <View style={styles.itemsBox}>
              <Text style={styles.itemsTitle}>Number of Items</Text>
              {stats?.menuItems?.map((item, i) => (
                <Text key={i} style={styles.itemText}>
                   {item.name}
                </Text>
              ))}
            </View>
            {/* Stats */}
            <View style={styles.statsCol}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Order Completed</Text>
                <Text style={styles.statValue}>
                  {stats?.totalOrders ?? "-"}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>No of Working Days</Text>
                <Text style={styles.statValue}>
                  {stats?.workingDays ?? "-"}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Most Ordered Dish</Text>
                {stats?.mostOrdered?.map?.((dish, i) => (
                  <Text key={i} style={styles.mostOrderedText}>
                    {"\u2022"} {dish.menuitem?.name || "-"}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        )}
        {/* Login Hours (placeholder) */}
        <Text style={styles.loginHours}>
          Login Hours : {stats?.todayStats.loginHours} Hrs
        </Text>

        {/* Orders grouped by Today and Yesterday */}
        {stats?.orders && stats.orders.length > 0 && (
          <View style={{ width: "100%", marginTop: 16, paddingHorizontal: 16 }}>
            {/* Helper to group orders by date */}
            {(() => {
              const today = new Date();
              const yesterday = new Date();
              yesterday.setDate(today.getDate() - 1);
              const isSameDay = (d1, d2) =>
                d1.getFullYear() === d2.getFullYear() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getDate() === d2.getDate();
              const ordersToday = stats.orders.filter((order) =>
                isSameDay(new Date(order.createdAt), today)
              );
              const ordersYesterday = stats.orders.filter((order) =>
                isSameDay(new Date(order.createdAt), yesterday)
              );
              return (
                <>
                  <Text style={styles.orderSectionTitle}>Today</Text>
                  {ordersToday.length === 0 ? (
                    <Text style={styles.noOrderMsg}>No orders for today</Text>
                  ) : (
                    ordersToday.map((order, i) => {
                      const firstProduct =
                        order.orderProducts && order.orderProducts[0];
                      const menuItemName =
                        firstProduct && firstProduct.menuitem
                          ? firstProduct.menuitem.name
                          : "Order";
                      const tableNumber = order.tableId
                        ? `Table No ${order.tableId}`
                        : "";
                      const time = order.createdAt
                        ? new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "";
                      return (
                        <View key={order.id || i} style={styles.orderRow}>
                          <Text style={styles.orderRowText}>
                            {menuItemName}{" "}
                            {firstProduct && firstProduct.quantity
                              ? `${firstProduct.quantity} Nos`
                              : ""}{" "}
                            {tableNumber}
                          </Text>
                          <Text style={styles.orderRowTime}>{time}</Text>
                        </View>
                      );
                    })
                  )}
                  <Text style={styles.orderSectionTitle}>Yesterday</Text>
                  {ordersYesterday.length === 0 ? (
                    <Text style={styles.noOrderMsg}>
                      No orders for yesterday
                    </Text>
                  ) : (
                    ordersYesterday.map((order, i) => {
                      const firstProduct =
                        order.orderProducts && order.orderProducts[0];
                      const menuItemName =
                        firstProduct && firstProduct.menuitem
                          ? firstProduct.menuitem.name
                          : "Order";
                      const tableNumber = order.tableId
                        ? `Table No ${order.tableId}`
                        : "";
                      const time = order.createdAt
                        ? new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "";
                      return (
                        <View key={order.id || i} style={styles.orderRow}>
                          <Text style={styles.orderRowText}>
                            {menuItemName}{" "}
                            {firstProduct && firstProduct.quantity
                              ? `${firstProduct.quantity} Nos`
                              : ""}{" "}
                            {tableNumber}
                          </Text>
                          <Text style={styles.orderRowTime}>{time}</Text>
                        </View>
                      );
                    })
                  )}
                </>
              );
            })()}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#bcb3f7" },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 16,
  },
  profileImg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
    marginTop: 8,
    backgroundColor: "#e6e0fa",
  },
  profileImgLarge: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#e6e0fa",
  },
  chefName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 12,
    textShadowColor: "#6c63b5",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  restaurantId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginTop: 4,
    opacity: 0.9,
  },
  scrollContent: {
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "center",
    marginTop: 8,
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  itemsBox: {
    backgroundColor: "#e6e0fa",
    borderRadius: 16,
    padding: 14,
    width: 140,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#d1c4e9",
  },
  itemsTitle: {
    fontWeight: "700",
    color: "#333",
    fontSize: 16,
    marginBottom: 12,
  },
  itemText: { color: "#333", fontSize: 14, marginBottom: 4, fontWeight: "400" },
  statsCol: { flex: 1, flexDirection: "column", gap: 18 },
  statBox: {
    backgroundColor: "#e6e0fa",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 12,
    minWidth: 170,
    borderWidth: 1,
    borderColor: "#d1c4e9",
  },
  statLabel: {
    color: "#333",
    fontWeight: "400",
    fontSize: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 80,
    color: "#999",
    fontWeight: "900",
    textAlign: "center",
    marginTop: 4,
  },
  mostOrderedText: {
    color: "#333",
    fontSize: 14,
    textAlign: "left",
    fontWeight: "400",
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  loginHours: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 32,
    alignSelf: "center",
    marginTop: 24,
    textShadowColor: "#7b6eea",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  orderSectionTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 0,
  },
  orderRow: {
    backgroundColor: "#e6e0fa",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  orderRowText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "400",
    flex: 1,
  },
  orderRowTime: {
    color: "#333",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 12,
    minWidth: 60,
    textAlign: "right",
  },
  noOrderMsg: {
    color: "#888",
    fontSize: 15,
    fontStyle: "italic",
    marginBottom: 8,
    marginLeft: 2,
  },
});
