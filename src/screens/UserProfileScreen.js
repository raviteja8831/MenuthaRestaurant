
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// import { userData } from "../Mock/CustomerHome";
import { getUserReviews, getUserFavorites, getRecentOrders } from "../api/favoritesApi";
import { getUserProfile, logout } from "../services/authService";
import { AlertService } from "../services/alert.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserData } from "../services/getUserData";

const { width } = Dimensions.get("window");

/**
 * UserProfileScreen component with sub-tabs for history, favorites, and transactions
 */
export default function UserProfileScreen() {
  const [activeTab, setActiveTab] = useState("recent");
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [favoritesData, setFavoritesData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);
  const [bufferOrders, setBufferOrders] = useState([]);
  const [tableOrders, setTableOrders] = useState([]);
  // const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    profileImage: null
  });
  const router = useRouter();
  const { userId, error } = useUserData();

  // Handle payment for ready orders
  const handlePayOrder = (order) => {
    router.push({
      pathname: "/payorder",
      params: {
        orderID: order.id,
        restaurantId: order.restaurantId,
        ishotel: "false", // Assuming restaurant orders
      },
    });
  };

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Error loading user data. Please try again.</Text>
      </View>
    );
  }

  // Handle tab changes
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (userId) {
      // alert(userId);
      fetchProfileData();
    }
  }, [activeTab, userId]);
  // }
  // }, [activeTab]);

  const fetchProfileData = async (id = userId) => {
    try {
      if (!id) {
        console.log("No user ID available");
        return;
      }
      console.log("Fetching profile data for user:", id); // Debug log
      setLoading(true);

      // Fetch user profile from auth service (already stored locally)
      const profile = await getUserProfile();
      if (profile) {
        setUserData({
          firstName: profile.firstname || "",
          lastName: profile.lastname || "",
          phoneNumber: profile.phone || "",
          profileImage: profile.profileImage || null
        });
      }

      // Fetch recent orders from API
      console.log("🔍 Calling getRecentOrders API with userId:", id);
      const ordersResponse = await getRecentOrders(id);
      console.log("✅ Recent orders API response:", ordersResponse);
      console.log("📊 Orders data:", ordersResponse?.data);
      console.log("📊 Orders count:", ordersResponse?.data?.length || 0);

      if (ordersResponse && ordersResponse.data) {
        const orders = ordersResponse.data;

        // Map orders to transaction format
        if (orders && orders.length > 0) {
          setTransactionsData(orders.map(order => ({
            id: order.id,
            restaurantId: order.restaurantId,
            restaurantName: order.restaurantName,
            restaurantAddress: order.restaurantAddress,
            status: order.status,
            totalAmount: order.totalAmount,
            createdAt: order.date + " " + order.time,
            items: order.items || []
          })));
        } else {
          setTransactionsData([]);
        }

        // Set table bookings and buffet orders
        setTableOrders(ordersResponse.tableBookings || []);
        setBufferOrders(ordersResponse.buffetOrders || []);
      }

      // Fetch user reviews
      const reviewsResponse = await getUserReviews(id);
      if (reviewsResponse && reviewsResponse.data) {
        setReviews(reviewsResponse.data.map(review => ({
          id: review.id,
          restaurantName: review.restaurant?.name || "Unknown Restaurant",
          restaurantAddress: review.restaurant?.address || "",
          review: review.review || "",
          rating: review.rating || 0,
          createdAt: review.createdAt
        })));
      }

      // Fetch user favorites
      const favoritesResponse = await getUserFavorites(id);
      if (favoritesResponse && favoritesResponse.data) {
        setFavoritesData(favoritesResponse.data.map(favorite => ({
          id: favorite.id,
          restaurantName: favorite.restaurant?.name || "Unknown Restaurant",
          restaurantId: favorite.restaurantId,
          review: "", // Favorites don't have reviews
          rating: 5, // Default rating for favorites display
          addedAt: favorite.createdAt
        })));
      }
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      console.error("❌ Error details:", error.message);
      console.error("❌ Error response:", error.response?.data);
      AlertService.error("Error fetching profile data");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <MaterialIcons
        key={index}
        name="star"
        size={24}
        color={index < rating ? "#FFD700" : "#E0E0E0"}
        style={styles.star}
      />
    ));
  };

  const renderFavoritesTab = () => (
    <ScrollView style={styles.tabContent}>
      {favoritesData.map((item, index) => (
        <View key={item.id} style={styles.favoriteItem}>
          <View style={styles.favoriteHeader}>
            <MaterialIcons name="star" size={34} color="#FFD700" />
            <View style={styles.favoriteInfo}>
              <Text style={styles.hotelName}>{item.restaurantName}</Text>
              <Text style={styles.favoriteDescription}>{item?.review}</Text>
              {/*  // add rating stars */}
              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                  {renderStars(item.rating)}
                </View>
              </View>
              {/* <Text style={styles.hotelDate}>Added: {item.addedAt}</Text> */}
            </View>
          </View>
          {index < favoritesData.length - 1 && (
            <View style={styles.separator} />
          )}
        </View>
      ))}
    </ScrollView>
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [expandedSection, setExpandedSection] = useState("");

  // eslint-disable-next-line react/display-name
  const AccordionHeader = React.memo(({ title, isExpanded, onPress }) => (
    <Pressable
      style={[
        styles.accordionHeader,
        isExpanded && styles.accordionHeaderActive,
      ]}
      onPress={onPress}
    >
      <Text style={styles.accordionTitle}>{title}</Text>
      <MaterialIcons
        name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
        size={24}
        color="#000"
      />
    </Pressable>
  ));

  AccordionHeader.propTypes = {
    title: PropTypes.string.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    onPress: PropTypes.func.isRequired,
  };

  const renderTransactionItems = (items) => {
    if (!items || items.length === 0)
      return <Text style={styles.noOrders}>No Items</Text>;

    return (
      <>
        {items.map((order, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.cell, styles.orderColumn]}>{order.name}</Text>
            <Text style={[styles.cell, styles.qtyColumn]}>
              {order.quantity}
            </Text>
            <Text style={[styles.cell, styles.priceColumn]}>{order.price}</Text>
            <Text style={[styles.cell, styles.totalColumn]}>{order.total}</Text>
          </View>
        ))}
      </>
    );
  };

  const renderTransactionCard = (item) => (
    <View style={styles.transactionCard}>
      {/* Hotel Header with location pin and details */}
      <View style={styles.hotelHeaderSection}>
        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={20} color="#333" />
        </View>
        <View style={styles.hotelDetailsContainer}>
          <Text style={styles.hotelName}>{item.restaurantName}</Text>
          <Text style={styles.hotelLocation}>{item.restaurantAddress || "Restaurant Location"}</Text>
          <Text style={styles.orderDate}>
            (on {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')})
          </Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.orderTime}>
            {item.createdAt ? new Date(item.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }) : '9:30 PM'}
          </Text>
        </View>
      </View>

      {/* Type Differentiator */}
      <View style={styles.orderTypeContainer}>
        <Text style={styles.orderTypeText}>🍽️ {item.orderType || 'Food Order'}</Text>
      </View>

      {/* Members and Total Section */}
      <View style={styles.membersTotalSection}>
        <Text style={styles.members}>{item.members || "Members not specified"}</Text>
        <Text style={styles.totalAmount}>₹{item.totalAmount}/-</Text>
      </View>

      {/* Orders Section */}
      <View style={styles.ordersSection}>
        <Text style={styles.ordersTitle}>Orders</Text>

        {item.items && item.items.length > 0 ? (
          <>
            {item.items.map((order, idx) => (
              <View key={idx} style={styles.orderRow}>
                <Text style={styles.itemName}>{order.name}</Text>
                <Text style={styles.itemQuantity}>{order.quantity}</Text>
                <Text style={styles.itemPrice}>{order.price}</Text>
                <Text style={styles.itemTotal}>{order.total}</Text>
              </View>
            ))}

            {/* Total Row */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.finalTotal}>{item.totalAmount}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.noOrders}>No Orders</Text>
        )}
      </View>

      {/* Order Status Badge */}
      {item.status && (
        <View style={[
          styles.statusBadge,
          {
            backgroundColor:
              item.status === 'PENDING' ? '#FFA726' :
              item.status === 'PLACED' ? '#F4962A' :
              item.status === 'PREPARING' ? '#FF9800' :
              item.status === 'PREPARED' ? '#2AF441' :
              item.status === 'SERVED' ? '#00BCD4' :
              item.status === 'PAYMENT_PENDING' ? '#2196F3' :
              item.status === 'PAID' ? '#4CAF50' :
              item.status === 'COMPLETED' ? '#4CAF50' : '#9E9E9E'
          }
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'PENDING' ? 'Pending' :
             item.status === 'PLACED' ? 'Placed' :
             item.status === 'PREPARING' ? 'Preparing' :
             item.status === 'PREPARED' ? 'Prepared' :
             item.status === 'SERVED' ? 'Served' :
             item.status === 'PAYMENT_PENDING' ? 'Payment Pending' :
             item.status === 'PAID' ? 'Paid' :
             item.status === 'COMPLETED' ? 'Completed' : 'Unknown'}
          </Text>
        </View>
      )}

      {/* Pay Button - Show if order is PAYMENT_PENDING or PLACED */}
      {item.status && (item.status === 'PAYMENT_PENDING' || item.status === 'PLACED') && (
        <Pressable
          style={styles.payButton}
          onPress={() => handlePayOrder(item)}
        >
          <Text style={styles.payButtonText}>Pay Now</Text>
        </Pressable>
      )}
    </View>
  );
  const renderBuffetBookingCard = (item) => (
    <View style={styles.transactionCard}>
      {/* Hotel Header with location pin and details */}
      <View style={styles.hotelHeaderSection}>
        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={20} color="#333" />
        </View>
        <View style={styles.hotelDetailsContainer}>
          <Text style={styles.hotelName}>{item?.restaurant?.name}</Text>
          <Text style={styles.hotelLocation}>{item?.restaurant?.address || "Restaurant Location"}</Text>
          <Text style={styles.orderDate}>
            (on {item?.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')})
          </Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.orderTime}>
            {item?.createdAt ? new Date(item.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }) : '10:00 AM'}
          </Text>
        </View>
      </View>

      {/* Type Differentiator */}
      <View style={styles.orderTypeContainer}>
        <Text style={styles.orderTypeText}>🍽️ Buffet Booking</Text>
      </View>

      {/* Members and Total Section */}
      <View style={styles.membersTotalSection}>
        <Text style={styles.members}>{item?.buffet?.name} - {item?.persons} Persons</Text>
        <Text style={styles.totalAmount}>₹{item?.buffet?.price * item?.persons}/-</Text>
      </View>

      {/* Orders Section */}
      <View style={styles.ordersSection}>
        <Text style={styles.ordersTitle}>Orders</Text>

        <View style={styles.orderRow}>
          <Text style={styles.itemName}>{item?.buffet?.name}</Text>
          <Text style={styles.itemQuantity}>{item?.persons}</Text>
          <Text style={styles.itemPrice}>{item?.buffet?.price}</Text>
          <Text style={styles.itemTotal}>{item?.buffet?.price * item?.persons}</Text>
        </View>

        {/* Total Row */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.finalTotal}>{item?.buffet?.price * item?.persons}</Text>
        </View>
      </View>
    </View>
  );

  const renderTableBookingCard = (item) => (
    <View style={styles.transactionCard}>
      {/* Hotel Header with location pin and details */}
      <View style={styles.hotelHeaderSection}>
        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={20} color="#333" />
        </View>
        <View style={styles.hotelDetailsContainer}>
          <Text style={styles.hotelName}>{item?.restaurant?.name}</Text>
          <Text style={styles.hotelLocation}>{item?.restaurant?.address || "Restaurant Location"}</Text>
          <Text style={styles.orderDate}>
            (on {item?.starttime ? new Date(item.starttime).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')})
          </Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.orderTime}>
            {item?.starttime ? new Date(item.starttime).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }) : '2:15 PM'}
          </Text>
        </View>
      </View>

      {/* Type Differentiator */}
      <View style={styles.orderTypeContainer}>
        <Text style={styles.orderTypeText}>🪑 Table Booking</Text>
      </View>

      {/* Members and Total Section */}
      <View style={styles.membersTotalSection}>
        <Text style={styles.members}>{item?.table?.name}</Text>
        <Text style={styles.totalAmount}>₹{item?.amount}/-</Text>
      </View>

      {/* Orders Section */}
      <View style={styles.ordersSection}>
        <Text style={styles.ordersTitle}>Orders</Text>

        <View style={styles.orderRow}>
          <Text style={styles.itemName}>{item?.table?.name}</Text>
          <Text style={styles.itemQuantity}>1</Text>
          <Text style={styles.itemPrice}>{item?.amount}</Text>
          <Text style={styles.itemTotal}>{item?.amount}</Text>
        </View>

        {/* Total Row */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.finalTotal}>{item?.amount}</Text>
        </View>
      </View>
    </View>
  );

  const renderTransactionsTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Regular Orders */}
      {transactionsData.map((item, index) => (
        <View key={`order-${item.id}`}>
          {renderTransactionCard({...item, orderType: 'Regular Order'})}
          {(index < transactionsData.length - 1 || tableOrders.length > 0 || bufferOrders.length > 0) && (
            <View style={styles.separator} />
          )}
        </View>
      ))}

      {/* Table Bookings */}
      {tableOrders.map((item, index) => (
        <View key={`table-${item.id}`}>
          {renderTableBookingCard(item)}
          {(index < tableOrders.length - 1 || bufferOrders.length > 0) && (
            <View style={styles.separator} />
          )}
        </View>
      ))}

      {/* Buffet Bookings */}
      {bufferOrders.map((item, index) => (
        <View key={`buffet-${item.id}`}>
          {renderBuffetBookingCard(item)}
          {index < bufferOrders.length - 1 && (
            <View style={styles.separator} />
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderReviewsTab = () => {
    // fetchUserReviews();
    if (loading) {
      return (
        <ActivityIndicator
          size="large"
          color="#6c63b5"
          style={{ marginTop: 20 }}
        />
      );
    }

    return (
      <ScrollView style={styles.tabContent}>
        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <MaterialIcons name="location-on" size={20} color="#666" />
              <Text style={styles.hotelName}>{review.restaurantName}</Text>
              <Text style={styles.reviewDate}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.reviewText}>{review.review}</Text>
            {review.restaurantAddress && (
              <Text style={styles.hotelAddress}>
                {review.restaurantAddress}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "reviews":
        return renderReviewsTab();
      case "favorites":
        return renderFavoritesTab();
      case "transactions":
        return renderTransactionsTab();
      default:
        setActiveTab("reviews");
        return renderReviewsTab();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/customer-home")}>
          <MaterialIcons name="chevron-left" size={34} color="#000" />
        </Pressable>

        <Pressable
          style={styles.logoutButton}
          onPress={async () => {
            await logout();
          }}
        >
          <MaterialCommunityIcons name="power" size={28} color="#000" />
        </Pressable>
      </View>

      {/* <Pressable>
        <MaterialIcons name="translate" size={24} color="#000" />
      </Pressable> */}

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          {userData.profileImage ? (
            <Image
              source={{ uri: userData.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <MaterialIcons name="person" size={40} color="#666" />
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>
            First Name: {userData.firstName}
          </Text>
          <Text style={styles.userInfoText}>
            Last Name: {userData.lastName}
          </Text>
          <Text style={styles.userInfoText}>
            Phone Number: {userData.phoneNumber}
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <Pressable
          style={styles.tabButton}
          onPress={() => setActiveTab("reviews")}
        >
          <MaterialIcons name="history" size={32} color="#000" />
          {activeTab === "reviews" && <View style={styles.tabArrow} />}
        </Pressable>

        <Pressable
          style={styles.tabButton}
          onPress={() => setActiveTab("favorites")}
        >
          <MaterialIcons name="favorite" size={32} color="#000" />
          {activeTab === "favorites" && <View style={styles.tabArrow} />}
        </Pressable>

        <Pressable
          style={styles.tabButton}
          onPress={() => setActiveTab("transactions")}
        >
          <Text
            style={[
              styles.currencyIcon,
              {
                color: "#000",
                fontSize: 32,
                fontWeight: "900",
              },
            ]}
          >
            ₹
          </Text>
          {activeTab === "transactions" && <View style={styles.tabArrow} />}
        </Pressable>
      </View>

      {/* Border Separator */}
      <View style={styles.tabBorder} />

      {/* Tab Content */}
      {renderTabContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#8C8AEB",
    borderRadius: 8,
    marginBottom: 8,
  },
  accordionHeaderActive: {
    backgroundColor: "#6c63b5",
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  accordionContent: {
    marginBottom: 16,
    backgroundColor: "#bbbaef",
    borderRadius: 8,
    padding: 8,
  },
  ordersTitle: { fontWeight: "bold", marginBottom: 4 },
  ordersSection: { marginTop: 4 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, paddingBottom: 2 },
  tableRow: { flexDirection: "row", paddingVertical: 2 },
  tableFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 2,
  },

  hcell: { fontWeight: "bold", fontSize: 12 },
  cell: { fontSize: 12 },

  orderColumn: { flex: 2 },
  qtyColumn: { flex: 1, textAlign: "center" },
  priceColumn: { flex: 1, textAlign: "center" },
  totalColumn: { flex: 1, textAlign: "center" },

  noOrders: { fontSize: 12, fontStyle: "italic", color: "gray" },
  separator: { height: 8 },
  logoutButton: {
    // backgroundColor: "#6c63b5",
    borderRadius: 5,
    padding: 10,
    flexDirection: "row",
    alignSelf: "right",
  },

  logoutText: {
    fontSize: 18,
    color: "#fff",
    marginLeft: 8,
    fontWeight: "700",
  },

  reviewItem: {
    // backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: "#000",
  },
  reviewText: {
    fontSize: 14,
    color: "#000",
    marginBottom: 8,
    lineHeight: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#bbbaef", // Light purple background
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 20,
  },
  profileSection: {
    alignItems: "flex-start",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    marginBottom: 10,
    alignSelf: "center",
  },
  profileImage: {
    width: 145,
    height: 145,
    borderRadius: 72.5, // Perfect circle (width/2)
  },
  profileImagePlaceholder: {
    width: 145,
    height: 145,
    borderRadius: 72.5, // Perfect circle to match the profile image
    backgroundColor: "#D0D0D0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "12%",
  },
  userInfo: {
    alignItems: "flex-start",
    width: "100%",
  },
  userInfoText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  tabNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#bbbaef",
    alignItems: "center",
    position: "relative",
  },
  tabArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#000",
    marginTop: 5,
  },

  tabBorder: {
    height: 1,
    backgroundColor: "#000",
    marginHorizontal: 10,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 7.5,
  },
  historyItem: {
    backgroundColor: "#bbbaef",
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
  },
  hotelHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  hotelInfo: {
    flex: 1,
    marginLeft: 10,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    marginRight: "auto",
  },
  hotelAddress: {
    fontSize: 14,
    color: "#000",
    marginBottom: 6,
    lineHeight: 18,
  },
  hotelDate: {
    fontSize: 14,
    color: "#000",
    marginBottom: 3,
  },
  hotelTime: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  orderDetails: {
    marginTop: 10,
  },
  simpleOrder: {
    marginTop: 10,
  },
  membersText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  ordersText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  orderItem: {
    marginBottom: 5,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  itemDetails: {
    fontSize: 12,
    color: "#666",
    marginLeft: 10,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginLeft: "auto",
  },

  favoriteItem: {
    backgroundColor: "#bbbaef",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  favoriteHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  favoriteInfo: {
    flex: 1,
    marginLeft: 10,
  },
  favoriteDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
  },
  star: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  transactionItem: {
    backgroundColor: "#bbbaef",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  transactionHeader: {
    marginBottom: 10,
  },
  currencyIcon: {
    fontSize: 28,
    fontWeight: "bold",
  },

  // New styles for updated design
  transactionCard: {
    backgroundColor: '#CCCCFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  hotelHeaderSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#CCCCFF',
  },
  locationContainer: {
    marginRight: 8,
    marginTop: 2,
  },
  hotelDetailsContainer: {
    flex: 1,
  },
  hotelLocation: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#333',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  orderTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderTypeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#BBBAEF',
  },
  orderTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  membersTotalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#CCCCFF',
  },
  orderRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  itemName: {
    flex: 2,
    fontSize: 14,
    color: '#333',
  },
  itemQuantity: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  itemPrice: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  itemTotal: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#BBBAEF',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  finalTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
    marginHorizontal: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
