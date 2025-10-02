// Test utility: manually show loader for 2 seconds
export function testLoader() {
  setGlobalLoading(true);
  setTimeout(() => setGlobalLoading(false), 2000);
}

import axios from 'axios';
import { API_BASE_URL } from '../constants/api.constants';
import { setGlobalLoading } from '../components/LoaderContext';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});


// Track number of active requests
let activeRequests = 0;

axiosInstance.interceptors.request.use(
  config => {
    activeRequests++;
    setGlobalLoading(true);
    // Token is set in axiosInstance.defaults.headers.common after login
    return config;
  },
  error => {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) setGlobalLoading(false);
    return Promise.reject(error);
  }
);

// Call this after login/logout to set/remove token
export function setAuthToken(token) {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
}

function hideLoaderWithDelay() {
  setTimeout(() => {
    if (activeRequests === 0) setGlobalLoading(false);
  }, 400); // 400ms delay
}

axiosInstance.interceptors.response.use(
  response => {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) hideLoaderWithDelay();
    return response;
  },
  error => {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) hideLoaderWithDelay();
    return Promise.reject(error);
  }
);

export default axiosInstance;
