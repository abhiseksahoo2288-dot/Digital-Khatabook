import { create } from 'zustand';
import { Customer, Transaction, DashboardStats } from '@/types';

interface AppState {
  customers: Customer[];
  transactions: Transaction[];
  dashboardStats: DashboardStats | null;
  selectedCustomer: Customer | null;
  
  // Actions
  setCustomers: (customers: Customer[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setDashboardStats: (stats: DashboardStats) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  
  // Computed values
  getTotalCredit: () => number;
  getTotalDebit: () => number;
  getPendingBalance: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  customers: [],
  transactions: [],
  dashboardStats: null,
  selectedCustomer: null,
  
  setCustomers: (customers) => set({ customers }),
  setTransactions: (transactions) => set({ transactions }),
  setDashboardStats: (dashboardStats) => set({ dashboardStats }),
  setSelectedCustomer: (selectedCustomer) => set({ selectedCustomer }),
  
  getTotalCredit: () => {
    const { customers } = get();
    return customers.reduce((total, customer) => total + customer.totalCredit, 0);
  },
  
  getTotalDebit: () => {
    const { customers } = get();
    return customers.reduce((total, customer) => total + customer.totalDebit, 0);
  },
  
  getPendingBalance: () => {
    const { customers } = get();
    return customers.reduce((total, customer) => total + customer.balance, 0);
  },
}));