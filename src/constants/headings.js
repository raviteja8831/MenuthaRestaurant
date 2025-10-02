export const HEADINGS = {
  // ManagerDashboardScreen: 'Hotel Sai (3 Star)',
  ChefHomeScreen: 'Chef Home',
  MenuScreen: 'Menu',
  RatingsScreen: 'Reviews and Ratings',
  MapScreen: 'Map',
  AddMenuItemScreen: 'Add Menu Item',
  AddUserScreen: 'Add User',
  BillingScreen: 'Billing',
  ChefLoginScreen: 'Chef Login',
  ChefMenuScreen: 'Chef Menu',
  ChefProfileScreen: 'Chef Profile',
  ChefQRCodeListScreen: 'QR Code List',
  ChefQRCodeScreen: 'QR Code',
  ChefTransactionScreen: 'Chef Transactions',
  CustomerRegisterScreen: 'Customer Register',
  FilterScreen: 'Filter',
  LoginScreen: 'Login',
  ManagerLoginScreen: 'Manager Login',
  ManagerRegisterScreen: 'Manager Register',
  OrderSummaryScreen: 'Order Summary',
  ProfileScreen: 'Profile',
  QRCodeScreen: 'QR Code',
  RegisterScreen: 'Register',
  RestaurantDetailScreen: 'Restaurant Details',
  RestaurantPromoScreen: 'Restaurant Promo',
  TrackingScreen: 'Tracking',
  UserManagementScreen: 'User Management',
  UsersListScreen: 'Users List',
  // Add more as needed
};

export function getHeading(routeName) {
  return HEADINGS[routeName] || 'App';
}
