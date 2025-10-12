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
import CommentModal from "../src/Modals/menueditModal"; // 👈 new component
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
// import { deleteOrderItems } from "../../server/app/controllers/order.controller";
const categoryImages = {
  "Hot & Cold beverages": require("../src/assets/images/bevereage.png"),
  "Hot & Cold Beverages": require("../src/assets/images/bevereage.png"),
  "Beverages": require("../src/assets/images/bevereage.png"),
  Soups: require("../src/assets/images/soup.png"),
  Breakfast: require("../src/assets/images/breakfast.png"),
  Starters: require("../src/assets/images/staters.png"),
  "Indian Breads": require("../src/assets/images/indian-bread.png"),
  "Indian Bread": require("../src/assets/images/indian-bread.png"),
  "Main Course": require("../src/assets/images/main-course.png"),
  "Main Courses": require("../src/assets/images/main-course.png"),
  Salads: require("../src/assets/images/salads.png"),
  Salad: require("../src/assets/images/salads.png"),
  "Ice creams & Desserts": require("../src/assets/images/ice-cream-sesserts.png"),
  "Ice Creams & Desserts": require("../src/assets/images/ice-cream-sesserts.png"),
  "Desserts": require("../src/assets/images/ice-cream-sesserts.png"),
  Liquor: require("../src/assets/images/liquor.jpg"),
};

// Icon mapping object - Maps icon names from API to MaterialCommunityIcons
// Based on the Figma design, mapping common menu category icons
const iconMapping = {
  // Beverages - cup icons
  "cup-outline": "cup-outline",
  "coffee": "coffee",
  "glass-cocktail": "glass-cocktail",
  "cup": "cup-outline",
  "beverage": "cup-outline",
  "drinks": "cup-outline",

  // Soups - bowl/pot icons
  "bowl-mix-outline": "bowl-mix-outline",
  "bowl-outline": "bowl-outline",
  "pot-steam-outline": "pot-steam-outline",
  "soup": "bowl-mix-outline",

  // Breakfast - bread/egg icons
  "bread-slice-outline": "bread-slice-outline",
  "food-croissant": "food-croissant",
  "egg-fried": "egg-fried",
  "breakfast": "bread-slice-outline",
  "bread": "bread-slice-outline",

  // Starters - fork/knife icons
  "food-drumstick-outline": "food-drumstick-outline",
  "food-variant": "food-variant",
  "silverware-fork-knife": "silverware-fork-knife",
  "starters": "silverware-fork-knife",
  "appetizers": "silverware-fork-knife",

  // Indian Breads - layered/circle icons
  "circle-outline": "circle-outline",
  "food-off-outline": "food-off-outline",
  "layers-outline": "layers-outline",
  "indian_bread": "layers-outline",
  "bread": "layers-outline",

  // Main Course - main dish icons
  "silverware-clean": "silverware-clean",
  "food": "food",
  "bowl-mix": "bowl-mix",
  "main_course": "food",
  "main": "food",

  // Salads - leaf/apple icons
  "leaf": "leaf",
  "food-apple-outline": "food-apple-outline",
  "salad": "food-apple-outline",
  "salads": "food-apple-outline",

  // Desserts/Ice cream - ice cream icons
  "ice-cream": "ice-cream",
  "cake-variant-outline": "cake-variant-outline",
  "candy-outline": "candy-outline",
  "dessert": "ice-cream",
  "desserts": "ice-cream",
  "ice_cream": "ice-cream",

  // Default fallback
  "food-outline": "food-outline"
};

// Default fallback icon
const defaultIcon = "food-outline";

// Default fallback image
const defaultCategoryImage = require("../src/assets/images/menu.png");
export default function ItemsListScreen() {
  // ✅ ALL HOOKS MUST BE CALLED FIRST - NO EXCEPTIONS
  const router = useRouter();
  const params = useLocalSearchParams();
  const isMounted = useRef(true);

  // ✅ All useState hooks grouped together at the top
  const [selectedItems, setSelectedItems] = useState([]);
  const [remove_list, setRemoveList] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [comment, setComment] = useState("");
  const [items, setItems] = useState([]);
  const [menuData, setMenuData] = useState({});

  // ✅ Custom hooks after useState but before useEffect
  const { userId, error } = useUserData();

  // ✅ useEffect hooks - mount tracking first
  useEffect(() => {
    // track mount state so async callbacks don't call setState after unmount
    return () => {
      isMounted.current = false;
    };
  }, []);

  var itemfirstcalling = false;
  // useEffect(() => {
  //   const initializeProfile = async () => {
  //     try {
  //       const userProfile = await AsyncStorage.getItem("user_profile");
  //       if (userProfile) {
  //         const user = JSON.parse(userProfile);
  //         console.log("User Profile:", user); // Debug log
  //         setUserId(user.id);
  //         // Only fetch profile data if we have a userId
  //         if (user.id) {
  //           await fetchProfileData(user.id);
  //         }
  //       } else {
  //         console.log("No user profile found");
  //         router.push("/customer-login");
  //       }
  //     } catch (error) {
  //       console.error("Error initializing profile:", error);
  //       AlertService.error("Error loading profile");
  //     }
  //   };

  //   initializeProfile();
  // }, []);
  useEffect(() => {
    // Defensive: only initialize if we have userId and required params
    if (!userId) {
      console.log('orderitems: waiting for userId...');
      return;
    }

    if (!params || !params.category) {
      console.warn('orderitems: missing params.category, redirecting to menu-list');
      // don't attempt to fetch; navigate back to menu-list after a tick
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

  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching menu items for category:', params.category);

      // First fetch the menu items
      const menuItems = await getitemsbasedonmenu(params.category);
      console.log('✅ Menu items fetched:', menuItems?.length || 0);

      if (!menuItems || !Array.isArray(menuItems)) {
        console.error('❌ Invalid menu items response');
        AlertService.error('Failed to load menu items');
        return;
      }

      // Then fetch the order items
      var orderResponse = [];
      if (params.orderID && userId) {
        console.log('📋 Fetching order items for orderID:', params.orderID);
        const ord_res = await getOrderItemList(params.orderID, userId);
        if (ord_res?.orderItems) {
          orderResponse = ord_res.orderItems;
          console.log('✅ Order items fetched:', orderResponse.length);
        }
      }

      // Create a map of order items
      const orderItems = orderResponse.reduce((acc, orderItem) => {
        if (orderItem?.menuItemId) {
          acc[orderItem.menuItemId] = orderItem;
        }
        return acc;
      }, {});

      // Combine menu items with order data
      const combinedItems = menuItems.map((item, index) => {
        try {
          // Defensive check for each menu item
          if (!item || typeof item !== 'object') {
            console.warn(`⚠️ Invalid menu item at index ${index}:`, item);
            return null;
          }

          if (!item.id) {
            console.warn(`⚠️ Menu item missing ID at index ${index}:`, item);
            return null;
          }

          const combinedItem = {
            ...item,
            selected: !!orderItems[item.id], // normalize to boolean
            quantity: orderItems[item.id]?.quantity || 0,
            comments: orderItems[item.id]?.comments || "",
            orderItemId: orderItems[item.id]?.id || null,
          };

          return combinedItem;
        } catch (itemError) {
          console.error(`❌ Error processing menu item at index ${index}:`, itemError, item);
          return null;
        }
      }).filter(Boolean); // Remove null items

      console.log('✅ Combined items ready:', combinedItems.length);
      console.log('🔍 Sample combined item:', combinedItems[0]);

      // Add defensive checks before setting state
      if (!Array.isArray(combinedItems)) {
        console.error('❌ combinedItems is not an array:', typeof combinedItems);
        return;
      }

      if (isMounted.current) {
        try {
          console.log('🔄 Setting items state...');
          setItems(combinedItems);

          console.log('🔄 Filtering selected items...');
          const selectedItems = combinedItems.filter((item) => {
            // Defensive check for each item
            if (!item || typeof item !== 'object') {
              console.warn('⚠️ Invalid item found:', item);
              return false;
            }
            return !!item.selected;
          });

          console.log('🔄 Setting selected items state...', selectedItems.length);
          setSelectedItems(selectedItems);
          console.log('✅ State updated successfully');
        } catch (stateError) {
          console.error('❌ Error updating state:', stateError);
          AlertService.error('Error updating menu data');
        }
      }
    } catch (error) {
      console.error('❌ Error in initializeData:', error);
      AlertService.error('Failed to load menu data: ' + (error?.message || 'Unknown error'));
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [params.category, params.orderID, userId]);

  // Helper to add item to remove_list without duplicates
  const addToRemoveList = (item) => {
    const id = item.orderItemId || item.id;
    setRemoveList((prev) => {
      if (prev.some((r) => (r.orderItemId || r.id) === id)) return prev;
      return [...prev, { orderItemId: item.orderItemId || item.id }];
    });
  };

  const getMenu = useCallback(async () => {
    try {
      if (isMounted.current) setLoading(true);
      const menu = await getSpecificMenu(params.category);
      if (isMounted.current) {
        setMenuData(menu);
        console.log("menu", menu);
      }
    } catch (error) {
      alert("Error fetching menu");
      AlertService.error(error);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [params.category]);

  const createOrder_data = async () => {
    // basic validation
    if (!userId) {
      AlertService.error("Please login to place an order");
      router.push({ pathname: "/customer-login" });
      return;
    }
    if (!params.restaurantId) {
      AlertService.error("Restaurant not specified");
      return;
    }
    // Sanitize order items to only include fields server expects
    const sanitizedOrderItems = (selectedItems || []).map((it) => ({
      id: it.id, // menu item id for new items
      quantity: it.quantity,
      comments: it.comments || "",
      orderItemId: it.orderItemId || null, // present when updating existing order products
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
    // console.log("items", order);
    try {
      const response = await createOrder(order);
      if (isMounted.current) {
        await initializeData();
      }
      console.log("Order created successfully:", response);
    } catch (error) {
      // console.error("Error creating order:", error);
    }
    setShowOrderModal(true);
    // if (path_re) {
    router.push({
      pathname: "/menu-list",
      params: {
        // hotelId: params.ishotel == "true" ? params.restaurantId : null,
        restaurantId: params.restaurantId,
        tableId: params.tableId,
      },
    });
    // }
  };
  const deleteOrder_items = useCallback(async () => {
    // Only send minimal removed item identifiers
    const order = {
      userId: userId,
      restaurantId: params.restaurantId,
      removedItems: remove_list.map((r) => ({ orderItemId: r.orderItemId || r.id })),
      orderID: params.orderID || null,
    };
    // console.log("items", order);
    try {
      const response = await deleteOrderItems(order);
      if (isMounted.current) {
        await initializeData();
        setRemoveList([]);
      }
      console.log("Order created successfully:", response);
    } catch (error) {
      // console.error("Error creating order:", error);
    }
    setShowOrderModal(true);
  }, [userId, params.restaurantId, params.orderID, remove_list, initializeData]);

  const handleItemSelect = (itemId) => {
    setItems((prevData) => {
      const updatedItems = prevData.map((item) => {
        if (item.id === itemId) {
          if (item.selected) {
            // If item is being unselected, add it to remove_list (deduped)
            addToRemoveList(item);
          } else {
            // If item is being selected, remove it from remove_list if it exists
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
  };
  useEffect(() => {
    const selected = items.filter((i) => i.selected);
    if (selected.length === 0 && remove_list.length > 0) {
      deleteOrder_items();
    }
  }, [items, remove_list, deleteOrder_items]);

  const handleEdit = (item) => {
    let foundItem = null;
    /*  setItems(
      (prevSections) =>
        prevSections.map((item) => {
          if (item.id === itemId) {
            foundItem = {
              ...item,
              selected: true,
              quantity: item.quantity || 1,
            };
            return foundItem;
          }
          return item;
        })
      // }))
    ); */
    if (item.id) {
      console.log("Editing item:", item);
      setSelectedItem(item.id);
      setComment(item.comments || "");
      setIsModalOpen(true);
    }
  };

  const handleCommentSubmit = () => {
    console.log(
      "Submitting comment:",
      comment,
      "for item:",
      selectedItem,
      items
    );
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
  const handleQuantityChange = (itemId, increment) => {
    setItems((prevData) => {
      const updatedItems = prevData.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + increment);

          // Handle remove_list updates
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

      // ✅ After items updated, check selected count
      const selected = updatedItems.filter((i) => i.selected);

      /*  if (selected.length === 0) {
        // 👇 Only call API here
        // params.orderID = null;
        deleteOrder_items();
        // createOrder_data(false, "calling_selected");
      } */

      return updatedItems;
    });
  };

  useEffect(() => {
    const selected = items.filter((item) => item.selected);
    setSelectedItems(selected);
    const total = selected.reduce((sum, item) => {
      const price = parseInt(item.price);
      return sum + price * item.quantity;
    }, 0);
    setTotalCost(total);
  }, [items]);

  const handleConfirmOrder = () => {
    router.push({
      pathname: "/menu-list",
      params: {
        totalItems: selectedItems.length,
        totalCost: totalCost,
        orderDetails: JSON.stringify(selectedItems),
      },
    });
  };

  const handleBackPress = () => {
    var obj = { pathname: "/menu-list" };
    if (params.ishotel == "true") {
      obj.params = {
        hotelId: params.restaurantId || params.hotelId,
        ishotel: "true",
      };
    } else {
      obj.params = { restaurantId: params.restaurantId, ishotel: "false" };
    }
    router.push(obj);
  };

  // Show loading state while userId is being fetched
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

  // Show error state if user data failed to load
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

  // Show loading indicator
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

  // Safety check: If items is not an array, show error
  if (!Array.isArray(items)) {
    console.error('❌ Items is not an array in render:', typeof items, items);
    return (
      <LinearGradient
        colors={['#C4B5FD', '#A78BFA']}
        style={[orderitemsstyle.container, { justifyContent: 'center', alignItems: 'center' }]}
      >
        <Text style={{ fontSize: 18, color: '#333' }}>Error loading menu items. Please try again.</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#C4B5FD', '#A78BFA']}
      style={orderitemsstyle.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
      <View style={orderitemsstyle.header}>
        <Pressable
          style={orderitemsstyle.backButton}
          onPress={handleBackPress}
        >
          <MaterialCommunityIcons name="chevron-left" size={44} color="#000" />
        </Pressable>
        <View
          style={[
            orderitemsstyle.headerContent, //,
            // { width: "100px", height: "100px" },
          ]}
        >
          <MaterialCommunityIcons
            name={iconMapping[menuData.icon] || defaultIcon}
            size={50}
            color="#333"
            style={orderitemsstyle.categoryIcon}
          />
          <Text style={orderitemsstyle.title}>{params.categoryName}</Text>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView
        style={orderitemsstyle.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Group items by type */}
        {(() => {
          try {
            // Group items by itemType with safety checks
            const groupedItems = items.reduce((acc, item) => {
              if (!item || typeof item !== 'object') {
                console.warn('⚠️ Invalid item in render:', item);
                return acc;
              }

              const type = item.itemType || 'Other';
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
            {params.ishotel == "false" && (
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
              <Text style={orderitemsstyle.itemPrice}>{item.price}</Text>
            </View>

            {params.ishotel == "false" &&
              (item.selected ? (
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
              ) : (
                ""
              ))}
          </View>
              ))}
            </View>
          ));
        })()}
        {params.ishotel == "false" && (
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
              onPress={() => createOrder_data(true)}
              disabled={selectedItems.length === 0}
            >
              <Text style={orderitemsstyle.placeOrderButtonText}>
                Place Order
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Order Summary */}

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