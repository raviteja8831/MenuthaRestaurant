import axiosService from "./axiosService";
import { API_BASE_URL, API_ENDPOINTS } from "../constants/api.constants";
import api from "./api";

export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(
      `${API_BASE_URL}${API_ENDPOINTS.USER.PROFILE(userId)}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUserFavorites = async (userId) => {
  try {
    const response = await api.get(
      `${API_BASE_URL}${API_ENDPOINTS.USER.FAVORITES(userId)}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUserTransactions = async (userId) => {
  try {
    const response = await api.get(
      `${API_BASE_URL}${API_ENDPOINTS.USER.TRANSACTIONS(userId)}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
