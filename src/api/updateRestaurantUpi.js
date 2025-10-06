// Add this to client/app/api/restaurantApi.js
import axiosService from "./axiosService";
import { API_BASE_URL } from "../constants/api.constants";
import { RESTAURANT_API } from "../constants/restaurantApi";
import { showApiError } from "../services/messagingService";
import api from "./api";

export const updateRestaurantUpi = async (restaurantId, upi) => {
  try {
    const res = await api.put(
      `${API_BASE_URL}${RESTAURANT_API.UPDATE(restaurantId)}`,
      { upi }
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
