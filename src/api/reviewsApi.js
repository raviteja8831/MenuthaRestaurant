import api from './api';
import { REVIEWS_API } from '../constants/reviewsApi';
import { showApiError } from '../services/messagingService';

export const fetchReviews = async () => {
  try {
    const res = await api.get(REVIEWS_API.LIST);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const addReview = async (reviewData) => {
  try {
    const res = await api.post(REVIEWS_API.ADD, reviewData);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const updateReview = async (id, reviewData) => {
  try {
    const res = await api.put(`${REVIEWS_API.UPDATE}/${id}`, reviewData);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const deleteReview = async (id) => {
  try {
    const res = await api.delete(`${REVIEWS_API.DELETE}/${id}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
