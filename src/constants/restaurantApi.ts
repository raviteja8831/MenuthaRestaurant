export const RESTAURANT_API = {
  CREATE: "/restaurants",
  GET_ALL: "/restaurants",
  GET_ONE: (id: number) => `/restaurants/${id}`,
  UPDATE: (id: number) => `/restaurants/${id}`,
  DELETE: (id: number) => `/restaurants/${id}`,
};
