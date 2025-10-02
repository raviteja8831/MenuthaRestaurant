export interface DashboardData {
  restaurantName: string;
  managerName: string;
  today: string;
  date: string;
  orders: number;
  tablesServed: number;
  customers: number;
  transactionAmt: string;
  reservedTables: number;
  nonReservedTables: number;
  chefLogins: number;
  chefLogouts: number;
  yearOrders: string;
  monthOrders: string;
  weekOrders: string;
  chartData: number[];
  chartLabels: string[];
  incomeData: number[];
  incomeLabels: string[];
}
