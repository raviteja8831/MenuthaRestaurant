export const ORDER_API = {
  CREATE_ORDER: "/orders/create", // POST
  DELETE_ORDER: "/orders/delete", // DELETE
  UPDATE_ORDER: "/orders/:orderId", // PUT
  DELETE_ORDER_ITEMS: "/orders/delete/items", // POST
  UPDATE_ORDER_PRODUCT_STATUS_LIST: "/orders/orderproduct/:orderId", // PUT
  // GET_PENDING_ORDERS: (restaurantId: number, userId: number) =>
  //   `/orders/pending/${restaurantId}/${userId}`, // GET
};
