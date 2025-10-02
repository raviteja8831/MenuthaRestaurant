import api from "./api";
import { MENU_API } from "../constants/menuApi";
import { showApiError } from "../services/messagingService";

// Get all menus with their items
export const getMenusWithItems = async (restaurantId) => {
  // alert(restaurantId);
  try {
    const res = await api.get(`/menus/with-items/${restaurantId}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
// Get all items based on menu
export const getitemsbasedonmenu = async (menuId) => {
  try {
    const res = await api.get(`/menus/items/${menuId}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

// Save user allotted menu items (bulk)
export const saveUserMenuItems = async (userId, menuitemIds) => {
  try {
    // Send selectedUserId in the payload as well
    const res = await api.post(`/users/${userId}/allotted-menuitems`, {
      menuitemIds,
      userId,
    });
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const addMenuItem = async (data) => {
  try {
    const res = await api.post(MENU_API.ADDITEM, data);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

// Bulk status update for menu items
export const updateMenuItemsStatus = async (menuitemIds, status) => {
  try {
    const res = await api.put(MENU_API.UPDATE_STATUS_BULK, {
      menuitemIds,
      status,
    });
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
export const getSpecificMenu = async (menuId) => {
  try {
    const res = await api.get(
      `${MENU_API.GET_SPECIFIC_MENU.replace(":id", menuId)}`
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
