import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
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
import { getitemsbasedonmenu, getSpecificMenu } from "../src/api/menuApi";
import {
  createOrder,
  getOrderItemList,
  deleteOrderItems,
} from "../src/api/orderApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserData } from "../src/services/getUserData";
// import { deleteOrderItems } from "../../server/app/controllers/order.controller";

export default function ItemsListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

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
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Error loading user data. Please try again.</Text>
      </View>
    );
  }
  var itemfirstcalling = false;
  
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
    <SafeAreaView style={orderitemsstyle.container}>
      <ImageBackground
        source={require("../src/assets/images/menu-bg.png")}
        style={orderitemsstyle.backgroundImage}
        resizeMode="repeat"
      />
      <View style={orderitemsstyle.header}>
        <TouchableOpacity
          style={orderitemsstyle.backButton}
          onPress={handleBackPress}
        >
          <MaterialCommunityIcons name="chevron-left" size={44} color="#000" />
        </TouchableOpacity>
        <View
          style={[
            orderitemsstyle.headerContent, //,
            // { width: "100px", height: "100px" },
          ]}
        >
          <Image
            source={categoryImages[menuData.icon]}
            resizeMode="contain"
            style={
              orderitemsstyle.categoryImage //,
              // { width: "100px", height: "100px" },
            }
          />
          <Text style={orderitemsstyle.title}>{params.categoryName}</Text>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView
        style={orderitemsstyle.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => (
          <View key={item.id} style={orderitemsstyle.itemRow}>
            {params.ishotel == "false" && (
              <TouchableOpacity
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
              </TouchableOpacity>
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
                    <TouchableOpacity
                      style={orderitemsstyle.quantityButton}
                      onPress={() => handleQuantityChange(item.id, -1)}
                    >
                      <Text style={orderitemsstyle.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={orderitemsstyle.quantityText}>
                      {item.quantity}
                    </Text>
                    <TouchableOpacity
                      style={orderitemsstyle.quantityButton}
                      onPress={() => handleQuantityChange(item.id, 1)}
                    >
                      <Text style={orderitemsstyle.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleEdit(item)}
                    style={{ marginHorizontal: 6 }}
                  >
                    <Feather name="edit-2" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
              ) : (
                ""
              ))}
          </View>
        ))}
        {/*  </View>
        ))} */}
        {params.ishotel == "false" && (
          <View style={orderitemsstyle.orderSummary}>
            <Text style={orderitemsstyle.summaryText}>
              No of item Selected: {selectedItems.length}
            </Text>
            <Text style={orderitemsstyle.summaryText}>
              Total Cost of Selection = ₹{totalCost}
            </Text>
            <TouchableOpacity
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
            </TouchableOpacity>
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
  );
}
