// API endpoint constants for favorites
export const FAVORITES_API = {
  LIST: '/api/favorites',
  ADD: '/api/favorites/add',
  REMOVE: '/api/favorites/remove',
  CHECK: '/api/favorites/check',
};

// Request/Response interfaces
export interface Favorite {
  id: string;
  userId: string;
  restaurantId: string;
  restaurant?: {
    id: string;
    name: string;
    address: string;
    logoImage: string;
    restaurantType: string;
    latitude: number;
    longitude: number;
    enableBuffet: boolean;
    enableVeg: boolean;
    enableNonveg: boolean;
    enableTableService: boolean;
    enableSelfService: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FavoritesListResponse {
  status: string;
  data: Favorite[];
  count: number;
}

export interface FavoriteAddRequest {
  userId: string;
  restaurantId: string;
}

export interface FavoriteRemoveRequest {
  userId: string;
  restaurantId: string;
}

export interface FavoriteCheckResponse {
  status: string;
  isFavorite: boolean;
}

export interface FavoriteResponse {
  status: string;
  message: string;
  data?: any;
}