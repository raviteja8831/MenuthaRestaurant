import axios from "axios";
import { API_BASE_URL } from "../constants/api.constants";
import api from "./api";

// Create a new customer
export const createCustomer = async (customerData) => {
  try {
   

    const response = await api.post(
      `/customers`,
      customerData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get customer by ID
export const getCustomerById = async (id) => {
  try {
    const response = await api.get(`${API_BASE_URL}/customers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get customer by phone number
export const getCustomerLogin = async (searchParams) => {
  try {
     console.log(API_BASE_URL, 'API_BASE_URL')

    const response = await api.post(
      `${API_BASE_URL}/customers/login`,
      searchParams
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update customer
export const updateCustomer = async (id, customerData) => {
  console.log(API_BASE_URL, 'API_BASE_URL')
  try {
    const response = await api.put(
      `${API_BASE_URL}/customers/${id}`,
      customerData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete customer
export const deleteCustomer = async (id) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/customers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all customers
export const getAllCustomers = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/customers`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
