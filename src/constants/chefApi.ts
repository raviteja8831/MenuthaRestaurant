// API endpoint constants for chef
export const CHEF_API = {
  LOGIN: "/chef/login",
  LOGOUT: "/chef/logout",
  PROFILE: "/chef/profile",
  MENU: "/chef/menu",
  TRANSACTIONS: "/chef/transactions",
  QRCODES: "/chef/qrcodes",
  ORDERS: "/chef/dashboard",
  STATS: "/chef/stats",
  MESSAGES: "/user/messages",
};
export interface ChefOrdersResponse {
  orders: any[];
}

export interface ChefStatsResponse {
  stats: any;
}

export interface ChefMessagesResponse {
  messages: any[];
}

// Request/Response interfaces
export interface ChefLoginRequest {
  email: string;
  password: string;
}

export interface Chef {
  id: string;
  name: string;
  email: string;
  // Add other fields as needed
}

export interface ChefLoginResponse {
  token: string;
  chef: Chef;
}

export interface ChefProfileResponse {
  chef: Chef;
}

export interface ChefMenuResponse {
  items: any[];
}

export interface ChefTransactionsResponse {
  transactions: any[];
}

export interface ChefQRCodesResponse {
  qrcodes: any[];
}
