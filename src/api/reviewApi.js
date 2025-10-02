import axiosService from "./axiosService";
import { API_BASE_URL } from "../constants/api.constants";

const REVIEWS_API = `${API_BASE_URL}/reviews`;

export const getUserReviews = async (userId) => {
  try {
    const response = await axiosService.get(`${REVIEWS_API}/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const addReview = async (reviewData) => {
  try {
    const response = await axiosService.post(
      `${REVIEWS_API}/create`,
      reviewData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
