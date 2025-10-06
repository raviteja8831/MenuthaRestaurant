import axiosService from "./axiosService";
import { API_BASE_URL } from "../constants/api.constants";
import api from "./api";

const REVIEWS_API = `${API_BASE_URL}/reviews`;

export const getUserReviews = async (userId) => {
  try {
    const response = await api.get(`${REVIEWS_API}/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const addReview = async (reviewData) => {
  try {
    const response = await api.post(
      `${REVIEWS_API}/create`,
      reviewData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
