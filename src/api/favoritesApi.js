import api from './api';
import { FAVORITES_API } from '../constants/favoritesApi';
import { showApiError } from '../services/messagingService';

export const getUserFavorites = async (userId) => {
  try {
    const res = await api.get(`${FAVORITES_API.LIST}?userId=${userId}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const addFavorite = async (favoriteData) => {
  try {
    const res = await api.post(FAVORITES_API.ADD, favoriteData);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const removeFavorite = async (favoriteData) => {
  try {
    const res = await api.delete(FAVORITES_API.REMOVE, { data: favoriteData });
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const checkFavorite = async (userId, restaurantId) => {
  try {
    const res = await api.get(`${FAVORITES_API.CHECK}?userId=${userId}&restaurantId=${restaurantId}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

// Also add getUserReviews API function
export const getUserReviews = async (userId) => {
  try {
    const res = await api.get(`/reviews/user?userId=${userId}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};