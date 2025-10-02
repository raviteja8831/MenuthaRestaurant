import axiosService from "./axiosService";
import { API_BASE_URL, API_ENDPOINTS } from "../constants/api.constants";

export const getUserProfile = async (userId) => {
  try {
    const response = await axiosService.get(
      `${API_BASE_URL}${API_ENDPOINTS.USER.PROFILE(userId)}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
