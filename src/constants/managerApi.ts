// API endpoint constants for manager
export const MANAGER_API = {
  REGISTER: '/manager/register',
  LOGIN: '/manager/login',
  DASHBOARD: '/manager/dashboard',
  USERS: '/manager/users',
};

// Request/Response interfaces
export interface ManagerRegisterRequest {
  name: string;
  email: string;
  password: string;
  // Add other fields as needed
}

export interface ManagerLoginRequest {
  email: string;
  password: string;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  // Add other fields as needed
}

export interface ManagerLoginResponse {
  token: string;
  manager: Manager;
}

export interface ManagerDashboardResponse {
  // Define dashboard fields
}

export interface User {
  id: string;
  name: string;
  email: string;
  // Add other fields as needed
}

export interface UsersListResponse {
  users: User[];
}
