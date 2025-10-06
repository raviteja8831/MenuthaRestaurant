import api from './api';
import { USER_API } from '../constants/userApi';
import { showApiError } from '../services/messagingService';// Get allotted menu items for a user
// Get users by restaurantId and roleId
export const getRestaurantUsers = async (restaurantId, roleId) => {
  try {
    const res = await api.get(`/users/restaurant-users?restaurantId=${restaurantId}&roleId=${roleId}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};


export const getUserAllottedMenuItems = async (userId) => {
  try {
    const res = await api.get(`/users/${userId}/allotted-menuitems`);
    return res.data.menuItems || [];
  } catch (error) {
    showApiError(error);
    throw error;
  }
};



// Send a message to a user
export const sendMessageToUser = async (userId, message, from) => {
  try {
    const res = await api.post(`/users/${userId}/message`, { message, from });
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

// Get messages for a user
export const getMessagesForUser = async (userId) => {
  try {
    const res = await api.get(`/users/${userId}/messages`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

// Get dashboard data for a user
export const getUserDashboard = async (userId, period = 'week') => {
  try {
    const res = await api.get(`/users/dashboard/${userId}?period=${period}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

// Add a menu item to a user
export const addMenuItemToUser = async (userId, menuitemId) => {
  try {
    const res = await api.post(`/users/${userId}/menu-items`, { menuitemId });
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const registerUser = async (data) => {
  try {
    // Create a new axios instance without authorization header for registration
    const axios = require('axios');
    const { API_BASE_URL } = require('../constants/api.constants');
    const registerAxios = axios.create({
      baseURL: API_BASE_URL,
    });

    const res = await registerAxios.post(USER_API.REGISTER, data);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const loginUser = async (data) => {
  try {
    // Create a new axios instance without authorization header for login
    const axios = require('axios');
    const { API_BASE_URL } = require('../constants/api.constants');
    const loginAxios = axios.create({
      baseURL: API_BASE_URL,
    });

    const res = await loginAxios.post(USER_API.LOGIN, data);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const getUser = async (id) => {
  try {
    const res = await api.get(`${USER_API.PROFILE}/${id}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const registerRestaurantUser = async (data) => {
  try {
    // Create a new axios instance without authorization header for registration
    const axios = require('axios');
    const { API_BASE_URL } = require('../constants/api.constants');
    const registerAxios = axios.create({
      baseURL: API_BASE_URL,
    });

    const res = await registerAxios.post(USER_API.REGISTER_RESTAURANT_USER, data);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const loginRestaurantUser = async (data) => {
  try {
    // Create a new axios instance without authorization header for login
    const axios = require('axios');
    const { API_BASE_URL } = require('../constants/api.constants');
    const loginAxios = axios.create({
      baseURL: API_BASE_URL,
    });

    const res = await loginAxios.post(USER_API.LOGIN_RESTAURANT_USER, data);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const updateUser = async (id, data) => {
  try {
    const res = await api.put(`${USER_API.PROFILE}/${id}`, data);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await api.delete(`${USER_API.PROFILE}/${id}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
