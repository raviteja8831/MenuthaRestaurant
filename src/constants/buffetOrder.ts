// API endpoint constants for buffet orders
export const BUFFET_API = {
  CREATE: "/buffet/create",
  LIST: "/buffet/list",
  UPDATE: "/buffet/update",
  DELETE: "/buffet/delete",
  DETAILS: "/buffet/details",
  BOOKINGS: "/buffet/bookings",
  AVAILABILITY: "/buffet/availability",
  PRICING: "/buffet/pricing",
};

/* // Base buffet interface
export interface Buffet {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  capacity: number;
  startTime: string;
  endTime: string;
}

// Request/Response interfaces
export interface CreateBuffetRequest {
  name: string;
  description: string;
  price: number;
  capacity: number;
  startTime: string;
  endTime: string;
}

export interface UpdateBuffetRequest extends Partial<CreateBuffetRequest> {
  id: string;
}

export interface BuffetListResponse {
  buffets: Buffet[];
  total: number;
}

export interface BuffetDetailsResponse {
  buffet: Buffet;
}

export interface BuffetBooking {
  id: string;
  buffetId: string;
  customerId: string;
  bookingDate: string;
  numberOfGuests: number;
  status: "confirmed" | "pending" | "cancelled";
}

export interface BuffetBookingsResponse {
  bookings: BuffetBooking[];
  total: number;
}

export interface BuffetAvailabilityResponse {
  isAvailable: boolean;
  remainingCapacity: number;
  nextAvailableSlot?: string;
}

export interface BuffetPricingResponse {
  basePrice: number;
  specialOffers: {
    id: string;
    description: string;
    discountedPrice: number;
  }[];
}
 */
