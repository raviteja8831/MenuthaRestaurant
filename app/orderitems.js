import React, { useState, useEffect } from "react";
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
  const router = useRouter();
  const params = useLocalSearchParams();
  /*  const { category, categoryName, restaurantId, userId, orderID, ishotel } =
    params; */
  // console.log("ghgsd", useLocalSearchParams());

  // ✅ Initialize items state from menuItemsData

  const [selectedItems, setSelectedItems] = useState([]);
  const [remove_list, setRemoveList] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [userId, setUserId] = useState(null);
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [comment, setComment] = useState("");
  const [items, setItems] = useState([]);
  const { userId, error } = useUserData();
  const [menuData, setMenuData] = useState({});

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Error loading user data. Please try again.</Text>
      </View>
    );
  }
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
    getMenu();
    initializeData();
    // getMenu();
  }, [params.category, params.orderID, userId]);
  const initializeData = async () => {
    try {
      setLoading(true);
      // First fetch the menu items
      const menuItems = await getitemsbasedonmenu(params.category);

      // Then fetch the order items
      var orderResponse = [];
      if (params.orderID) {
        const ord_res = await getOrderItemList(params.orderID, userId);
        if (ord_res.orderItems) {
          orderResponse = ord_res.orderItems;
        }
      }
      // Create a map of order items
      const orderItems = orderResponse.reduce((acc, orderItem) => {
        acc[orderItem.menuItemId] = orderItem;
        return acc;
      }, {});

      // Combine menu items with order data
      const combinedItems = menuItems.map((item) => ({
        ...item,
        selected: orderItems[item.id],
        quantity: orderItems[item.id]?.quantity || 0,
        comments: orderItems[item.id]?.comments || "",
        orderItemId: orderItems[item.id]?.id || null,
      }));
      console.log("combinedItems", combinedItems);
      setItems(combinedItems);
      setSelectedItems(combinedItems.filter((item) => item.selected));
    } catch (error) {
      AlertService.error(error);
    } finally {
      setLoading(false);
    }
  };
  const getMenu = async () => {
    try {
      setLoading(true);
      const menu = await getSpecificMenu(params.category);
      setMenuData(menu);
      console.log("menu", menu);
    } catch (error) {
      alert("Error fetching menu");
      AlertService.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder_data = async () => {
    const order = {
      userId: userId,
      restaurantId: params.restaurantId,
      total: totalCost,
      tableId: params.tableId,
      orderItems: selectedItems || [],
      orderID: params.orderID || null,
      removedItems: remove_list,
    };
    // console.log("items", order);
    try {
      const response = await createOrder(order);
      initializeData();
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
  const deleteOrder_items = async () => {
    const order = {
      userId: userId,
      restaurantId: params.restaurantId,
      removedItems: remove_list,
      orderID: params.orderID || null,
    };
    // console.log("items", order);
    try {
      const response = await deleteOrderItems(order);
      initializeData();
      setRemoveList([]);
      console.log("Order created successfully:", response);
    } catch (error) {
      // console.error("Error creating order:", error);
    }
    setShowOrderModal(true);
  };

  const handleItemSelect = (itemId) => {
    setItems((prevData) => {
      const updatedItems = prevData.map((item) => {
        if (item.id === itemId) {
          if (item.selected) {
            // If item is being unselected, add it to remove_list
            setRemoveList((prev) => [...prev, item]);
          } else {
            // If item is being selected, remove it from remove_list if it exists
            setRemoveList((prev) =>
              prev.filter((removedItem) => removedItem.id !== item.id)
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
  }, [items, remove_list]);

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
      prevSections.map((section) => ({
        ...section,
        ...(section.id === selectedItem && { comments: comment }),
        /*  items: items.map((item) =>
          item.id === selectedItem ? { ...item, comments: comment } : item
        ), */
      }))
    );
    setSelectedItems((prev) =>
      prev.map(
        (item) => item.id === selectedItem && { ...item, comments: comment }
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
            setRemoveList((prev) => [...prev, item]);
          } else if (newQuantity > 0) {
            setRemoveList((prev) =>
              prev.filter((removedItem) => removedItem.id !== item.id)
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
          // Group items by itemType
          const groupedItems = items.reduce((acc, item) => {
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