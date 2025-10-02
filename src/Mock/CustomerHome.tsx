export interface Filter {
  name: string;
  count: number;
}

export interface UserData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImage?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: string;
  total: string;
}

export interface HistoryItem {
  id: number;
  hotelName: string;
  address: string;
  date: string;
  time: string;
  members: number;
  totalAmount: string;
  items?: OrderItem[];
}

export interface FavoriteItem {
  id: number;
  hotelName: string;
  description: string;
  rating: number;
  status: string;
}

export interface TransactionItem {
  id: number;
  hotelName: string;
  members: number;
  totalAmount: string;
  date: string;
  time: string;
}

export interface MenuCategory {
  id: number;
  name: string;
  icon: string;
  image: string;
  count: number;
}

export interface MenuItem {
  id: number;
  name: string;
  price: string;
  description: string;
  image: string | null;
  selected?: boolean;
  quantity?: number;
  category?: string;
}

export interface BuffetData {
  type: string;
  description: string;
  price: number;
  availableTime?: string;
  items?: string[];
}
export interface MenuItemsByCategory {
  category: string;
  items: MenuItem[];
}

export interface HotelOption {
  icon: string;
  label: string;
  route?: string;
}

export interface HotelReview {
  reviewer: string;
  stars: number;
  text: string;
}

export interface HotelDetailData {
  id: number;
  name: string;
  starRating: number;
  address: string;
  image: string;
  options: HotelOption[];
  reviews: HotelReview[];
  averageWaitingTime: string;
  tablesAvailable: number;
}

export interface RestaurantData {
  id: number;
  name: string;
  rating: number;
  type: string;
  address: string;
  description: string;
  status: string;
  waitingTime: string;
}

export const CustomerHome: Filter[] = [
  { name: "Near Me", count: 0 },
  { name: "3 Star Hotel", count: 0 },
  { name: "5 Star Hotel", count: 0 },
  { name: "Only Veg Restaurant", count: 0 },
  { name: "Only Non Veg Restaurant", count: 0 },
  { name: "Only Bar & Restaurant", count: 0 },
  { name: "5 Star Rating", count: 0 },
  { name: "Only Buffet", count: 0 },
  { name: "Only Self Service", count: 0 },
  { name: "Only Table Service", count: 9 },
];
