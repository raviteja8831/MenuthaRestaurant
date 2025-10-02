import { Notification } from '../interfaces/Notification';

export const notifications: Notification[] = [
  { id: 1, title: 'Order Ready', message: 'Order #123 is ready', time: '10:00 AM', read: false },
  { id: 2, title: 'New User', message: 'A new user has registered', time: '9:30 AM', read: true },
];
