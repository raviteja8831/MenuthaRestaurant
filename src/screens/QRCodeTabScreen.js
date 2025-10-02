import React, { useState } from "react";
import { router } from "expo-router";
import { Alert } from "react-native";
import { addUserByManager } from "../api/managerApi";
import FormService from "../components/formService";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Appbar, Surface } from "react-native-paper";

export default function QRCodeTabScreen() {
    const [showNewQRModal, setShowNewQRModal] = useState(false);
    const [showTableDetail, setShowTableDetail] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [qrFormData, setQrFormData] = useState({
      name: "",
    });
    const handleTableClick = (tableNum) => {
    setSelectedTable(tableNum);
    setShowTableDetail(true);
  };
  // Placeholder for QR code tab UI
  return (
    <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>QR Code Generator / Statistics</Text>

          {/* Large QR Code */}
          <View style={styles.qrCodeBox}>
            <MaterialCommunityIcons name="qrcode" size={120} color="#000" />
          </View>

          {/* New QR Code Button */}
          <Pressable
            style={styles.newQRButton}
            onPress={() => setShowNewQRModal(true)}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color="#000"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.newQRButtonText}>New QR Code</Text>
          </Pressable>

          {/* Customer Statistics Section */}
          <View style={styles.qrStatsContainer}>
            <View style={styles.qrStatsRow}>
              <Pressable style={styles.qrPeriodButton}>
                <Text style={styles.qrPeriodButtonText}>Today</Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={16}
                  color="#000"
                />
              </Pressable>
              <View style={styles.qrCustomerCountContainer}>
                <Text style={styles.qrCustomerCountText}>
                  No of Customers today : 50
                </Text>
              </View>
            </View>

            {/* Table Buttons */}
            <View style={styles.qrTableButtons}>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <Pressable
                  key={num}
                  style={styles.qrTableButton}
                  onPress={() => handleTableClick(num)}
                >
                  <Text style={styles.qrTableButtonText}>Table {num}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
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
