import axiosService from "./axiosService";
// Update the path below to the correct relative path where api.constants.js actually exists.
// For example, if api.constants.js is in client/app/constants/, use the following:
import { API_BASE_URL } from "../constants/api.constants";
import { ORDER_API } from "../constants/orderApi";
import { showApiError } from "../services/messagingService";
import api from "./api";

export const createOrder = async (orderData) => {
  try {
    const res = await api.post(
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
    const res = await api.post(
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
    const res = await api.get(
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
    const res = await api.get(
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
    const res = await api.put(
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
    const res = await api.delete(
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
    const res = await api.post(
      `${API_BASE_URL}/orders/orderproduct/${orderId}`,
      data
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const getPaidOrders = async (restaurantId) => {
  try {
    const res = await api.get(
      `${API_BASE_URL}/orders/paid/${restaurantId}`
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const getPaymentPendingOrders = async (restaurantId) => {
  try {
    const res = await api.get(
      `${API_BASE_URL}/orders/payment-pending/${restaurantId}`
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
