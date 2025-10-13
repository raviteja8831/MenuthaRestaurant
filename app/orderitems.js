import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  ImageBackground,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserData } from "../src/services/getUserData";

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

// Icon mapping object
const iconMapping = {
  "cup-outline": "cup-outline",
  "coffee": "coffee",
  "glass-cocktail": "glass-cocktail",
  "cup": "cup-outline",
  "beverage": "cup-outline",
  "drinks": "cup-outline",
  "bowl-mix-outline": "bowl-mix-outline",
  "bowl-outline": "bowl-outline",
  "pot-steam-outline": "pot-steam-outline",
  "soup": "bowl-mix-outline",
  "bread-slice-outline": "bread-slice-outline",
  "food-croissant": "food-croissant",
  "egg-fried": "egg-fried",
  "breakfast": "bread-slice-outline",
  "bread": "bread-slice-outline",
  "food-drumstick-outline": "food-drumstick-outline",
  "food-variant": "food-variant",
  "silverware-fork-knife": "silverware-fork-knife",
  "starters": "silverware-fork-knife",
  "appetizers": "silverware-fork-knife",
  "circle-outline": "circle-outline",
  "food-off-outline": "food-off-outline",
  "layers-outline": "layers-outline",
  "indian_bread": "layers-outline",
  "silverware-clean": "silverware-clean",
  "food": "food",
  "bowl-mix": "bowl-mix",
  "main_course": "food",
  "main": "food",
  "leaf": "leaf",
  "food-apple-outline": "food-apple-outline",
  "salad": "food-apple-outline",
  "salads": "food-apple-outline",
  "ice-cream": "ice-cream",
  "cake-variant-outline": "cake-variant-outline",
  "candy-outline": "candy-outline",
  "dessert": "ice-cream",
  "desserts": "ice-cream",
  "ice_cream": "ice-cream",
  "food-outline": "food-outline"
};

const defaultIcon = "food-outline";
const defaultCategoryImage = require("../src/assets/images/menu.png");

export default function orderitems() {
  // ========== ALL HOOKS FIRST ==========
  const router = useRouter();
  const params = useLocalSearchParams();
  const isMounted = useRef(true);

  // State hooks
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

  // Custom hooks
  const { userId, error } = useUserData();

  // Ref for tracking previous state
  const prevStateRef = useRef({ selectedCount: 0, removeListLength: 0 });

  // ========== MOUNT TRACKING ==========
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ========== HELPER FUNCTIONS ==========

  // Add item to remove_list without duplicates
  const addToRemoveList = useCallback((item) => {
    const id = item.orderItemId || item.id;
    setRemoveList((prev) => {
      if (prev.some((r) => (r.orderItemId || r.id) === id)) return prev;
      return [...prev, { orderItemId: item.orderItemId || item.id }];
    });
  }, []);

  // Fetch menu details
  const getMenu = useCallback(async () => {
    try {
      if (!params?.category) {
        console.error('No category provided for getMenu');
        return;
      }

      const menu = await getSpecificMenu(params.category);
      if (isMounted.current && menu) {
        setMenuData(menu);
        console.log("Menu fetched:", menu);
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
      if (isMounted.current) {
        AlertService.error("Error fetching menu: " + (error?.message || 'Unknown error'));
      }
    }
  }, [params?.category]);

  // Initialize menu items with order data
  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching menu items for category:', params?.category);

      if (!params?.category) {
        console.error('No category provided');
        return;
      }

      // Fetch menu items
      const menuItems = await getitemsbasedonmenu(params.category);
      console.log('Menu items fetched:', menuItems?.length || 0);

      if (!menuItems || !Array.isArray(menuItems)) {
        console.error('Invalid menu items response');
        AlertService.error('Failed to load menu items');
        return;
      }

      // Fetch order items if orderID exists
      let orderResponse = [];
      if (params.orderID && userId) {
        console.log('Fetching order items for orderID:', params.orderID);
        try {
          const ord_res = await getOrderItemList(params.orderID, userId);
          if (ord_res?.orderItems) {
            orderResponse = ord_res.orderItems;
            console.log('Order items fetched:', orderResponse.length);
          }
        } catch (orderError) {
          console.error('Error fetching order items:', orderError);
        }
      }

      // Create order items map
      const orderItems = orderResponse.reduce((acc, orderItem) => {
        if (orderItem?.menuItemId) {
          acc[orderItem.menuItemId] = orderItem;
        }
        return acc;
      }, {});

      // Combine menu items with order data
      const combinedItems = menuItems.map((item, index) => {
        try {
          if (!item || typeof item !== 'object' || !item.id) {
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

      console.log('Combined items ready:', combinedItems.length);

      if (isMounted.current) {
        const selectedItems = combinedItems.filter((item) => item?.selected);
        setItems(combinedItems);
        setSelectedItems(selectedItems);
        console.log('State updated successfully');
      }
    } catch (error) {
      console.error('Error in initializeData:', error);
      AlertService.error('Failed to load menu data: ' + (error?.message || 'Unknown error'));
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [params?.category, params?.orderID, userId]);

  // Initialize component
  const initializeComponent = useCallback(() => {
    if (!userId) {
      console.log('orderitems: waiting for userId...');
      return;
    }

    if (!params || !params.category) {
      console.warn('orderitems: missing params.category, redirecting to menu-list');
      setTimeout(() => {
        try {
          router.push({ pathname: '/menu-list' });
        } catch (e) {
          console.warn('router push failed', e);
        }
      }, 50);
      return;
    }

    console.log('orderitems: initializing with params:', params);
    getMenu();
    initializeData();
  }, [params?.category, params?.orderID, userId, getMenu, initializeData]);

  useEffect(() => {
    initializeComponent();
  }, [initializeComponent]);

  // ========== ORDER OPERATIONS ==========

  const createOrder_data = async () => {
    if (!userId) {
      AlertService.error("Please login to place an order");
      router.push({ pathname: "/customer-login" });
      return;
    }

    if (!params.restaurantId) {
      AlertService.error("Restaurant not specified");
      return;
    }

    const sanitizedOrderItems = (selectedItems || []).map((it) => ({
      id: it.id,
      quantity: it.quantity,
      comments: it.comments || "",
      orderItemId: it.orderItemId || null,
    }));

    const order = {
      userId: userId,
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
      console.log("Order created successfully:", response);
      AlertService.success("Order placed successfully");
    } catch (error) {
      console.error("Error creating order:", error);
      AlertService.error("Failed to place order");
    }

    setShowOrderModal(true);
    router.push({
      pathname: "/menu-list",
      params: {
        restaurantId: params.restaurantId,
        tableId: params.tableId,
      },
    });
  };

  const deleteOrder_items = useCallback(async () => {
    const order = {
      userId: userId,
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
      console.log("Order items deleted successfully:", response);
    } catch (error) {
      console.error("Error deleting order items:", error);
    }
    setShowOrderModal(true);
  }, [userId, params.restaurantId, params.orderID, remove_list, initializeData]);

  // Auto-delete when no items selected
  useEffect(() => {
    const selected = items.filter((i) => i.selected);
    const selectedCount = selected.length;
    const removeListLength = remove_list.length;

    if (selectedCount === 0 &&
        removeListLength > 0 &&
        (prevStateRef.current.selectedCount !== selectedCount ||
         prevStateRef.current.removeListLength !== removeListLength)) {

      prevStateRef.current = { selectedCount, removeListLength };
      deleteOrder_items();
    } else {
      prevStateRef.current = { selectedCount, removeListLength };
    }
  }, [items, remove_list, deleteOrder_items]);

  // ========== ITEM HANDLERS ==========

  const handleItemSelect = useCallback((itemId) => {
    setItems((prevData) => {
      const updatedItems = prevData.map((item) => {
        if (item.id === itemId) {
          if (item.selected) {
            addToRemoveList(item);
          } else {
            setRemoveList((prev) =>
              prev.filter((removedItem) => (removedItem.orderItemId || removedItem.id) !== (item.orderItemId || item.id))
            );
          }

          return {
            ...item,
            selected: !item.selected,
            quantity: item.selected ? 0 : 1,
          };
        }
        return item;
      });

      return updatedItems;
    });
  }, [addToRemoveList]);

  const handleQuantityChange = useCallback((itemId, increment) => {
    setItems((prevData) => {
      const updatedItems = prevData.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + increment);

          if (newQuantity === 0 && item.orderItemId) {
            addToRemoveList(item);
          } else if (newQuantity > 0) {
            setRemoveList((prev) =>
              prev.filter((removedItem) => (removedItem.orderItemId || removedItem.id) !== (item.orderItemId || item.id))
            );
          }

          return {
            ...item,
            quantity: newQuantity,
            selected: newQuantity > 0,
          };
        }
        return item;
      });

      return updatedItems;
    });
  }, [addToRemoveList]);

  const handleEdit = useCallback((item) => {
    if (item.id) {
      console.log("Editing item:", item);
      setSelectedItem(item.id);
      setComment(item.comments || "");
      setIsModalOpen(true);
    }
  }, []);

  const handleCommentSubmit = () => {
    console.log("Submitting comment:", comment, "for item:", selectedItem);
    setItems((prevSections) =>
      prevSections.map((section) =>
        section.id === selectedItem ? { ...section, comments: comment } : section
      )
    );
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem ? { ...item, comments: comment } : item
      )
    );
    setIsModalOpen(false);
    setSelectedItem(null);
    setComment("");
  };

  // ========== CALCULATIONS ==========

  const { selectedItems: calculatedSelectedItems, totalCost: calculatedTotalCost } = useMemo(() => {
    const selected = items.filter((item) => item?.selected);
    const total = selected.reduce((sum, item) => {
      const price = parseInt(item?.price || 0);
      return sum + price * (item?.quantity || 0);
    }, 0);
    return { selectedItems: selected, totalCost: total };
  }, [items]);

  useEffect(() => {
    setSelectedItems(calculatedSelectedItems);
    setTotalCost(calculatedTotalCost);
  }, [calculatedSelectedItems, calculatedTotalCost]);

  // ========== NAVIGATION ==========

  const handleBackPress = () => {
    const obj = { pathname: "/menu-list" };
    if (params.ishotel === "true") {
      obj.params = {
        hotelId: params.restaurantId || params.hotelId,
        ishotel: "true",
      };
    } else {
      obj.params = {
        restaurantId: params.restaurantId,
        tableId: params.tableId,
        ishotel: "false"
      };
    }
    router.push(obj);
  };

  // ========== LOADING & ERROR STATES ==========

  if (!userId && !error) {
    return (
      <LinearGradient
        colors={['#C4B5FD', '#A78BFA']}
        style={[orderitemsstyle.container, { justifyContent: 'center', alignItems: 'center' }]}
      >
        <Text style={{ fontSize: 18, color: '#333' }}>Loading...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={['#C4B5FD', '#A78BFA']}
        style={[orderitemsstyle.container, { justifyContent: 'center', alignItems: 'center' }]}
      >
        <Text style={{ fontSize: 18, color: '#333' }}>Error loading user data. Please try again.</Text>
      </LinearGradient>
    );
  }

  if (loading && items.length === 0) {
    return (
      <LinearGradient
        colors={['#C4B5FD', '#A78BFA']}
        style={[orderitemsstyle.container, { justifyContent: 'center', alignItems: 'center' }]}
      >
        <Text style={{ fontSize: 18, color: '#333' }}>Loading menu...</Text>
      </LinearGradient>
    );
  }

  if (!Array.isArray(items)) {
    console.error('Items is not an array in render:', typeof items, items);
    return (
      <LinearGradient
        colors={['#C4B5FD', '#A78BFA']}
        style={[orderitemsstyle.container, { justifyContent: 'center', alignItems: 'center' }]}
      >
        <Text style={{ fontSize: 18, color: '#333' }}>Error loading menu items. Please try again.</Text>
      </LinearGradient>
    );
  }

  // ========== RENDER ==========

  return (
    <LinearGradient
      colors={['#C4B5FD', '#A78BFA']}
      style={orderitemsstyle.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={orderitemsstyle.header}>
          <Pressable
            style={orderitemsstyle.backButton}
            onPress={handleBackPress}
          >
            <MaterialCommunityIcons name="chevron-left" size={44} color="#000" />
          </Pressable>
          <View style={orderitemsstyle.headerContent}>
            {menuData?.icon && categoryImages[menuData.icon] && (
              <Image
                source={categoryImages[menuData.icon]}
                style={{ width: 60, height: 60, marginBottom: 8 }}
                resizeMode="contain"
              />
            )}
            <Text style={orderitemsstyle.title}>
              {menuData?.name || params.categoryName || 'Menu Items'}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <ScrollView
          style={orderitemsstyle.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {useMemo(() => {
            try {
              // Group items by type
              const groupedItems = items.reduce((acc, item) => {
                if (!item || typeof item !== 'object') {
                  console.warn('Invalid item in render:', item);
                  return acc;
                }

                const type = item.type || 'Other';
                if (!acc[type]) {
                  acc[type] = [];
                }
                acc[type].push(item);
                return acc;
              }, {});

              return Object.entries(groupedItems).map(([type, typeItems]) => (
                <View key={type}>
                  <Text style={orderitemsstyle.sectionHeader}>{type}</Text>
                  {typeItems.map((item) => (
                    <View key={item.id} style={orderitemsstyle.itemRow}>
                      {params.ishotel === "false" && (
                        <Pressable
                          style={orderitemsstyle.checkboxContainer}
                          onPress={() => handleItemSelect(item.id)}
                        >
                          <View
                            style={[
                              orderitemsstyle.checkbox,
                              item.selected && orderitemsstyle.checkboxSelected,
                            ]}
                          >
                            {item.selected && (
                              <MaterialIcons name="check" size={16} color="#fff" />
                            )}
                          </View>
                        </Pressable>
                      )}

                      {/* Item Info */}
                      <View style={orderitemsstyle.itemInfo}>
                        <Text style={orderitemsstyle.itemName}>{item.name}</Text>
                        <View style={orderitemsstyle.dottedLine} />
                        <Text style={orderitemsstyle.itemPrice}>₹{item.price}</Text>
                      </View>

                      {params.ishotel === "false" && item.selected && (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <View style={orderitemsstyle.quantityContainer}>
                            <Pressable
                              style={orderitemsstyle.quantityButton}
                              onPress={() => handleQuantityChange(item.id, -1)}
                            >
                              <Text style={orderitemsstyle.quantityButtonText}>-</Text>
                            </Pressable>
                            <Text style={orderitemsstyle.quantityText}>
                              {item.quantity}
                            </Text>
                            <Pressable
                              style={orderitemsstyle.quantityButton}
                              onPress={() => handleQuantityChange(item.id, 1)}
                            >
                              <Text style={orderitemsstyle.quantityButtonText}>+</Text>
                            </Pressable>
                          </View>

                          <Pressable
                            onPress={() => handleEdit(item)}
                            style={{ marginHorizontal: 6 }}
                          >
                            <Feather name="edit-2" size={24} color="#000" />
                          </Pressable>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ));
            } catch (error) {
              console.error('Error rendering items:', error);
              return (
                <View style={{ padding: 20 }}>
                  <Text style={{ color: '#333' }}>Error displaying menu items</Text>
                </View>
              );
            }
          }, [items, params.ishotel, handleItemSelect, handleQuantityChange, handleEdit])}

          {/* Order Summary */}
          {params.ishotel === "false" && (
            <View style={orderitemsstyle.orderSummary}>
              <Text style={orderitemsstyle.summaryText}>
                No of item Selected: {selectedItems.length}
              </Text>
              <Text style={orderitemsstyle.summaryText}>
                Total Cost of Selection = ₹{totalCost}
              </Text>
              <Pressable
                style={[
                  orderitemsstyle.placeOrderButton,
                  responsiveStyles.bg1,
                  selectedItems.length === 0 &&
                    orderitemsstyle.placeOrderButtonDisabled,
                ]}
                onPress={createOrder_data}
                disabled={selectedItems.length === 0}
              >
                <Text style={orderitemsstyle.placeOrderButtonText}>
                  Place Order
                </Text>
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
  );
}
