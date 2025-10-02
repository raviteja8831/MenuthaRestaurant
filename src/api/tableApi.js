import api from './api';
import { TABLE_API } from '../constants/tableApi';
import { showApiError } from '../services/messagingService';

export const fetchTables = async () => {
  try {
    const res = await api.get(TABLE_API.LIST);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const addTable = async (tableData) => {
  try {
    const res = await api.post(TABLE_API.ADD, tableData);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};


// For QR tables, use /api/qrcodes/:id (PUT)
export const updateTable = async (id, tableData) => {
  try {
    const res = await api.put(`/qrcodes/${id}`, tableData);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};


// For QR tables, use /api/qrcodes/:id (DELETE)
export const deleteTable = async (id) => {
  try {
    const res = await api.delete(`/qrcodes/${id}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
