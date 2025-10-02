export interface Review {
  id: number;
  userId: number;
  restaurantId: number;
  review: string;
  createdAt: string;
  restaurant?: {
    name: string;
    address: string;
  };
}

export interface ReviewResponse {
  status: string;
  data: Review[] | Review;
  message?: string;
}

export interface ReviewRequest {
  userId: number;
  restaurantId: number;
  review: string;
}
