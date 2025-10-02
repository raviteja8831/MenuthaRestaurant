// API endpoint constants for menu
export const MENU_API = {
  ADDITEM: "/menuitems", // POST
  UPDATE_STATUS_BULK: "/menuitems/updateStatus", // PUT
  GET_MENUS_WITH_ITEMS: "/menus/with-items",
  SAVE_USER_MENUITEMS: "/users/:userId/allotted-menuitems",
  GET_ITEMS_BASED_ON_MENU: "/menus/items/:menuId",
  GET_SPECIFIC_MENU: "/menus/:id",
};
