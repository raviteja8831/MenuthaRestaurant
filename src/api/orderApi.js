import axiosService from "./axiosService";
// Update the path below to the correct relative path where api.constants.js actually exists.
// For example, if api.constants.js is in client/app/constants/, use the following:
import { API_BASE_URL } from "../constants/api.constants";
import { ORDER_API } from "../constants/orderApi";
import { showApiError } from "../services/messagingService";

export const createOrder = async (orderData) => {
  try {
    const res = await axiosService.post(
      `${API_BASE_URL}${ORDER_API.CREATE_ORDER}`,
      orderData
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
export const deleteOrderItems = async (data) => {
  try {
    const res = await axiosService.post(
      `${API_BASE_URL}${ORDER_API.DELETE_ORDER_ITEMS}`,
      data
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const getOrderItemCount = async (restaurantId, userId) => {
  try {
    const res = await axiosService.get(
      `${API_BASE_URL}/orders/pending/${restaurantId}/${userId}`
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
export const getOrderItemList = async (orderId, userId) => {
  try {
    const res = await axiosService.get(
      `${API_BASE_URL}/orders/selected/items/${orderId}`
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, data) => {
  try {
    const res = await axiosService.put(
      `${API_BASE_URL}/orders/${orderId}`,
      data
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const res = await axiosService.delete(
      `${API_BASE_URL}${ORDER_API.DELETE_ORDER}/${orderId}`
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const updateOrderProductStatusList = async (orderId, data) => {
  try {
    const res = await axiosService.post(
      `${API_BASE_URL}/orders/orderproduct/${orderId}`,
      data
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
