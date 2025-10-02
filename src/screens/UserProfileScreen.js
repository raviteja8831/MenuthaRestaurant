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
import { getUserReviews } from "../api/reviewApi";
import {
  getUserProfile,
  getUserFavorites,
  getUserTransactions,
} from "../api/profileApi";
import { AlertService } from "../services/alert.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserData } from "../services/getUserData";

const { width } = Dimensions.get("window");

/**
 * UserProfileScreen component with sub-tabs for history, favorites, and transactions
 */
export default function UserProfileScreen() {
  const [activeTab, setActiveTab] = useState("orders");
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [favoritesData, setFavoritesData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);
  const [bufferOrders, setBufferOrders] = useState([]);
  const [tableOrders, setTableOrders] = useState([]);
  // const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState({
    orders: [],
    favorites: [],
    transactions: [],
  });
  const router = useRouter();
  const { userId, error } = useUserData();
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
      const response = await getUserProfile(id);
      console.log("Profile response:", response); // Debug log
      setUserData(response.data.user || {});
      setFavoritesData(response.data.favorites || []);
      setTransactionsData(response.data.orders || []);
      setBufferOrders(response.data.bufferOrders || []);
      setTableOrders(response.data.tableOrders || []);
      setReviews(response.data.orders || []);
    } catch (error) {
      console.error("Error fetching profile:", error);
      AlertService.error(error);
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
      <View style={styles.cardHeader}>
        <Text style={styles.hotelName}>{item.restaurantName}</Text>
        <Text style={styles.members}>{item.members}</Text>
        <Text style={styles.totalAmount}>₹{item.totalAmount}/-</Text>
      </View>

      <View style={styles.ordersSection}>
        {renderTransactionItems(item.items)}

        <View style={styles.tableFooter}>
          <Text style={[styles.cell, styles.orderColumn]}>Total</Text>
          <Text style={[styles.cell, styles.totalColumn]}>
            {item.totalAmount}
          </Text>
        </View>
      </View>
    </View>
  );
  const renderBuffetData = (item) => (
    <View style={styles.transactionCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.hotelName}>{item?.restaurant?.name}</Text>

        <Text style={styles.members}>{item?.buffet?.name}</Text>
        <Text style={styles.members}>Persons: {item?.persons}</Text>
        <Text style={styles.totalAmount}>
          {" "}
          Per Person : ₹{item?.buffet?.price}/-
        </Text>
      </View>

      <View style={styles.ordersSection}>
        {/* {renderTransactionItems(item.items)} */}

        <View style={styles.tableFooter}>
          <Text style={[styles.cell, styles.orderColumn]}>Total</Text>
          <Text style={[styles.cell, styles.totalColumn]}>
            {item?.buffet?.price * item?.persons}
          </Text>
        </View>
      </View>
    </View>
  );
  const renderTableData = (item) => (
    <View style={styles.transactionCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.hotelName}>{item?.restaurant?.name}</Text>

        <Text style={styles.members}>{item?.table?.name}</Text>
        <Text style={styles.members}>
          Date: {new Date(item?.starttime).toLocaleDateString()}
        </Text>
        <Text style={styles.members}>
          Time: {new Date(item?.starttime).toLocaleTimeString()}
        </Text>
        <Text style={styles.totalAmount}> Per Table : ₹{item?.amount}/-</Text>
      </View>

      <View style={styles.ordersSection}>
        <View style={styles.tableFooter}>
          <Text style={[styles.cell, styles.orderColumn]}>Total</Text>
          <Text style={[styles.cell, styles.totalColumn]}>{item?.amount}</Text>
        </View>
      </View>
    </View>
  );

  const renderTransactionsTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Regular Orders Accordion */}
      <AccordionHeader
        title="Orders"
        isExpanded={expandedSection === "orders"}
        onPress={() =>
          setExpandedSection(expandedSection === "orders" ? "" : "orders")
        }
      />
      {expandedSection === "orders" && (
        <View style={styles.accordionContent}>
          {transactionsData.map((item, index) => (
            <View key={item.id} style={styles.transactionCard}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <Text style={styles.hotelName}>{item.restaurantName}</Text>
                <Text style={styles.members}>{item.members}</Text>
                <Text style={styles.totalAmount}>₹{item.totalAmount}/-</Text>
              </View>

              {/* Orders Section */}
              <View style={styles.ordersSection}>
                <Text style={styles.ordersTitle}>Orders</Text>

                {item.items && item.items.length > 0 ? (
                  <>
                    {item.items.map((order, idx) => (
                      <View key={idx} style={styles.tableRow}>
                        <Text style={[styles.cell, styles.orderColumn]}>
                          {order.name}
                        </Text>
                        <Text style={[styles.cell, styles.qtyColumn]}>
                          {order.quantity}
                        </Text>
                        <Text style={[styles.cell, styles.priceColumn]}>
                          {order.price}
                        </Text>
                        <Text style={[styles.cell, styles.totalColumn]}>
                          {order.total}
                        </Text>
                      </View>
                    ))}

                    {/* Footer Total */}
                    <View style={styles.tableFooter}>
                      <Text style={[styles.cell, styles.orderColumn]}>
                        Total
                      </Text>
                      <Text style={[styles.cell, styles.totalColumn]}>
                        {item.totalAmount}
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.noOrders}>No Orders</Text>
                )}
              </View>

              {/* Separator */}
              {index < transactionsData.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))}
        </View>
      )}

      {/* Table Bookings Accordion */}
      <AccordionHeader
        title="Table Bookings"
        isExpanded={expandedSection === "tables"}
        onPress={() =>
          setExpandedSection(expandedSection === "tables" ? "" : "tables")
        }
      />
      {expandedSection === "tables" && (
        <View style={styles.accordionContent}>
          {tableOrders.map((item, index) => (
            <View key={item.id}>
              {renderTableData(item)}
              {index < tableOrders.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))}
        </View>
      )}

      {/* Buffet Bookings Accordion */}
      <AccordionHeader
        title="Buffet Bookings"
        isExpanded={expandedSection === "buffet"}
        onPress={() =>
          setExpandedSection(expandedSection === "buffet" ? "" : "buffet")
        }
      />
      {expandedSection === "buffet" && (
        <View style={styles.accordionContent}>
          {bufferOrders.map((item, index) => (
            <View key={item.id}>
              {renderBuffetData(item)}
              {index < bufferOrders.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))}
        </View>
      )}
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
            await AsyncStorage.clear();
            router.push("/Customer-Login");
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
    borderRadius: 67,
  },
  profileImagePlaceholder: {
    width: 145,
    height: 145,
    borderRadius: 40,
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
});
