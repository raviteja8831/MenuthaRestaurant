import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const { width, height } = Dimensions.get("window");

// Base dimensions (you can adjust these based on your design requirements)
const baseWidth = 375; // Standard iPhone width
const baseHeight = 812; // Standard iPhone height

// Scaling factors
const widthScale = SCREEN_WIDTH / baseWidth;
const heightScale = SCREEN_HEIGHT / baseHeight;

// Responsive dimension functions
export const wp = (dimension) => {
  const percentage = (dimension / baseWidth) * 100;
  return SCREEN_WIDTH * (percentage / 100);
};

export const hp = (dimension) => {
  const percentage = (dimension / baseHeight) * 100;
  return SCREEN_HEIGHT * (percentage / 100);
};

// Utility function for scaling images with max dimensions
export const getResponsiveImageDimensions = (
  originalWidth,
  originalHeight,
  maxWidth,
  maxHeight
) => {
  let width = wp(originalWidth);
  let height = hp(originalHeight);

  if (maxWidth) {
    width = Math.min(width, maxWidth);
  }
  if (maxHeight) {
    height = Math.min(height, maxHeight);
  }

  return {
    width,
    height,
    maxWidth: "100%",
    resizeMode: "contain",
  };
};

// Common responsive styles
export const responsiveStyles = {
  container: {
    paddingHorizontal: wp(20),
    paddingVertical: hp(20),
  },
  image: {
    maxWidth: "90%",
    alignSelf: "center",
  },
  largeImage: {
    width: Math.min(wp(340), 500),
    height: Math.min(wp(340), 500),
    maxWidth: "90%",
    alignSelf: "center",
    resizeMode: "contain",
  },
  mediumImage: {
    width: Math.min(wp(200), 300),
    height: Math.min(wp(200), 300),
    maxWidth: "70%",
    alignSelf: "center",
    resizeMode: "contain",
  },
  smallImage: {
    width: Math.min(wp(120), 200),
    height: Math.min(wp(120), 200),
    maxWidth: "40%",
    alignSelf: "center",
    resizeMode: "contain",
  },
  headerText: {
    fontSize: Math.min(wp(24), 32),
    lineHeight: Math.min(hp(32), 40),
  },
  bodyText: {
    fontSize: Math.min(wp(16), 24),
    lineHeight: Math.min(hp(24), 32),
  },
  button: {
    paddingVertical: hp(12),
    paddingHorizontal: wp(20),
    borderRadius: wp(8),
    width,
  },
  bg1: {
    backgroundColor: "#8C8AEB",
  },
};

export const orderitemsstyle = {
  categoryImage: {
    width: Math.min(width * 0.12, 150),
    height: Math.min(width * 0.12, 150),
    marginBottom: Math.min(height * 0.01, 8),
  },
  container: {
    flex: 1,
    backgroundColor: "#E8E0FF",
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    // opacity: 0.1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    width: "100px !important",
    height: "100px !important",
  },
  title: {
    fontSize: 13,
    color: "#000",
    fontWeight: "400",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
  },
  checkboxSelected: {
    backgroundColor: "#6B46C1",
    borderColor: "#6B46C1",
  },
  itemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
    flex: 1,
  },
  dottedLine: {
    flex: 1,
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 8,
  },
  itemPrice: {
    fontSize: 14,
    color: "#000",
    fontWeight: "bold",
    minWidth: 50,
    textAlign: "right",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  quantityButton: {
    width: 24,
    height: 24,
    backgroundColor: "#6B46C1",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
  },
  orderSummary: {
    // backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 5,
    fontWeight: "400",
    textAlign: "center",
  },
  placeOrderButton: {
    // backgroundColor: "#6B46C1",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 15,
  },
  placeOrderButtonDisabled: {
    backgroundColor: "#ccc",
  },
  placeOrderButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "400",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#E8E0FF",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  specialInstructionsInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoButton: {
    backgroundColor: "#6B46C1",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  infoButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  scrollView: { padding: 40 },
  category: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
    textAlign: "center",
  },
  itemRow: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  checkboxContainer: { marginRight: 10 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: "#999",
    backgroundColor: "#eae1e1ff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: { backgroundColor: "#333" },
  itemInfo: { flex: 1, flexDirection: "row", alignItems: "center" },
  itemName: { fontSize: 15, color: "black" },
  dottedLine: {
    flex: 1,
    borderBottomWidth: 2,
    borderStyle: "dotted",
    borderColor: "black",
    marginHorizontal: 4,
  },
  itemPrice: { fontSize: 15, fontWeight: "500" },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: { fontSize: 16, fontWeight: "bold" },
  quantityText: { marginHorizontal: 6, fontSize: 14 },
};
export const menuliststyles = {
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  safeArea: {
    flex: 1,
    position: "relative",
  },
  mainScrollView: {
    flex: 1,
  },
  mainScrollViewContent: {
    flexGrow: 1,
    paddingBottom: Math.min(height * 0.02, 16), // Reduced bottom padding
  },
  backButton: {
    position: "absolute",
    top: Math.min(height * 0.02, 16),
    left: Math.min(width * 0.04, 20),
    padding: 8,
    zIndex: 10,
    // backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
  },
  header: {
    paddingHorizontal: Math.min(width * 0.04, 20),
    marginBottom: Math.min(height * 0.02, 16),
  },
  headerContent: {
    alignItems: "center",
    marginLeft: Math.min(width * 0.12, 48),
    marginBottom: Math.min(height * 0.02, 16),
  },
  hotelName: {
    fontSize: Math.min(width * 0.06, 32),
    color: "#333",
    fontWeight: "400",
    width: "85%",
    textAlign: "center",
    marginBottom: Math.min(height * 0.015, 12),
  },
  title: {
    fontSize: Math.min(width * 0.07, 36),
    color: "#000",
    fontWeight: "400",
    textAlign: "center",
    paddingVertical: Math.min(height * 0.01, 0),
    width: "100%",
  },
  gridContainer: {
    width: "90%",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: Math.min(width * 0.02, 8),
    marginTop: Math.min(height * 0.02, 16),
  },
  menuCard: {
    width: "48%",
    aspectRatio: 1.2,
    backgroundColor: "transparent",
    borderRadius: 12,
    marginBottom: Math.min(height * 0.02, 16),
    alignItems: "center",
    justifyContent: "center",
  },
  categoryImage: {
    width: Math.min(width * 0.12, 48),
    height: Math.min(width * 0.12, 48),
    marginBottom: Math.min(height * 0.01, 8),
  },
  categoryLabel: {
    fontSize: Math.min(width * 0.035, 14),
    color: "#000",
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: Math.min(width * 0.02, 8),
    marginBottom: Math.min(height * 0.005, 4),
  },
  itemCount: {
    fontSize: Math.min(width * 0.03, 12),
    color: "#666",
    textAlign: "center",
  },
  totalSection: {
    width: "100%",
    paddingHorizontal: "5%",
    marginTop: Math.min(height * 0.02, 16),
    marginBottom: Math.min(height * 0.02, 16),
    bottom: 0,
    left: 0,
    position: "fixed",
  },
  totalContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: Math.min(height * 0.02, 16),
    borderRadius: 15,
    elevation: 2,
  },
  totalText: {
    fontSize: Math.min(width * 0.045, 24),
    color: "#000",
    fontWeight: "400",
    marginBottom: Math.min(height * 0.02, 16),
  },
  finalOrderButton: {
    borderRadius: 18,
    paddingVertical: Math.min(height * 0.015, 12),
    paddingHorizontal: Math.min(width * 0.08, 32),
    alignItems: "center",
    minWidth: Math.min(width * 0.4, 160),
    width: "inherit",
  },
  finalOrderButtonText: {
    color: "#fff",
    fontSize: Math.min(width * 0.04, 24),
    fontWeight: "400",
  },
  buffetSection: {
    width: "100%",
    alignItems: "center",
    marginTop: Math.min(height * 0.02, 16),
    marginBottom: Math.min(height * 0.02, 16),
  },
  buffetButton: {
    // backgroundColor: "#8C8AEB",
    borderRadius: 15,
    paddingVertical: Math.min(height * 0.015, 12),
    paddingHorizontal: Math.min(width * 0.06, 24),
    minWidth: Math.min(width * 0.4, 160),
  },
  buffetText: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
};
export const userprofilestyles = {
  container: {
    flex: 1,
    backgroundColor: "#bbbaef",
  },
  scrollView: {
    flex: 1,
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
    marginBottom: 60,
    alignSelf: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 40,
    backgroundColor: "#D0D0D0",
    justifyContent: "center",
    alignItems: "center",
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
    // paddingTop: 2,
  },
  historyItem: {
    backgroundColor: "#bbbaef",
    borderRadius: 10,
    padding: 20,
    marginBottom: -20,
  },
  hotelHeader: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
    position: "relative",
  },
  hotelInfo: {
    flex: 1,
    marginLeft: 10,
    position: "relative",
    paddingRight: 80,
    marginTop: 7,
  },
  hotelName: {
    width: 175,
    height: 19,
    position: "unset",
    top: 90,
    left: 65,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    opacity: 1,
  },
  hotelAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    lineHeight: 18,
    flex: 1,
    marginTop: 7,
  },
  hotelDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  hotelTime: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    position: "absolute",
    right: 0,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  orderDetails: {
    marginTop: 10,
    marginLeft: 10,
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
  },
  separator: {
    height: 1,
    backgroundColor: "#000000",
    marginTop: 10,
    marginHorizontal: -20,
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
};
export const hoteldetailsstyles = {
  container: {
    flex: 1,
    backgroundColor: "#B9A7F6",
  },
  headerImage: {
    width: "100%",
    height: 220,
  },
  headerTop: {
    position: "absolute",
    top: 30,
    left: 15,
    right: 15,
    zIndex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    // backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
  topIcons: {
    flexDirection: "row",
    gap: 15,
  },
  iconCircle: {
    // backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
  card: {
    padding: 12,
    backgroundColor: "#B9A7F6",
  },
  hotelName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  address: {
    fontSize: 13,
    color: "#222",
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 12,
  },
  option: {
    alignItems: "center",
  },
  optionText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    gap: 4,
  },
  borderContainer: {
    borderBottomWidth: 1,
    borderColor: "black",
  },
  reviewCard: {
    backgroundColor: "#B9A7F6",
    padding: 12,
    marginHorizontal: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: "black",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: "row",
    marginLeft: 8,
    gap: 2,
    marginBottom: 4,
  },
  /*   reviewText: {
    fontSize: 13,
    color: "#111",
    lineHeight: 18,
  }, */
  reviewText: {
    fontSize: 14,
    color: "#222",
    lineHeight: 20,
    marginBottom: 4,
  },
  tooltipContent: {
    backgroundColor: "#fff",
    padding: 10,
    maxWidth: 300,
    borderRadius: 8,
    elevation: 4,
  },
  tooltipText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
};
export const buffetsimescreenstyles = {
  backButton: {
    position: "absolute",
    top: Math.min(height * 0.02, 16),
    left: Math.min(width * 0.04, 20),
    padding: 8,
    zIndex: 10,
    // backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#E6E6FA", // light lavender
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    minHeight: height,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
  },
  clock: {
    width: 200,
    height: 200,
    tintColor: "black",
  },
  buffet: {
    width: 90,
    height: 90,
    marginVertical: 20,
    tintColor: "black",
  },
  buffetInfo: {
    alignItems: "center",
    marginVertical: 10,
  },
  personsInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    // backgroundColor: "#fff",
    borderRadius: 8,
    padding: 5,
    // shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: 170,
  },
  personsInput: {
    minWidth: 50,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  personButton: {
    width: 40,
    height: 40,
    backgroundColor: "#6B4EFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  personButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  actionContainer: {
    flexDirection: "row",
    // alignItems: "center",
    justifyContent: "space-between",
    // marginVertical: 15,
    paddingHorizontal: 20,
    width: "100%",
  },
  totalContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  totalLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6B4EFF",
  },
  payButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.7,
  },
  buffetTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  buffetItems: {
    fontSize: 14,
    textAlign: "center",
    color: "#333",
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 15,
  },
  payButton: {
    backgroundColor: "#6A5ACD",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 20,
  },
  payText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
};
export const tablediningstyles = {
  container: {
    flex: 1,
    backgroundColor: "#E8E7FF",
    paddingHorizontal: "5%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "2%",
    marginTop: "-2%",
    paddingTop: "2%",
  },
  backButton: {
    padding: "2%",
  },
  headerTitle: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    alignItems: "center",
    marginRight: 47,

    flex: 1,
  },
  tableImage: {
    width: "60%",
    height: "28%",
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: "-1%",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // marginTop: "4%",
    marginBottom: "4%",
    // margin: -18,
    gap: Math.min(width * 0.04, 20),
  },
  counterButton: {
    width: Math.min(width * 0.1, 40),
    height: Math.min(width * 0.1, 40),
    alignItems: "center",
    justifyContent: "center",
  },
  counterTextContainer: {
    alignItems: "center",
    minWidth: Math.min(width * 0.15, 60),
    paddingHorizontal: 10,
  },
  counterNumber: {
    fontSize: Math.min(width * 0.08, 36),
    fontWeight: "bold",
    color: "#000",
  },
  tableText: {
    fontSize: Math.min(width * 0.035, 14),
    color: "#000",
    marginTop: "1%",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "5%",
    paddingBottom: "3%",
  },
  bottomTextContainer: {
    marginBottom: "2%",
  },
  reservationText: {
    fontSize: Math.min(width * 0.055, 24),
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: "1.5%",
  },
  disclaimerText: {
    fontSize: Math.min(width * 0.035, 14),
    color: "red",
    textAlign: "center",
    marginBottom: "1%",
  },
  autoCancelText: {
    fontSize: Math.min(width * 0.035, 14),
    color: "#000",
    textAlign: "center",
    marginBottom: "1.5%",
  },
  payButton: {
    width: "-webkit-fill-available",
    height: "40px",
    backgroundColor: "#6C63FF",
    borderRadius: "2.5%",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: "2%",
  },
  payButtonText: {
    color: "#FFF",
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: "600",
  },
  arrowImage: {
    width: Math.min(width * 0.08, 30),
    height: Math.min(width * 0.08, 30),
    resizeMode: "contain",
  },
  rightArrow: {
    transform: [{ rotate: "-180deg" }],
  },
};
