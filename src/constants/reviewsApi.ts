// API endpoint constants for reviews
export const REVIEWS_API = {
  LIST: '/reviews/list',
  ADD: '/reviews/add',
  UPDATE: '/reviews/update',
  DELETE: '/reviews/delete',
};

// Request/Response interfaces
export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  rating: number;
  comment: string;
  // Add other fields as needed
}

export interface ReviewsListResponse {
  reviews: Review[];
}

export interface ReviewAddRequest {
  userId: string;
  restaurantId: string;
  rating: number;
  comment: string;
}

export interface ReviewUpdateRequest {
  id: string;
  rating?: number;
  comment?: string;
}

export interface ReviewDeleteResponse {
  success: boolean;
}
