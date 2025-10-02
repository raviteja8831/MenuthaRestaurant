// API endpoint constants for customer
export const CUSTOMER_API = {
  CREATE: "/api/customers", // POST - Create new customer
  GET_ALL: "/api/customers", // GET - Get all customers
  GET_BY_ID: "/api/customers/:id", // GET - Get customer by ID
  GET_BY_PHONE: "/api/customers/phone/:phone", // GET - Get customer by phone
  UPDATE: "/api/customers/:id", // PUT - Update customer
  DELETE: "/api/customers/:id", // DELETE - Delete customer
  GET_ORDERS: "/api/customers/:id/orders", // GET - Get customer's orders
  GET_PROFILE: "/api/customers/:id/profile", // GET - Get customer profile
  UPDATE_PROFILE: "/api/customers/:id/profile", // PUT - Update customer profile
  GET_FAVORITES: "/api/customers/:id/favorites", // GET - Get customer's favorite restaurants
};

// Parameter replacement helper
export const replaceParams = (
  url: string,
  params: { [key: string]: string | number }
) => {
  let finalUrl = url;
  Object.keys(params).forEach((key) => {
    finalUrl = finalUrl.replace(`:${key}`, params[key].toString());
  });
  return finalUrl;
};
