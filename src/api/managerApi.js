import api from './api';
import { MANAGER_API } from '../constants/managerApi';
import { showApiError } from '../services/messagingService';

// Register a new manager
export const registerManager = async (managerData) => {
  try {
    // Call user registration endpoint for manager
    const res = await api.post('/users/register', managerData);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

// Login manager
export const loginManager = async (credentials) => {
  try {
    const res = await api.post(MANAGER_API.LOGIN, credentials);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

// Fetch manager dashboard data with dateFilter
export const fetchManagerDashboard = async (restaurantId, token, dateFilter = "day") => {
  try {
    const params = dateFilter ? { dateFilter } : {};
    const res = await api.get(`${MANAGER_API.DASHBOARD}/${restaurantId}`, { params });
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

// Get all users managed by manager
export const fetchManagedUsers = async () => {
  try {
    const res = await api.get(MANAGER_API.USERS);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

// Add a new user (by manager)
export const addUserByManager = async (userData) => {
  try {
    const res = await api.post('users/addRestaurantUser', userData);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

// Update user (by manager)
export const updateUserByManager = async (userId, userData) => {
  try {
    const res = await api.put(`${MANAGER_API.USERS}/${userId}`, userData);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

// Delete user (by manager)
export const deleteUserByManager = async (userId) => {
  try {
    const res = await api.delete(`${MANAGER_API.USERS}/${userId}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

// Get chef activity report (login/logout tracking)
export const fetchChefActivityReport = async (restaurantId, startDate = null, endDate = null, chefId = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (chefId) params.chefId = chefId;

    const res = await api.get(`/manager/chef-activity/${restaurantId}`, { params });
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
