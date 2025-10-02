import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { addUserByManager } from "../api/managerApi";

import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function UserListScreen() {
  // Tab state management const [showOrdersDropdown, setShowOrdersDropdown] = useState(false);
  const [ordersPeriodLabel, setOrdersPeriodLabel] = useState("Year");
  const [showOrdersDropdown, setShowOrdersDropdown] = useState(false);

  const users = [
    { name: "Mohan", role: "Manager" },
    { name: "Kiran", role: "Chef" },
    { name: "Anil", role: "Chef" },
    { name: "Anoop", role: "Chef" },
    { name: "Vishal", role: "Chef" },
    { name: "Anthony", role: "Chef" },
  ];
  const selectedUser = users[1];
  const allottedDishes = [
    "Masala Dosa",
    "Plain Dosa",
    "Rava Dosa",
    "Paper Dosa",
    "Masala Paper Dosa",
    "Set Dosa",
    "Pesarttu",
    "Cheese Dosa",
    "Neer Dosa",
    "Adai Dosa",
    "Oats Dosa",
    "Masala Oats Dosa",
    "Moong Dal Dosa",
    "Jower Dosa",
    "Butter Dosa",
    "Masala Butter Dosa",
    "Paneer Dosa",
    "Masala Paneer Dosa",
    "Poori",
  ];
  const todayLoginTime = "8:00 AM";
  const totalOrders = 65;
  const topOrders = [
    { name: "Masala Dosa", count: 20 },
    { name: "Set Dosa", count: 12 },
    { name: "Paper Dosa", count: 10 },
  ];
  const orderHistory = [
    { msg: "Masala Dosa 4 Nos to Table No 5", time: "9:20AM" },
    { msg: "Set Dosa 3 Nos to Table No 4", time: "9:15PM" },
    { msg: "Plain Dosa 6 Nos to Table No 7", time: "9:10AM" },
    { msg: "Oats Dosa 1 Nos to Table No 1", time: "9:08AM" },
    { msg: "Onion Dosa 6 Nos to Parcel Table", time: "9:00AM" },
  ];
  // Demo values for each period (replace with real data as needed)

  const yearOrders = "365/345";
  const monthOrders = "34/12";
  const weekOrders = "7/2";
  const ordersPeriodValue =
    ordersPeriodLabel === "Year"
      ? yearOrders
      : ordersPeriodLabel === "Month"
      ? monthOrders
      : weekOrders;

  const [addUserModal, setAddUserModal] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);

  const [addUserForm, setAddUserForm] = useState({
    name: "",
    password: "",
    role: "Chef",
    phone: "",
    showRoleDropdown: false,
  });

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.usersHeader}>
        <Text style={styles.usersTitle}>Users</Text>
        <View style={styles.usersListRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {users.map((user, idx) => (
              <View key={user.name} style={styles.userAvatarCol}>
                <View style={styles.userAvatarCircle}>
                  <MaterialCommunityIcons
                    name="account-circle"
                    size={48}
                    color="#7b6eea"
                  />
                </View>
                <Text style={styles.userAvatarName}>{user.name}</Text>
                <Text style={styles.userAvatarRole}>{user.role}</Text>
              </View>
            ))}
            <View style={styles.userAddCol}>
              <Pressable
                style={styles.userAddBtn}
                onPress={() => setAddUserModal(true)}
              >
                <MaterialCommunityIcons name="plus" size={32} color="#222" />
              </Pressable>
              <Text style={styles.userAddText}>Add</Text>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Add User Modal */}
      <Modal
        visible={addUserModal}
        transparent
        animationType="fade"
        onRequestClose={() => setAddUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.addUserModalCard, { backgroundColor: "#bcb3f7" }]}
          >
            {" "}
            {/* purple background */}
            {/* Close cross icon */}
            <Pressable
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 20,
              }}
              onPress={() => setAddUserModal(false)}
            >
              <MaterialCommunityIcons name="close" size={28} color="#222" />
            </Pressable>
            <Text
              style={[
                styles.addUserModalTitle,
                {
                  color: "#222",
                  fontWeight: "bold",
                  fontSize: 18,
                  marginBottom: 10,
                },
              ]}
            >
              New Profile
            </Text>
            {/* Name Row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "#222", fontSize: 15, width: 80 }}>
                Name:
              </Text>
              <TextInput
                style={[
                  styles.addUserInput,
                  { backgroundColor: "#fff", flex: 1, marginBottom: 0 },
                ]}
                value={addUserForm.name}
                onChangeText={(text) =>
                  setAddUserForm({ ...addUserForm, name: text })
                }
                placeholder="Enter name"
                placeholderTextColor="#888"
              />
            </View>
            {/* Password Row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "#222", fontSize: 15, width: 80 }}>
                Password:
              </Text>
              <TextInput
                style={[
                  styles.addUserInput,
                  { backgroundColor: "#fff", flex: 1, marginBottom: 0 },
                ]}
                value={addUserForm.password}
                onChangeText={(text) =>
                  setAddUserForm({ ...addUserForm, password: text })
                }
                placeholder="Enter password"
                placeholderTextColor="#888"
                secureTextEntry
              />
            </View>
            {/* Role Row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "#222", fontSize: 15, width: 80 }}>
                Role:
              </Text>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 6,
                    height: 40,
                    justifyContent: "center",
                  }}
                >
                  <Pressable
                    style={{
                      paddingHorizontal: 10,
                      height: 40,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    onPress={() =>
                      setAddUserForm({
                        ...addUserForm,
                        showRoleDropdown: !addUserForm.showRoleDropdown,
                      })
                    }
                  >
                    <Text style={{ color: "#222", fontSize: 15 }}>
                      {addUserForm.role}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={20}
                      color="#222"
                    />
                  </Pressable>
                  {addUserForm.showRoleDropdown && (
                    <View
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 6,
                        position: "absolute",
                        top: 40,
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        elevation: 10,
                      }}
                    >
                      {["Chef", "Manager"].map((role) => (
                        <Pressable
                          key={role}
                          style={{ padding: 10 }}
                          onPress={() =>
                            setAddUserForm({
                              ...addUserForm,
                              role,
                              showRoleDropdown: false,
                            })
                          }
                        >
                          <Text style={{ color: "#222", fontSize: 15 }}>
                            {role}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
            {/* Phone Row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <Text style={{ color: "#222", fontSize: 15, width: 80 }}>
                Phone No:
              </Text>
              <TextInput
                style={[
                  styles.addUserInput,
                  { backgroundColor: "#fff", flex: 1, marginBottom: 0 },
                ]}
                value={addUserForm.phone}
                onChangeText={(text) =>
                  setAddUserForm({ ...addUserForm, phone: text })
                }
                placeholder="Enter phone number"
                placeholderTextColor="#888"
                keyboardType="phone-pad"
              />
            </View>
            {/* Save Button */}
            <Pressable
              style={[
                styles.addUserSaveBtn,
                {
                  backgroundColor: "#a9a1e2",
                  width: 80,
                  alignSelf: "flex-start",
                },
              ]}
              onPress={async () => {
                setAddUserLoading(true);
                try {
                  const payload = {
                    firstname: addUserForm.name,
                    lastname: "",
                    password: addUserForm.password,
                    role_id: addUserForm.role === "Chef" ? 2 : 1,
                    phone: addUserForm.phone,
                    restaurant_id: "33", // Assuming restaurant_id is 1 for demo
                  };
                  await addUserByManager(payload);
                  setAddUserModal(false);
                  setAddUserForm({
                    name: "",
                    password: "",
                    role: "Chef",
                    phone: "",
                    showRoleDropdown: false,
                  });
                  Alert.alert("Success", "User added successfully");
                } catch (err) {
                  Alert.alert(
                    "Error",
                    err?.response?.data?.message ||
                      err?.message ||
                      "Failed to add user"
                  );
                }
                setAddUserLoading(false);
              }}
              disabled={addUserLoading}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>
                {addUserLoading ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.usersProfileRow}>
        <View style={styles.usersProfileColLeft}>
          <View style={styles.usersProfileAvatarCircle}>
            <MaterialCommunityIcons
              name="account-circle"
              size={64}
              color="#7b6eea"
            />
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.usersProfileName}>{selectedUser.name}</Text>
            <Text style={styles.usersProfileRole}>{selectedUser.role}</Text>
          </View>
        </View>
        <Pressable style={styles.usersProfileSettingsBtn}>
          <MaterialCommunityIcons name="cog" size={28} color="#222" />
        </Pressable>
      </View>

      <Text style={styles.usersLoginTime}>
        Today Login Time: {todayLoginTime}
      </Text>

      <View style={styles.usersStatsRow}>
        <View style={styles.usersStatsColLeft}>
          <View style={styles.usersAllottedCard}>
            <Text style={styles.usersAllottedTitle}>Allotted Dishes</Text>
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            >
              {allottedDishes.map((dish, i) => (
                <Text key={dish} style={styles.usersAllottedDish}>
                  • {dish}
                </Text>
              ))}
            </ScrollView>
          </View>
        </View>
        <View style={styles.usersStatsColRightImage2}>
          <View style={styles.usersOrdersCardImage2}>
            <Text style={styles.usersOrdersTitle}>Total Orders Completed</Text>
            <Text style={styles.usersOrdersBig}>{totalOrders}</Text>
          </View>
          <View style={styles.usersOrdersCardImage2}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                position: "relative",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Text style={[styles.usersOrdersSmallValue, { fontSize: 20 }]}>
                  {ordersPeriodValue}
                </Text>
                <View style={{ position: "relative", marginLeft: 8 }}>
                  <Pressable
                    style={[
                      styles.usersOrdersDropdownBtn,
                      { backgroundColor: "#e8e8e8", minWidth: 70 },
                    ]}
                    onPress={() => setShowOrdersDropdown(!showOrdersDropdown)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.usersOrdersSmallLabel, { color: "#666" }]}
                    >
                      {ordersPeriodLabel}
                    </Text>
                  </Pressable>
                  {showOrdersDropdown && (
                    <View style={styles.usersOrdersDropdownMenuPopupFixed}>
                      {["Year", "Month", "Week"].map((label) => (
                        <Pressable
                          key={label}
                          style={styles.usersOrdersDropdownItem}
                          onPress={() => {
                            setOrdersPeriodLabel(label);
                            setShowOrdersDropdown(false);
                          }}
                        >
                          <Text style={styles.usersOrdersDropdownItemText}>
                            {label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
          <View style={styles.usersOrdersCardSmallImage2}>
            <Text style={styles.usersOrdersSmallLabel}>
              Top three Orders of the Day
            </Text>
            {topOrders.map((o) => (
              <Text key={o.name} style={styles.usersOrdersSmallValue}>
                {o.name} : {o.count}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.usersMsgInputRow}>
        <Text style={styles.usersMsgInputLabel}>Message:</Text>
        <View style={styles.usersMsgInputBox} />
      </View>

      <Text style={styles.usersHistoryTitle}>Today</Text>
      {orderHistory.map((h, i) => (
        <View key={i} style={styles.usersHistoryRow}>
          <Text style={styles.usersHistoryMsg}>{h.msg}</Text>
          <Text style={styles.usersHistoryTime}>{h.time}</Text>
        </View>
      ))}
      <Text style={styles.usersHistoryTitle}>Yesterday</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // QR Code Tab Styles
  qrContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#8D8BEA",
  },
  qrTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 30,
    textAlign: "center",
  },
  qrCodeBox: {
    width: 200,
    height: 200,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  newQRButton: {
    backgroundColor: "#e8e8e8",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newQRButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  qrStatsContainer: {
    width: "100%",
    alignItems: "center",
  },
  qrStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  qrPeriodButton: {
    backgroundColor: "#e8e8e8",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qrPeriodButtonText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "bold",
  },
  qrCustomerCountContainer: {
    marginLeft: 10,
    backgroundColor: "#e8e8e8",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qrCustomerCountText: {
    fontSize: 16,
    color: "#000",
  },
  qrTableButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  qrTableButton: {
    backgroundColor: "#e8e8e8",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 5,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qrTableButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
  },
  // New QR Modal Styles
  newQRModalCard: {
    backgroundColor: "#ece9fa",
    borderRadius: 24,
    padding: 24,
    width: 300,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 80,
    elevation: 8,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  newQRHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  smallQRCode: {
    width: 60,
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadIcon: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 5,
  },
  nameInputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  nameInputLabel: {
    fontSize: 14,
    color: "#6c63b5",
    marginBottom: 8,
    textAlign: "left",
    alignSelf: "flex-start",
  },
  nameInput: {
    width: "100%",
    minHeight: 36,
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 15,
    borderWidth: 0,
    color: "#222",
  },
  qrPlusButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  // Table Detail Modal Styles
  tableDetailCard: {
    backgroundColor: "#4a148c",
    borderRadius: 24,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
    alignSelf: "center",
    marginTop: 80,
    elevation: 8,
  },
  tableDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  tableDetailTitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#fff",
  },
  weekDropdown: {
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  weekDropdownText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
  transactionSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
  },
  transactionSummaryText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  transactionsTable: {
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    marginBottom: 8,
    alignItems: "center",
  },
  tableHeaderText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableBody: {
    maxHeight: 300,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    alignItems: "center",
  },
  tableCellText: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#8D8BEA",
    paddingTop: 0,
  },
  appbar: {
    backgroundColor: "#8D8BEA",
    elevation: 0,
  },
  appbarTitle: {
    fontWeight: "bold",
    fontSize: 24,
    textAlign: "center",
  },
  payBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "#7b6eea",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 0,
    marginBottom: 8,
  },
  headerLeft: {},
  todayText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  dayText: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 8,
  },
  greetText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 8,
  },
  profileImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#d1c4e9",
    overflow: "hidden",
  },
  infoCard: {
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#d1c4e9",
    elevation: 4,
    alignItems: "center",
  },
  infoTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 8,
    textAlign: "center",
    color: "#222",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    width: "100%",
  },
  infoLabel: {
    fontSize: 14,
    color: "#222",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#7b6eea",
    fontWeight: "bold",
  },
  statusCard: {
    marginHorizontal: 18,
    marginTop: 0,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#d1c4e9",
    elevation: 4,
    alignItems: "center",
  },
  statusTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 8,
    textAlign: "center",
    color: "#222",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  statusBox: {
    alignItems: "center",
    flex: 1,
  },
  statusLabel: {
    fontSize: 13,
    color: "#222",
    textAlign: "center",
  },
  statusValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7b6eea",
    textAlign: "center",
  },
  chartCard: {
    marginHorizontal: 18,
    marginTop: 0,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#ece9fa",
    elevation: 4,
    alignItems: "center",
    position: "relative",
  },
  chartHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
  },
  chartTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
  },
  ordersPeriodPill: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    elevation: 2,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  ordersPeriodPillText: {
    fontSize: 13,
    color: "#888",
    fontWeight: "bold",
    textAlign: "center",
  },
  usersOrdersDropdownMenuPopupFixed: {
    position: "absolute",
    top: 30,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 4,
    elevation: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 9999,
    minWidth: 70,
    paddingVertical: 0,
  },
  usersOrdersDropdownItem: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  usersOrdersDropdownItemText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  profileCard: {
    backgroundColor: "#ece9fa",
    borderRadius: 16,
    padding: 24,
    width: 300,
    alignItems: "center",
  },
  profileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#d1c4e9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  profileName: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
    color: "#6c63b5",
  },
  profilePhone: {
    fontSize: 14,
    color: "#333",
    marginBottom: 16,
  },
  profileCloseBtn: {
    backgroundColor: "#a9a1e2",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  logoutText: {
    fontSize: 16,
    color: "#6c63b5",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Users Tab Styles
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
  usersListRow: {
    marginBottom: 16,
  },
  userAvatarCol: {
    alignItems: "center",
    marginRight: 16,
  },
  userAvatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ece9fa",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  userAvatarName: {
    fontSize: 13,
    color: "#222",
    fontWeight: "bold",
  },
  userAvatarRole: {
    fontSize: 11,
    color: "#6c63b5",
    marginBottom: 2,
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
  addUserModalCard: {
    backgroundColor: "#e3dbff",
    borderRadius: 24,
    padding: 24,
    width: 300,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 80,
    elevation: 8,
  },
  addUserModalTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 16,
    color: "#6c63b5",
    textAlign: "center",
  },
  addUserInput: {
    width: 200,
    minHeight: 36,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 15,
    borderWidth: 0,
    color: "#222",
  },
  addUserLabel: {
    color: "#6c63b5",
    fontSize: 14,
    marginBottom: 4,
    marginLeft: 2,
  },
  addUserSaveBtn: {
    backgroundColor: "#bcb3f7",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 28,
    marginTop: 8,
    alignItems: "center",
  },
  addUserSaveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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
    height: 350, // Increased height to match right side cards
  },
  usersAllottedTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#6c63b5",
    marginBottom: 6,
  },
  usersAllottedDish: {
    fontSize: 13,
    color: "#222",
    marginBottom: 2,
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
  usersOrdersDropdownBtn: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
    minWidth: 50,
  },
  usersMsgInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  usersMsgInputLabel: {
    fontSize: 15,
    color: "#ece9fa",
    marginRight: 8,
  },
  usersMsgInputBox: {
    flex: 1,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ece9fa",
  },
  usersHistoryTitle: {
    fontSize: 15,
    color: "#ece9fa",
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 18,
  },
  usersHistoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ece9fa",
    borderRadius: 8,
    marginHorizontal: 18,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  usersHistoryMsg: {
    fontSize: 13,
    color: "#222",
    flex: 1,
  },
  usersHistoryTime: {
    fontSize: 13,
    color: "#6c63b5",
    marginLeft: 8,
    fontWeight: "bold",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
  },
  navBtn: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 4,
  },
  navBtnActive: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#6c63b5",
    backgroundColor: "rgba(108,99,181,0.08)",
  },
  notificationContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff0000",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  // Reviews Tab Styles
  reviewsContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#d8bfd8",
  },
  reviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  filterIcon: {
    padding: 8,
  },
  reviewsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    flex: 1,
  },
  mainStarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  mainStar: {
    borderWidth: 3,
    borderColor: "#FF8C00",
  },
  reviewsList: {
    width: "100%",
  },
  reviewCard: {
    backgroundColor: "#c8a2c8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    minHeight: 80,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewHotelName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 8,
    flex: 1,
  },
  reviewDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    lineHeight: 20,
  },
  reviewFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewStars: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewStatus: {
    fontSize: 14,
    color: "#6c63b5",
    fontWeight: "bold",
  },
});
