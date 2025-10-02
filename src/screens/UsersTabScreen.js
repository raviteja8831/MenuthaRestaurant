import React, { use, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TabBar from "./TabBarScreen";
import AddMenuItemModal from "../Modals/AddMenuItemModal";
import { API_BASE_URL } from "../constants/api.constants";

import {
  getUserDashboard,
  sendMessageToUser,
  getMessagesForUser,
  getUserAllottedMenuItems,
  getRestaurantUsers,
  registerRestaurantUser,
} from "../api/userApi";
import { getMenusWithItems, saveUserMenuItems } from "../api/menuApi";
import AddUserScreen from "./AddUserScreen";
import EditUserScreen from "./EditUserScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAlert } from "../services/alertService";

export default function UsersTabScreen() {
  const alert = useAlert();
  const periodOptions = [
        { label: "Today", value: "Today" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
    { label: "Year", value: "year" },
  ];

  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("week");
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [menusWithItems, setMenusWithItems] = useState([]);
  const [allottedMenuItemIds, setAllottedMenuItemIds] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userList, setUserList] = useState([]);
  const [action, setAction] = useState("Add");
  const [selectedUser, setSelectedUser] = useState(null);
  // Replace with actual restaurantId from context/auth if available
  const chefRoleId = 2;
  const [restaurantId, setRestaurantId] = useState("");
  const [allottedUserMenuItemIds, setAllottedUserMenuItemIds] = useState([]);
  const [loginUser, setLoginUser] = useState({});

  useEffect(() => {
    const loadUserAndFetchList = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user_profile");
        let user = null;
        if (userStr) {
          user = JSON.parse(userStr);
          setLoginUser(user)
          // Fix: set restaurantId using useState
          setRestaurantId(user?.restaurant?.id || "");
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    loadUserAndFetchList();
  }, []);

  const fetchUserList = async () => {
    try {
      if (!restaurantId) return;
      const users = await getRestaurantUsers(restaurantId, chefRoleId);
      setUserList(users);
      if (users.length > 0) setSelectedUser(users[0]);
    } catch (err) {
      setUserList([]);
      setSelectedUser(null);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchUserList();
    }
  }, [restaurantId]);

  useEffect(() => {
    if (selectedUser) {
      fetchDashboard(selectedUser.id, period);
      fetchMessages(selectedUser.id);
      fetchMenus();
      fetchAllottedMenuItems(selectedUser.id);
    }
  }, [selectedUser, period]);

  const fetchAllottedMenuItems = async (userId) => {
    try {
      const items = await getUserAllottedMenuItems(userId);
      setAllottedUserMenuItemIds(items);
      // Fix: backend returns { menuItems: [...] }
      setAllottedMenuItemIds((items || []).map((i) => i.id));
    } catch (_err) {
      setAllottedMenuItemIds([]);
    }
  };
  useEffect(() => {
    console.log("allottedUserMenuItemIds changed:", allottedMenuItemIds);
  }, [allottedMenuItemIds]);
 

  const fetchMenus = async () => {
    try {
      const data = await getMenusWithItems(restaurantId);
      setMenusWithItems(data);
    } catch (_err) {
      // Optionally show error
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await getMessagesForUser(userId);
      setMessages(res.messages || []);
    } catch {}
  };
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await sendMessageToUser(selectedUser.id, message, loginUser.id);
      setMessage("");
      fetchMessages(selectedUser.id);
    } catch (err) {
      alert.error(err.message || "Failed to send message");
    }
    setSending(false);
  };

  const fetchDashboard = async (userId, period) => {
    setLoading(true);
    try {
      const data = await getUserDashboard(userId, period);
      setDashboard(data);
    } catch (err) {
      alert.error(err.message || "Failed to load dashboard");
    }
    setLoading(false);
  };

  const handleAddMenuItem = async (menuItemIds) => {
    console.log("Adding menu items:", menuItemIds);
    try {
      await saveUserMenuItems(selectedUser.id, menuItemIds); // Accepts array
      setShowAddMenuModal(false);
      await fetchAllottedMenuItems(selectedUser.id); // Refresh allotted items first
      await fetchDashboard(selectedUser.id, period); // Then refresh dashboard
    } catch (err) {
      alert.error(err.message || "Failed to add menu item");
    }
  };

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const handleUpdateUser = async (userData) => {
    try {
      // Call backend update API (assume updateUser is available in userApi)
      await require("../api/userApi").updateUser(userData.id, userData);
      setShowEditUserModal(false);
      fetchUserList();
      if (selectedUser && selectedUser.id === userData.id) {
        setSelectedUser({ ...selectedUser, ...userData });
      }
    } catch (err) {
      alert.error(err.message || "Failed to update user");
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      await registerRestaurantUser({
        ...userData,
        restaurantId,
        role_id: chefRoleId,
      });
      setShowAddUserModal(false);
      fetchUserList();
    } catch (err) {
      alert.error(err.message || "Failed to add user");
    }
  };
        console.log('userList:', userList);

  const handlePressOutside = () => {
    if (showPeriodDropdown) {
      setShowPeriodDropdown(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handlePressOutside}>
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.usersHeader}>
          <Text style={styles.usersTitle}>Users</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: "center", paddingBottom: 4 }}
          >
            {userList.map((user, idx) => (
              <Pressable
                key={user.id}
                style={[
                  styles.userAvatarCol,
                  selectedUser && selectedUser.id === user.id && styles.userAvatarColSelected
                ]}
                onPress={() => setSelectedUser(user)}
                activeOpacity={0.8}
              >
                                <Text style={styles.userAvatarRole} >{user.firstname}</Text>

                <View style={[
                  styles.userAvatarCircle,
                  selectedUser && selectedUser.id === user.id && styles.userAvatarCircleSelected
                ]}>
                  {user.userImage ? (
                    <Image
                      source={{ uri: user.userImage.startsWith('http') ? user.userImage : `${API_BASE_URL}${user.userImage}` }}
                      style={styles.userAvatarImage}
                    />
                  ) : (
                    <Image
                      source={require("../assets/images/default-user.png")}
                      style={styles.userAvatarImage}
                    />
                  )}
                </View>
                <Text style={styles.userAvatarRole}>{user.role ? user.role.toUpperCase() : "CHEF"}</Text>
              </Pressable>
            ))}
          </ScrollView>
          {/* Add User Plus Icon */}
          <View style={{ alignItems: "left", marginTop: 8 }}>
            <Pressable
              style={{
                backgroundColor: "#ece9fa",
                borderRadius: 28,
                width: 56,
                height: 56,
                alignItems: "center",
                justifyContent: "center",
                elevation: 2,
              }}
              onPress={() => setShowAddUserModal(true)}
            >
              <MaterialCommunityIcons name="plus" size={32} color="#6c63b5" />
            </Pressable>
            <Text
              style={{
                fontSize: 13,
                color: "#222",
                fontWeight: "bold",
                marginTop: 4,
                marginLeft: 15,
              }}
            >
              Add
            </Text>
          </View>
          {/* Add User Modal */}
          <AddUserScreen
            visible={showAddUserModal}
            onClose={() => setShowAddUserModal(false)}
            onSave={handleSaveUser}
          />
        </View>

        {/* Profile Row (with settings icon) */}
        <View style={styles.usersProfileRow}>
          <View style={styles.usersProfileColLeft}>
            <View style={styles.usersProfileAvatarCircle}>
              <MaterialCommunityIcons
                name="account"
                size={48}
                color="#6c63b5"
              />
            </View>
            <View>
              <Text style={styles.usersProfileName}>{selectedUser?.name}</Text>
              <Text style={styles.usersProfileRole}>{selectedUser?.role}</Text>
              <Text style={styles.usersLoginTime}>
                Today Login Time : {dashboard?.todayLoginTime}
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.usersProfileSettingsBtn}
            onPress={() => setShowEditUserModal(true)}
          >
            <MaterialCommunityIcons name="cog" size={28} color="#6c63b5" />
          </Pressable>
        </View>

        {/* Edit User Modal */}
        <Modal
          visible={showEditUserModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEditUserModal(false)}
        >
          <EditUserScreen
            visible={showEditUserModal}
            onClose={() => setShowEditUserModal(false)}
            user={selectedUser}
            onSave={handleUpdateUser}
          />
        </Modal>

        {/* Dashboard Layout: Menu List in one column, other three sections in one column (2 rows) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginHorizontal: 12,
            marginTop: 8,
            marginBottom: 8,
          }}
        >
          {/* Allotted Dishes Column */}
          <View
            style={[
              styles.usersAllottedCard,
              { flex: 1.2, marginRight: 12, minHeight: 220 },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Pressable
                onPress={() => {
                  setShowAddMenuModal(true);
                  setAction("remove");
                }}
              >
                <MaterialCommunityIcons
                  name="minus"
                  size={22}
                  color="#6c63b5"
                />
              </Pressable>
              <Text style={styles.usersAllottedTitle}>Allotted Dishes</Text>
              <Pressable
                onPress={() => {
                  setShowAddMenuModal(true);
                  setAction("add");
                }}
              >
                <MaterialCommunityIcons name="plus" size={22} color="#6c63b5" />
              </Pressable>
            </View>
            <ScrollView style={{ flex: 1 }}>
              {allottedUserMenuItemIds && allottedUserMenuItemIds.length > 0 ? (
                allottedUserMenuItemIds.map((dish, idx) => (
                  <Text key={dish.id} style={styles.usersAllottedDish}>
                    {dish.name}
                  </Text>
                ))
              ) : (
                <View style={styles.noDishesContainer}>
                  <Text style={styles.noDishesText}>No dishes allotted yet</Text>
                  <Text style={styles.noDishesSubtext}>Use + to add dishes to this chef</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Right Column: Orders stacked vertically, then Top 3 Orders */}
          <View
            style={{
              flex: 2,
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            {/* Total Orders Completed (All Time) */}
            <View
              style={{
                backgroundColor: "#ece9fa",
                borderRadius: 16,
                padding: 18,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: "#6c63b5",
                  fontWeight: "bold",
                  fontSize: 13,
                  marginBottom: 2,
                  
                }}
              >
                Total Orders Completed
              </Text>
              <Text style={{ fontSize: 48, fontWeight: "bold", color: "#222" }}>
                {dashboard?.totalOrdersAll ?? "--"}
              </Text>
            </View>
            {/* Period Wise Orders */}
            <View
              style={{
                backgroundColor: "#ece9fa",
                borderRadius: 16,
                padding: 18,
                alignItems: "center",
                marginBottom: 12,
                position: "relative",
              }}
            >
              <Text
                style={{
                  color: "#6c63b5",
                  fontWeight: "bold",
                  fontSize: 13,
                  marginBottom: 2,
                  alignSelf: "flex-start",
                }}
              >
                Total Orders Completed
              </Text>
              <Text style={{ fontSize: 36, fontWeight: "bold", color: "#222" }}>
                {dashboard?.totalOrders ?? "--"}
              </Text>
              <Text
                style={{
                  color: "#888",
                  fontWeight: "bold",
                  fontSize: 16,
                  marginTop: 2,
                }}
              >
                {dashboard?.totalOrders}/{dashboard?.totalOrdersAll}
              </Text>
              {/* Floating Period Dropdown */}
              <View style={{ position: "absolute", top: 12, right: 12 }}>
                <Pressable
                  style={{
                    backgroundColor: "#d1c4e9",
                    borderRadius: 8,
                    paddingHorizontal: 2,
                    paddingVertical: 4,
                  }}
                  onPress={() => setShowPeriodDropdown((v) => !v)}
                >
                  <Text
                    style={{
                      color: "#6c63b5",
                      fontWeight: "bold",
                      fontSize: 15,
                    }}
                  >
                    {periodOptions.find((p) => p.value === period)?.label}
                  </Text>
                </Pressable>
                {showPeriodDropdown && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: 36,
                      right: 0,
                      backgroundColor: "#ece9fa",
                      borderRadius: 8,
                      zIndex: 99999,
                      minWidth: 120,
                      paddingVertical: 4,
                      paddingHorizontal: 2,
                      elevation: 12,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.22,
                      shadowRadius: 12,
                      borderWidth: 2,
                      borderColor: '#fff',
                      maxHeight: 180,
                    }}
                  >
                    <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                      {periodOptions.map((opt) => (
                        <Pressable
                          key={opt.value}
                          style={{
                            padding: 12,
                            backgroundColor:
                              period === opt.value ? "#d1c4e9" : "transparent",
                            borderRadius: 6,
                          }}
                          onPress={() => {
                            setPeriod(opt.value);
                            setShowPeriodDropdown(false);
                          }}
                        >
                          <Text style={{ color: "#6c63b5", fontWeight: "bold", fontSize: 16 }}>
                            {opt.label}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
            {/* Top Three Orders */}
            <View
              style={{
                backgroundColor: "#ece9fa",
                borderRadius: 16,
                padding: 18,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#6c63b5",
                  fontWeight: "bold",
                  fontSize: 13,
                  marginBottom: 2,
                }}
              >
                Top three Orders of the Day
              </Text>
              {dashboard?.topOrders && dashboard.topOrders.length > 0 ? (
                dashboard.topOrders.map((order, idx) => (
                  <Text
                    key={idx}
                    style={{
                      color: "#222",
                      fontWeight: "bold",
                      fontSize: 15,
                      marginTop: 2,
                    }}
                  >
                    {order.name}: {order.count}
                  </Text>
                ))
              ) : (
                <Text style={{ color: "#888", fontSize: 14, marginTop: 4 }}>
                  No data
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Message Section */}
        <View style={{ marginHorizontal: 18, marginBottom: 12 }}>
          <Text
            style={{
              color: "#6c63b5",
              fontWeight: "bold",
              fontSize: 16,
              marginBottom: 4,
            }}
          >
            Message
          </Text>
          <View
            style={{
              backgroundColor: "#ece9fa",
              borderRadius: 12,
              padding: 10,
              marginBottom: 6,
            }}
          >
            {messages.length ? (
              messages.map((msg, idx) => (
                <View key={msg.id || idx} style={{ marginBottom: 6 }}>
                  <Text style={{ color: "#333", fontSize: 14 }}>
                    {msg.message}
                  </Text>
                  <Text style={{ color: "#888", fontSize: 12, marginTop: 2 }}>
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "#888", fontSize: 14 }}>
                No messages yet
              </Text>
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <TextInput
              style={{ flex: 1, fontSize: 15, color: "#222", padding: 6 }}
              placeholder="Message..."
              value={message}
              onChangeText={setMessage}
              editable={!sending}
            />
            <Pressable
              onPress={handleSendMessage}
              disabled={sending || !message.trim()}
              style={{ marginLeft: 8 }}
            >
              <MaterialCommunityIcons
                name="send"
                size={24}
                color={sending || !message.trim() ? "#ccc" : "#6c63b5"}
              />
            </Pressable>
          </View>
        </View>

        {/* Today's Orders List */}
        <View style={{ marginHorizontal: 18, marginTop: 12 }}>
          <Text
            style={{
              fontWeight: "bold",
              color: "#6c63b5",
              fontSize: 16,
              marginBottom: 6,
            }}
          >
            Today
          </Text>
          {dashboard?.todaysOrders?.length ? (
            dashboard.todaysOrders.map((order, idx) => {
              // Combine all items into a single string, e.g. "Masala Dosa 4 Nos to Table No 5"
              // If you have table info, append it; else, just show items
              const orderText = order.items
                .map((item) => `${item.name} ${item.qty} Nos`)
                .join(", ");
              // If you have table info, add here: + ' to Table No X'
              return (
                <View
                  key={order.id}
                  style={{
                    backgroundColor: "#e6e6fa",
                    borderRadius: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginBottom: 6,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#222", fontSize: 15 }}>
                    {orderText}
                  </Text>
                  <Text
                    style={{
                      color: "#555",
                      fontSize: 13,
                      marginLeft: 12,
                      minWidth: 54,
                      textAlign: "right",
                    }}
                  >
                    {new Date(order.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={{ color: "#fff" }}>No orders today</Text>
          )}
        </View>
        {loading && (
          <ActivityIndicator
            size="large"
            color="#6c63b5"
            style={{ marginTop: 24 }}
          />
        )}
        <AddMenuItemModal
          visible={showAddMenuModal}
          onClose={() => setShowAddMenuModal(false)}
          menus={menusWithItems}
          menuItemIds={menusWithItems.flatMap((menu) =>
            (menu.items || menu.menuItems || []).map((i) => i.id)
          )}
          allottedMenuItemIds={allottedMenuItemIds}
          action={action}
          onAdd={handleAddMenuItem}
        />
        </ScrollView>
        <TabBar activeTab="users" />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#8D8BEA" },
  usersHeader: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 16,
  },
  usersTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },

  userAddCol: {
    alignItems: "center",
    marginRight: 8,
    marginLeft: 4,
  },
  userAddBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ece9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginLeft: 4,
    marginBottom: 8,
  },
  userAddText: {
    fontSize: 13,
    color: "#222",
    fontWeight: "bold",
    textAlign: "center",
  },
  usersProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  usersProfileColLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  usersProfileAvatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ece9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  usersProfileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  usersProfileRole: {
    fontSize: 15,
    color: "#ece9fa",
    marginBottom: 2,
    textAlign: "center",
  },
  usersProfileSettingsBtn: {
    backgroundColor: "#ece9fa",
    borderRadius: 20,
    padding: 8,
  },
  usersLoginTime: {
    fontSize: 13,
    color: "#ece9fa",
    textAlign: "center",
    marginBottom: 8,
  },
  usersStatsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  usersStatsColLeft: {
    flex: 1.2,
    marginRight: 8,
  },
  usersStatsColRightImage2: {
    flex: 1.5,
    alignItems: "center",
  },
  usersAllottedCard: {
    backgroundColor: "#ece9fa",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    height: 350,
  },
  usersAllottedTitle: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#6c63b5",
    marginBottom: 0,
  },
  usersAllottedDish: {
    fontSize: 13,
    color: "#222",
    marginBottom: 2,
  },
  noDishesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDishesText: {
    fontSize: 14,
    color: "#6c63b5",
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  noDishesSubtext: {
    fontSize: 12,
    color: "#888",
    textAlign: 'center',
    fontStyle: 'italic',
  },
  usersOrdersCardImage2: {
    backgroundColor: "#d1c4e9",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
    minHeight: 100,
    elevation: 4,
    shadowColor: "#b0aee7",
  },
  usersOrdersCardSmallImage2: {
    backgroundColor: "#d1c4e9",
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
    marginBottom: 12,
    width: 180,
    elevation: 2,
    shadowColor: "#b0aee7",
  },
  usersOrdersTitle: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#222",
    marginBottom: 2,
    textAlign: "center",
  },
  usersOrdersBig: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    textShadowColor: "#b0aee7",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  usersOrdersSmallLabel: {
    fontWeight: "bold",
    fontSize: 11,
    color: "#222",
    textAlign: "center",
  },
  usersOrdersSmallValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginRight: 4,
  },
     userAvatarCol: {
                alignItems: "center",
                marginRight: 18,
                paddingVertical: 12,
                paddingHorizontal: 10,
                borderRadius: 24,
                backgroundColor: "#a99cff22", // subtle match to main bg
                minWidth: 80,
                maxWidth: 100,
                shadowColor: '#b0aee7',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.12,
                shadowRadius: 4,
                elevation: 2,
              },
              userAvatarColSelected: {
                borderColor: '#fff',
                borderWidth: 2,
                shadowColor: '#a99cff',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 8,
              },
              userAvatarCircle: {
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "#ece9fa",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 7,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: 'transparent',
              },
              userAvatarCircleSelected: {
                borderColor: '#fff',
              },
              userAvatarImage: {
                width: 56,
                height: 56,
                borderRadius: 28,
                resizeMode: 'cover',
              },
              userAvatarName: {
                fontSize: 14,
                color: '#fff',
                fontWeight: 'bold',
                marginBottom: 1,
                textAlign: 'center',
                maxWidth: 80,
              },
              userAvatarRole: {
                fontSize: 12,
                color: '#ece9fa',
                fontWeight: '600',
                textAlign: 'center',
                letterSpacing: 0.5,
                marginBottom: 0,
              },

});
