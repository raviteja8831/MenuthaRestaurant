import type { User, TopOrder, OrderHistory } from '../interfaces/User';

// Users tab mock data
export const users: User[] = [
  { name: "Mohan", role: "Manager" },
  { name: "Kiran", role: "Chef" },
  { name: "Anil", role: "Chef" },
  { name: "Anoop", role: "Chef" },
  { name: "Vishal", role: "Chef" },
  { name: "Anthony", role: "Chef" },
];
export const allottedDishes: string[] = [
  "Masala Dosa", "Plain Dosa", "Rava Dosa", "Paper Dosa", "Masala Paper Dosa",
  "Set Dosa", "Pesarttu", "Cheese Dosa", "Neer Dosa", "Adai Dosa", "Oats Dosa",
  "Masala Oats Dosa", "Moong Dal Dosa", "Jower Dosa", "Butter Dosa", "Masala Butter Dosa",
  "Paneer Dosa", "Masala Paneer Dosa", "Poori"
];
export const todayLoginTime = "8:00 AM";
export const totalOrders = 65;
export const topOrders: TopOrder[] = [
  { name: "Masala Dosa", count: 20 },
  { name: "Set Dosa", count: 12 },
  { name: "Paper Dosa", count: 10 },
];
export const orderHistory: OrderHistory[] = [
  { msg: "Masala Dosa 4 Nos to Table No 5", time: "9:20AM" },
  { msg: "Set Dosa 3 Nos to Table No 4", time: "9:15PM" },
  { msg: "Plain Dosa 6 Nos to Table No 7", time: "9:10AM" },
  { msg: "Oats Dosa 1 Nos to Table No 1", time: "9:08AM" },
  { msg: "Onion Dosa 6 Nos to Parcel Table", time: "9:00AM" },
];
