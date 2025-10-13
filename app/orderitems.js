import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const OrderItems = () => {
  const router = useRouter();
  const { categoryId, restaurantId } = useLocalSearchParams();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // ✅ Mock: Replace with your real user data hook
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = {
          id: 19,
          firstname: "Navan",
          lastname: "Ij",
        };
        console.log("useUserData - Setting userId to:", profile.id);
        setUserId(profile.id);
      } catch (err) {
        console.error("Failed to get user data:", err);
      }
    };
    fetchUser();
  }, []);

  // ✅ Initialize menu data safely
  const initializeData = useCallback(async () => {
    if (!restaurantId || !categoryId) {
      console.warn("Missing restaurantId or categoryId");
      return;
    }

    console.log("initializeData: fetching menu items for category:", categoryId);
    setLoading(true);

    try {
      const response = await fetch(
        `http://13.127.228.119:8090/api/menuitems/${restaurantId}/${categoryId}`
      );
      const data = await response.json();

      if (!data || !Array.isArray(data.menuItems)) {
        console.warn("Invalid menu data:", data);
        setMenuItems([]);
      } else {
        console.log("✅ Menu items fetched:", data.menuItems.length);
        setMenuItems(data.menuItems.filter(Boolean));
      }
    } catch (err) {
      console.error("❌ Error fetching menu data:", err);
      setError(err.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, categoryId]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // ✅ Safe render of each item
  const renderMenuItem = (item, index) => {
    if (!item) return null;
    const imageSource = item.image ? { uri: item.image } : null;

    return (
      <View
        key={item.id || index}
        style={{
          margin: 8,
          padding: 12,
          backgroundColor: "#fff",
          borderRadius: 12,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>
          {item.name || "Unnamed Item"}
        </Text>
        {imageSource ? (
          <Image
            source={imageSource}
            style={{
              width: "100%",
              height: 120,
              borderRadius: 8,
              marginTop: 8,
            }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ color: "#666", marginTop: 8 }}>No image available</Text>
        )}
        <Text style={{ marginTop: 8 }}>
          ₹{item.price || "N/A"} • {item.description || "No description"}
        </Text>
      </View>
    );
  };

  // ✅ Render Section
  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 12,
          backgroundColor: "#fff",
          elevation: 3,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: "700", marginLeft: 12 }}>
          Menu Items
        </Text>
      </View>

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#333" />
          <Text style={{ marginTop: 8 }}>Loading menu...</Text>
        </View>
      ) : error ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "red" }}>Error: {error}</Text>
          <Pressable
            onPress={initializeData}
            style={{
              marginTop: 12,
              backgroundColor: "#333",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff" }}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 10 }}>
          {Array.isArray(menuItems) && menuItems.length > 0 ? (
            menuItems.map(renderMenuItem)
          ) : (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No items found
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};
p
export default OrderItems;
