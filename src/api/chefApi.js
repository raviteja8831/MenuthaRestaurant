import api from "./api";
import { CHEF_API } from "../constants/chefApi";
import { showApiError } from "../services/messagingService";

export const fetchChefOrders = async (user) => {
  try {
    const res = await api.get(`${CHEF_API.ORDERS}/${user}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
export const chefLogin = async ({ phone, password }) => {
  try {
    console.log(CHEF_API.LOGIN, 'CHEF_API.LOGIN')
    const res = await api.post(CHEF_API.LOGIN, { phone, password });
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const chefLogout = async (id) => {
  try {
    const res = await api.post(CHEF_API.LOGOUT, { id });
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const fetchChefStats = async (chefId) => {
  try {
    const res = await api.get(`${CHEF_API.ORDERS}/${chefId}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const fetchChefMessages = async (userId) => {
  try {
    const res = await api.get(`users/${userId}/messages`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const sendChefMessage = async (data) => {
  try {
    await api.post("/chef/messages", data);
    return true;
  } catch (e) {
    return false;
  }
};
export const updateOrderStatus = async (data) => {
  try {
    const res = await api.post(`chef/updateorders/status`, {
      ...data,
    });
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
