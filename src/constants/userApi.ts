// API endpoint constants for user
export const USER_API = {
  REGISTER: '/users/register',
  LOGIN: '/users/login',
  PROFILE: '/users',
  REGISTER_RESTAURANT_USER: '/users/registerRestaurantUser',
  LOGIN_RESTAURANT_USER: '/users/login',
  DASHBOARD: '/users/dashboard',
  ADD_MENU_ITEM: '/users/:userId/menu-items',
};
export interface UserUpdateRequest {
  name?: string;
  email?: string;
  password?: string;
  // Add other fields as needed
}

export interface UserDeleteResponse {
  success: boolean;
}

// Request/Response interfaces
export interface UserRegisterRequest {
  name: string;
  email: string;
  password: string;
  // Add other fields as needed
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  // Add other fields as needed
}

export interface UserLoginResponse {
  token: string;
  user: User;
}

export interface UserProfileResponse {
  user: User;
}

export interface UserOrdersResponse {
  orders: any[];
}
