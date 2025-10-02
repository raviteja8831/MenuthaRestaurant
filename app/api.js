// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://10.0.2.2:8080/api", // Change to your backend URL
//   timeout: 10000,
// });

// export default api;

import axios from "axios";
import { API_BASE_URL } from "../src/constants/api.constants";

// Detect environment dynamically

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default api;
