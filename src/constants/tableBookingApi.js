// API endpoint constants for table bookings
export const TABLE_BOOKING_API = {
  CREATE: "/tablebookings", // POST
  LIST: "/tablebookings", // GET
  GET_ONE: "/tablebookings/:id", // GET
  UPDATE: "/tablebookings/:id", // PUT
  DELETE: "/tablebookings/:id", // DELETE
  GET_RESTAURANT_SUMMARY: "/tablebookings/restaurant/:restaurantId/summary", // GET
  GET_AVAILABLE_TABLES: "/tablebookings/available/:restaurantId/:userId", // GET
};
