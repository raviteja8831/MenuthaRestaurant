import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Switch,
  Dimensions,
  ScrollView,
  useWindowDimensions,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import AddMenuItemScreen from "../src/screens/AddMenuItemScreen";
import { addMenuItem, updateMenuItemsStatus } from "../src/api/menuApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AlertService } from "../src/services/alert.service";
export default function MenuScreen() {
  const { width, height } = useWindowDimensions();
  const menuCategories = [
    { label: "Hot & Cold beverages", icon: "coffee" },
    { label: "Soups", icon: "bowl-mix" },
    { label: "Breakfast", icon: "bread-slice" },
    { label: "Starters", icon: "silverware-variant" },
    { label: "Indian Breads", icon: "food-variant" },
    { label: "Main Course", icon: "food" },
    { label: "Salads", icon: "leaf" },
    { label: "Ice creams & Desserts", icon: "ice-cream" },
    { label: "Liquor", icon: "liquor" },
  ];
  const categoryImages = {
    "beverage": require("../src/assets/images/bevereage.png"),
    "soups": require("../src/assets/images/soup.png"),
    "breakfast": require("../src/assets/images/breakfast.png"),
    "starters": require("../src/assets/images/staters.png"),
    "ibreads": require("../src/assets/images/indian-bread.png"),
    "mc": require("../src/assets/images/main-course.png"),
    "salads": require("../src/assets/images/salads.png"),
    "iced": require("../src/assets/images/ice-cream-desserts.png"),
    "liquor": require("../src/assets/images/liquor.jpg"),
  };
  const [enableAll, setEnableAll] = useState(false);
  // Placeholder: Replace with real menu item IDs from state/store
  const [menuItemIds, setMenuItemIds] = useState([1, 2, 3]);
  const [showAddModal, setShowAddModal] = useState(false);
  const alert = AlertService;

  const handleAddSave = async (item) => {
    try {
      // `item` should include menuId, name, type, price
      await addMenuItem(item);
      alert.success("Menu item added successfully!");
      setShowAddModal(false);
    } catch (error) {
      alert.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add menu item"
      );
    }
  };

  // Handler for Enable All switch
  const handleEnableAll = async (value) => {
    setEnableAll(value);
    try {
      await updateMenuItemsStatus(menuItemIds, value);
      alert.success(`All menu items ${value ? "enabled" : "disabled"}!`);
    } catch (error) {
      alert.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update status"
      );
    }
  };

  const isSmallScreen = width < 300;
  const iconSize = isSmallScreen ? 28 : 36;
  const cardWidth = Math.min(width / 2 - 32, 200);

  return (
    <>
  <View style={styles.container}>
      
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={() => router.replace("/dashboard")}
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
          </Pressable>
          <Text style={styles.title}>Menu</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Menu Grid */}
          <View style={styles.gridContainer}>
            {menuCategories.map((cat, idx) => (
              <Pressable
                key={cat.label}
                style={[styles.menuCard, { width: cardWidth }]}
              >
                {/*   <MaterialCommunityIcons
                  name={cat.icon}
                  size={iconSize}
                  color="#222"
                  style={{ marginBottom: 8 }}
                /> */}
                <Image
                  source={categoryImages[cat.label]}
                  resizeMode="contain"
                  style={
                    styles.categoryImage //,
                    // { width: "100px", height: "100px" }
                  }
                />
                <Text
                  style={[styles.menuLabel, isSmallScreen && { fontSize: 12 }]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Enable All */}
          {/*  <View style={styles.enableAllRow}>
            <Switch value={enableAll} onValueChange={handleEnableAll} />
            <Text style={styles.enableAllText}>Enable All</Text>
          </View> */}
        </ScrollView>

        {/* Add Button */}
        <Pressable
          style={[styles.addBtn, { width: width - 60 }]}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addBtnText}>+Add</Text>
        </Pressable>
      </View>
      <AddMenuItemScreen
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSave}
        // menuId={menuId}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8D8BEA",
    paddingTop: 40,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Space for the Add button
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
    justifyContent: "center",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    top: 0,
    zIndex: 2,
  },
  title: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 0,
    marginBottom: 20,
    textAlign: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 10,
  },
  menuCard: {
    minHeight: 80,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 8,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuLabel: {
    color: "#222",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  enableAllRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  enableAllText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
  },
  addBtn: {
    backgroundColor: "#7b6eea",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    width: Dimensions.get("window").width - 60,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  categoryImage: {
    width: "200px",
    height: "48px",
    marginBottom: "8px",
  },
});
