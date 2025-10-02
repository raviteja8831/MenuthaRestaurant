import { TabName } from '../interfaces/TabNames';

export const TABS: { key: TabName; icon: string; label: string; route: string }[] = [
  { key: 'Dashboard', icon: 'home', label: 'Dashboard', route: '/screens/DashboardScreen' },
  { key: 'Users', icon: 'account', label: 'Users', route: '/screens/UsersTabScreen' },
  { key: 'QRCode', icon: 'qrcode', label: 'QR Code', route: '/screens/QRCodeTabScreen' },
  { key: 'Notifications', icon: 'bell', label: 'Notifications', route: '/screens/NotificationsTabScreen' },
];
