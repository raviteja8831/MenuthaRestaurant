import api from "../api/api";
import { BUFFET_API } from "../constants/buffetOrder";
import { showApiError } from "../services/messagingService";

export const fetchBuffetOrders = async (user) => {
  try {
    const res = await api.get(`${BUFFET_API.ORDERS}/${user}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const fetchBuffetStats = async (buffetId) => {
  try {
    const res = await api.get(`${BUFFET_API.ORDERS}/${buffetId}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
export const createBuffetOrder = async (orderData) => {
  try {
    const res = await api.post(`${BUFFET_API.CREATE}`, orderData);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
