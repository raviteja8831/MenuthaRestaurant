// orderitems.js (updated - defensive + ErrorBoundary)
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  SafeAreaView,
} from "react-native";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import CommentModal from "../src/Modals/menueditModal";
import { orderitemsstyle, responsiveStyles } from "../src/styles/responsive";
import { AlertService } from "../src/services/alert.service";
import { LinearGradient } from "expo-linear-gradient";
import { getitemsbasedonmenu, getSpecificMenu } from "../src/api/menuApi";
import {
  createOrder,
  getOrderItemList,
  deleteOrderItems,
} from "../src/api/orderApi";
import { useUserData } from "../src/services/getUserData";

// --- Category images mapping (unchanged) ---
const categoryImages = {
  beverage: require("../src/assets/images/bevereage.png"),
  soups: require("../src/assets/images/soup.png"),
  breakfast: require("../src/assets/images/breakfast.png"),
  starters: require("../src/assets/images/staters.png"),
  ibreads: require("../src/assets/images/indian-bread.png"),
  mc: require("../src/assets/images/main-course.png"),
  salads: require("../src/assets/images/salads.png"),
  iced: require("../src/assets/images/ice-cream-desserts.png"),
  liquor: require("../src/assets/images/liquor.jpg"),
};
const defaultCategoryImage = require("../src/assets/images/menu.png");

// --- Safe style access (fallback) ---
const safeStyles = (orderitemsstyle && typeof orderitemsstyle === "object")
  ? orderitemsstyle
  : {
      container: { flex: 1, padding: 16 },
      header: { flexDirection: "row", alignItems: "center", padding: 8 },
      backButton: {},
      headerContent: { marginLeft: 8 },
      title: { fontSize: 20 },
      scrollView: { flex: 1 },
      sectionHeader: { fontSize: 18, marginTop: 12, marginBottom: 6 },
      itemRow: { flexDirection: "row", alignItems: "center", padding: 8 },
      checkboxContainer: {},
      checkbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 1 },
      checkboxSelected: { backgroundColor: "#000" },
      itemInfo: { flex: 1, paddingHorizontal: 8 },
      itemName: { fontSize: 16 },
      dottedLine: { height: 1 },
      itemPrice: { fontSize: 14 },
      quantityContainer: { flexDirection: "row", alignItems: "center" },
      quantityButton: { padding: 6 },
      quantityButtonText: { fontSize: 16 },
      quantityText: { width: 30, textAlign: "center" },
      orderSummary: { padding: 12 },
      summaryText: { fontSize: 16 },
      placeOrderButton: { padding: 12, borderRadius: 8, alignItems: "center" },
      placeOrderButtonDisabled: { opacity: 0.6 },
      placeOrderButtonText: { color: "#fff" },
    };

// --- ErrorBoundary class to catch render-time errors ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // You can log the error to an error reporting service here
    console.error("ErrorBoundary caught an error:", error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <LinearGradient colors={["#C4B5FD", "#A78BFA"]} style={safeStyles.container}>
          <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 18, color: "#000", marginBottom: 8 }}>
              Something went wrong rendering this screen.
            </Text>
            <Text selectable style={{ color: "#333", marginHorizontal: 20 }}>
              {this.state.error ? String(this.state.error) : "Unknown error"}
            </Text>
          </SafeAreaView>
        </LinearGradient>
      );
    }
    return this.props.children;
  }
}

// --- Main component (capitalized) ---
export default function OrderItems() {
  // router + params (guard with default empty object)
  const router = useRouter();
  const rawParams = useLocalSearchParams() || {};
  // normalize params to a plain object with string values
  const params = { ...(rawParams || {}) };

  const isMounted = useRef(true);

  // State
  const [selectedItems, setSelectedItems] = useState([]);
  const [remove_list, setRemoveList] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [comment, setComment] = useState("");
  const [items, setItems] = useState([]);
  const [menuData, setMenuData] = useState(null);

  // custom hook (guarded)
  const userData = useUserData();
  const userId = userData?.userId;
  const error = userData?.error;

  // prev state ref
  const prevStateRef = useRef({ selectedCount: 0, removeListLength: 0 });

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Add to remove list w/o duplicates
  const addToRemoveList = useCallback((item) => {
    try {
      const id = item.orderItemId || item.id;
      setRemoveList((prev) => {
        if (!Array.isArray(prev)) return [{ orderItemId: id }];
        if (prev.some((r) => (r.orderItemId || r.id) === id)) return prev;
        return [...prev, { orderItemId: id }];
      });
    } catch (e) {
      console.error("addToRemoveList error:", e);
    }
  }, []);

  const getMenu = useCallback(async () => {
    try {
      if (!params?.category) {
        console.warn("getMenu: params.category missing");
        // still try to fetch if API can handle undefined, otherwise skip
      }
      const menu = await getSpecificMenu(params.category);
      if (isMounted.current && menu) {
        setMenuData(menu);
        console.log("Menu fetched:", menu);
      }
    } catch (err) {
      console.error("Error fetching menu:", err);
      if (isMounted.current) {
        AlertService?.error?.("Error fetching menu: " + (err?.message || "Unknown error"));
      }
    }
  }, [params?.category]);

  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("initializeData: fetching menu items for category:", params?.category);

      const menuItems = await getitemsbasedonmenu(params.category);
      if (!menuItems || !Array.isArray(menuItems)) {
        console.warn("initializeData: menuItems invalid:", menuItems);
        // set empty array so render won't crash
        if (isMounted.current) setItems([]);
        return;
      }

      let orderResponse = [];
      if (params.orderID && userId) {
        try {
          const ord_res = await getOrderItemList(params.orderID, userId);
          if (ord_res?.orderItems) {
            orderResponse = ord_res.orderItems;
          }
        } catch (orderError) {
          console.error("Error fetching order items:", orderError);
        }
      }

      const orderItems = orderResponse.reduce((acc, orderItem) => {
        if (orderItem?.menuItemId) acc[orderItem.menuItemId] = orderItem;
        return acc;
      }, {});

      const combinedItems = menuItems.map((item, index) => {
        try {
          if (!item || typeof item !== "object" || !item.id) {
            console.warn(`Invalid menu item at index ${index}:`, item);
            return null;
          }
          return {
            ...item,
            selected: !!orderItems[item.id],
            quantity: orderItems[item.id]?.quantity || 0,
            comments: orderItems[item.id]?.comments || "",
            orderItemId: orderItems[item.id]?.id || null,
          };
        } catch (itemError) {
          console.error(`Error processing menu item at index ${index}:`, itemError);
          return null;
        }
      }).filter(Boolean);

      if (isMounted.current) {
        const selected = combinedItems.filter((i) => i.selected);
        setItems(combinedItems);
        setSelectedItems(selected);
      }
    } catch (err) {
      console.error("initializeData error:", err);
      AlertService?.error?.("Failed to load menu data: " + (err?.message || "Unknown error"));
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [params?.category, params?.orderID, userId]);

  const initializeComponent = useCallback(() => {
    try {
      if (!params || !params.category) {
        // redirect back to menu-list if category missing
        console.warn("initializeComponent: missing params.category, redirecting to menu-list");
        setTimeout(() => {
          try {
            router.push({ pathname: "/menu-list" });
          } catch (e) {
            console.warn("router push failed", e);
          }
        }, 50);
      }
      getMenu();
      initializeData();
    } catch (e) {
      console.error("initializeComponent error:", e);
    }
  }, [params?.category, getMenu, initializeData, router]);

  useEffect(() => {
    initializeComponent();
  }, [initializeComponent]);

  // Create order
  const createOrder_data = async () => {
    if (!userId) {
      AlertService?.error?.("Please login to place an order");
      router.push({ pathname: "/customer-login" });
      return;
    }
    if (!params.restaurantId) {
      AlertService?.error?.("Restaurant not specified");
      // continue, but likely API will error
    }

    const sanitizedOrderItems = (selectedItems || []).map((it) => ({
      id: it.id,
      quantity: it.quantity,
      comments: it.comments || "",
      orderItemId: it.orderItemId || null,
    }));

    const order = {
      userId,
      restaurantId: params.restaurantId,
      total: totalCost,
      tableId: params.tableId,
      orderItems: sanitizedOrderItems,
      orderID: params.orderID || null,
      removedItems: remove_list.map((r) => ({ orderItemId: r.orderItemId || r.id })),
    };

    try {
      const response = await createOrder(order);
      if (isMounted.current) {
        await initializeData();
      }
      AlertService?.success?.("Order placed successfully");
      console.log("Order created:", response);
    } catch (err) {
      console.error("Error creating order:", err);
      AlertService?.error?.("Failed to place order");
    }

    setShowOrderModal(true);
    try {
      router.push({
        pathname: "/menu-list",
        params: { restaurantId: params.restaurantId, tableId: params.tableId },
      });
    } catch (e) {
      console.warn("router.push failed after order:", e);
    }
  };

  const deleteOrder_items = useCallback(async () => {
    const order = {
      userId,
      restaurantId: params.restaurantId,
      removedItems: remove_list.map((r) => ({ orderItemId: r.orderItemId || r.id })),
      orderID: params.orderID || null,
    };
    try {
      const response = await deleteOrderItems(order);
      if (isMounted.current) {
        await initializeData();
        setRemoveList([]);
      }
      console.log("Order items deleted:", response);
    } catch (err) {
      console.error("Error deleting order items:", err);
    }
    setShowOrderModal(true);
  }, [userId, params.restaurantId, params.orderID, remove_list, initializeData]);

  // Auto-delete when no items selected
  useEffect(() => {
    try {
      const selected = items.filter((i) => i.selected);
      const selectedCount = selected.length;
      const removeListLength = remove_list.length;

      if (
        selectedCount === 0 &&
        removeListLength > 0 &&
        (prevStateRef.current.selectedCount !== selectedCount ||
          prevStateRef.current.removeListLength !== removeListLength)
      ) {
        prevStateRef.current = { selectedCount, removeListLength };
        deleteOrder_items();
      } else {
        prevStateRef.current = { selectedCount, removeListLength };
      }
    } catch (e) {
      console.error("auto-delete effect error:", e);
    }
  }, [items, remove_list, deleteOrder_items]);

  // Item handlers
  const handleItemSelect = useCallback(
    (itemId) => {
      setItems((prevData) => {
        if (!Array.isArray(prevData)) return prevData;
        return prevData.map((item) => {
          if (!item || item.id !== itemId) return item;
          try {
            if (item.selected) {
              addToRemoveList(item);
            } else {
              setRemoveList((prev) =>
                (Array.isArray(prev) ? prev : []).filter(
                  (removedItem) =>
                    (removedItem.orderItemId || removedItem.id) !== (item.orderItemId || item.id)
                )
              );
            }
            return {
              ...item,
              selected: !item.selected,
              quantity: item.selected ? 0 : 1,
            };
          } catch (e) {
            console.error("handleItemSelect error for itemId", itemId, e);
            return item;
          }
        });
      });
    },
    [addToRemoveList]
  );

  const handleQuantityChange = useCallback(
    (itemId, increment) => {
      setItems((prevData) => {
        if (!Array.isArray(prevData)) return prevData;
        return prevData.map((item) => {
          if (!item || item.id !== itemId) return item;
          try {
            const newQuantity = Math.max(0, (item.quantity || 0) + increment);

            if (newQuantity === 0 && item.orderItemId) {
              addToRemoveList(item);
            } else if (newQuantity > 0) {
              setRemoveList((prev) =>
                (Array.isArray(prev) ? prev : []).filter(
                  (removedItem) =>
                    (removedItem.orderItemId || removedItem.id) !== (item.orderItemId || item.id)
                )
              );
            }

            return {
              ...item,
              quantity: newQuantity,
              selected: newQuantity > 0,
            };
          } catch (e) {
            console.error("handleQuantityChange error for itemId", itemId, e);
            return item;
          }
        });
      });
    },
    [addToRemoveList]
  );

  const handleEdit = useCallback((item) => {
    if (item?.id) {
      setSelectedItem(item.id);
      setComment(item.comments || "");
      setIsModalOpen(true);
    }
  }, []);

  const handleCommentSubmit = () => {
    try {
      setItems((prevSections) =>
        (Array.isArray(prevSections) ? prevSections : []).map((section) =>
          section.id === selectedItem ? { ...section, comments: comment } : section
        )
      );
      setSelectedItems((prev) =>
        (Array.isArray(prev) ? prev : []).map((item) =>
          item.id === selectedItem ? { ...item, comments: comment } : item
        )
      );
    } catch (e) {
      console.error("handleCommentSubmit error:", e);
    } finally {
      setIsModalOpen(false);
      setSelectedItem(null);
      setComment("");
    }
  };

  // Calculations using useMemo
  const { calculatedSelectedItems, calculatedTotalCost } = useMemo(() => {
    try {
      const selected = (items || []).filter((item) => item?.selected);
      const total = selected.reduce((sum, item) => {
        const price = parseInt(item?.price || 0, 10) || 0;
        return sum + price * (item?.quantity || 0);
      }, 0);
      return { calculatedSelectedItems: selected, calculatedTotalCost: total };
    } catch (e) {
      console.error("calculation useMemo error:", e);
      return { calculatedSelectedItems: [], calculatedTotalCost: 0 };
    }
  }, [items]);

  useEffect(() => {
    setSelectedItems(calculatedSelectedItems);
    setTotalCost(calculatedTotalCost);
  }, [calculatedSelectedItems, calculatedTotalCost]);

  // Group items by type for rendering (moved out of JSX)
  const groupedRendered = useMemo(() => {
    try {
      const grouped = (items || []).reduce((acc, item) => {
        if (!item || typeof item !== "object") return acc;
        const type = item.type || "Other";
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
      }, {});
      return grouped;
    } catch (e) {
      console.error("grouping useMemo error:", e);
      return {};
    }
  }, [items]);

  // Navigation back
  const handleBackPress = () => {
    const obj = { pathname: "/menu-list" };
    if (params.ishotel === "true") {
      obj.params = { hotelId: params.restaurantId || params.hotelId, ishotel: "true" };
    } else {
      obj.params = { restaurantId: params.restaurantId, tableId: params.tableId, ishotel: "false" };
    }
    try {
      router.push(obj);
    } catch (e) {
      console.warn("Back navigation failed:", e);
    }
  };

  // Loading / error states
  if (!userId && !error) {
    return (
      <LinearGradient colors={["#C4B5FD", "#A78BFA"]} style={[safeStyles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontSize: 18, color: "#333" }}>Loading...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={["#C4B5FD", "#A78BFA"]} style={[safeStyles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontSize: 18, color: "#333" }}>Error loading user data. Please try again.</Text>
      </LinearGradient>
    );
  }

  if (loading && (items || []).length === 0) {
    return (
      <LinearGradient colors={["#C4B5FD", "#A78BFA"]} style={[safeStyles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontSize: 18, color: "#333" }}>Loading menu...</Text>
      </LinearGradient>
    );
  }

  if (!Array.isArray(items)) {
    console.error("Items is not an array in render:", typeof items, items);
    return (
      <LinearGradient colors={["#C4B5FD", "#A78BFA"]} style={[safeStyles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontSize: 18, color: "#333" }}>Error loading menu items. Please try again.</Text>
      </LinearGradient>
    );
  }

  // --- Render wrapped in ErrorBoundary ---
  return (
    <ErrorBoundary>
      <LinearGradient colors={["#C4B5FD", "#A78BFA"]} style={safeStyles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={safeStyles.header}>
            <Pressable style={safeStyles.backButton} onPress={handleBackPress}>
              <MaterialCommunityIcons name="chevron-left" size={44} color="#000" />
            </Pressable>
            <View style={safeStyles.headerContent}>
              {menuData?.icon && categoryImages[menuData.icon] ? (
                <Image
                  source={categoryImages[menuData.icon]}
                  style={{ width: 60, height: 60, marginBottom: 8 }}
                  resizeMode="contain"
                />
              ) : (
                <Image
                  source={defaultCategoryImage}
                  style={{ width: 60, height: 60, marginBottom: 8 }}
                  resizeMode="contain"
                />
              )}
              <Text style={safeStyles.title}>
                {menuData?.name || params.categoryName || "Menu Items"}
              </Text>
            </View>
          </View>

          {/* Menu Items */}
          <ScrollView style={safeStyles.scrollView} showsVerticalScrollIndicator={false}>
            {Object.entries(groupedRendered).map(([type, typeItems]) => (
              <View key={type}>
                <Text style={safeStyles.sectionHeader}>{type}</Text>
                {typeItems.map((item) => (
                  <View key={item.id} style={safeStyles.itemRow}>
                    {params.ishotel === "false" && (
                      <Pressable style={safeStyles.checkboxContainer} onPress={() => handleItemSelect(item.id)}>
                        <View style={[safeStyles.checkbox, item.selected && safeStyles.checkboxSelected]}>
                          {item.selected && <MaterialIcons name="check" size={16} color="#fff" />}
                        </View>
                      </Pressable>
                    )}

                    <View style={safeStyles.itemInfo}>
                      <Text style={safeStyles.itemName}>{item.name}</Text>
                      <View style={safeStyles.dottedLine} />
                      <Text style={safeStyles.itemPrice}>₹{item.price}</Text>
                    </View>

                    {params.ishotel === "false" && item.selected && (
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={safeStyles.quantityContainer}>
                          <Pressable style={safeStyles.quantityButton} onPress={() => handleQuantityChange(item.id, -1)}>
                            <Text style={safeStyles.quantityButtonText}>-</Text>
                          </Pressable>
                          <Text style={safeStyles.quantityText}>{item.quantity}</Text>
                          <Pressable style={safeStyles.quantityButton} onPress={() => handleQuantityChange(item.id, 1)}>
                            <Text style={safeStyles.quantityButtonText}>+</Text>
                          </Pressable>
                        </View>

                        <Pressable onPress={() => handleEdit(item)} style={{ marginHorizontal: 6 }}>
                          <Feather name="edit-2" size={24} color="#000" />
                        </Pressable>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}

            {/* Order Summary */}
            {params.ishotel === "false" && (
              <View style={safeStyles.orderSummary}>
                <Text style={safeStyles.summaryText}>No of item Selected: {selectedItems.length}</Text>
                <Text style={safeStyles.summaryText}>Total Cost of Selection = ₹{totalCost}</Text>
                <Pressable
                  style={[
                    safeStyles.placeOrderButton,
                    responsiveStyles?.bg1,
                    selectedItems.length === 0 && safeStyles.placeOrderButtonDisabled,
                  ]}
                  onPress={createOrder_data}
                  disabled={selectedItems.length === 0}
                >
                  <Text style={safeStyles.placeOrderButtonText}>Place Order</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>

          {/* Comment Modal */}
          <CommentModal
            visible={isModalOpen}
            item={selectedItem}
            comment={comment}
            onChange={setComment}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCommentSubmit}
          />
        </SafeAreaView>
      </LinearGradient>
    </ErrorBoundary>
  );
}
