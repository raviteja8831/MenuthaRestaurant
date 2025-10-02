import api from "./api";
import { TABLE_BOOKING_API } from "../constants/tableBookingApi";
import { showApiError } from "../services/messagingService";

export const getAvailableTables = async (restaurantId, userId) => {
  try {
    const url = TABLE_BOOKING_API.GET_AVAILABLE_TABLES.replace(
      ":restaurantId",
      restaurantId
    ).replace(":userId", userId);
    const res = await api.get(url);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const createTableBooking = async (bookingData) => {
  try {
    const res = await api.post(TABLE_BOOKING_API.CREATE, bookingData);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const getAllTableBookings = async () => {
  try {
    const res = await api.get(TABLE_BOOKING_API.LIST);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const getTableBooking = async (id) => {
  try {
    const url = TABLE_BOOKING_API.GET_ONE.replace(":id", id);
    const res = await api.get(url);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const updateTableBooking = async (id, bookingData) => {
  try {
    const url = TABLE_BOOKING_API.UPDATE.replace(":id", id);
    const res = await api.put(url, bookingData);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const deleteTableBooking = async (id) => {
  try {
    const url = TABLE_BOOKING_API.DELETE.replace(":id", id);
    const res = await api.delete(url);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const getRestaurantTableBookingSummary = async (restaurantId) => {
  try {
    const url = TABLE_BOOKING_API.GET_RESTAURANT_SUMMARY.replace(
      ":restaurantId",
      restaurantId
    );
    const res = await api.get(url);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
