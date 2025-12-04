// User types
export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: Date;
}

// Customer types
export interface Customer {
  id: string;
  userId: string;
  name: string;
  phone: string;
  address?: string;
  qrCodeUrl?: string;
  createdAt: Date;
  totalCredit: number;
  totalDebit: number;
  balance: number;
}

// Transaction types
export type TransactionType = 'credit' | 'debit';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'pending';

export interface Transaction {
  id: string;
  customerId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  item?: string;
  quantity?: number;
  paymentMethod: PaymentMethod;
  note?: string;
  createdAt: Date;
}

// Dashboard stats
export interface DashboardStats {
  totalCustomers: number;
  totalCredit: number;
  totalDebit: number;
  pendingBalance: number;
  recentTransactions: Transaction[];
}

// Chart data types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface DailyActivityData {
  date: string;
  credit: number;
  debit: number;
}

// Form types
export interface AddCustomerForm {
  name: string;
  phone: string;
  address?: string;
}

export interface AddTransactionForm {
  type: TransactionType;
  amount: number;
  item?: string;
  quantity?: number;
  paymentMethod: PaymentMethod;
  note?: string;
}

// Filter types
export interface TransactionFilters {
  dateFrom?: Date;
  dateTo?: Date;
  customerId?: string;
  type?: TransactionType;
  paymentMethod?: PaymentMethod;
  minAmount?: number;
  maxAmount?: number;
}