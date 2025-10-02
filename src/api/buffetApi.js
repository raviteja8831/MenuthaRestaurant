import { API_BASE_URL } from "../constants/api.constants";
const BASE_URL = API_BASE_URL;

import axios from "axios";

export const getBuffetDetails = async (restaurantId, token) => {
  const res = await axios.get(
    `${BASE_URL}/buffetdetails?restaurantId=${restaurantId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const saveBuffetDetails = async (buffet, token) => {
  const res = await axios.post(`${BASE_URL}/buffetdetails`, buffet, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
