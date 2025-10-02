import axios from "axios";
import { API_BASE_URL } from "../constants/api.constants";

export async function fetchReviews(restaurantId) {
  const res = await axios.get(
    `${API_BASE_URL}/reviews?restaurantId=${restaurantId}`
  );
  return res.data;
}
