import axiosService from "./axiosService";
import { API_BASE_URL } from "../constants/api.constants";
import { RESTAURANT_API } from "../constants/restaurantApi";
import { showApiError } from "../services/messagingService";

/* export const createRestaurant = async (data) => {
  try {
    const res = await axiosService.post(
      `${API_BASE_URL}${RESTAURANT_API.CREATE}`,
      data
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
}; */

export const getAllRestaurants = async () => {
  try {
    const res = await axiosService.get(
      `${API_BASE_URL}${RESTAURANT_API.GET_ALL}`
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const getRestaurantById = async (id) => {
  try {
    const res = await axiosService.get(
      `${API_BASE_URL}${RESTAURANT_API.GET_ONE(id)}`
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

/* export const updateRestaurant = async (id, data) => {
  try {
    const res = await axiosService.put(
      `${API_BASE_URL}${RESTAURANT_API.UPDATE(id)}`,
      data
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
}; */

/* export const deleteRestaurant = async (id) => {
  try {
    const res = await axiosService.delete(
      `${API_BASE_URL}${RESTAURANT_API.DELETE(id)}`
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
}; */
