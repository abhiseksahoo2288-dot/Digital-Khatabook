import { useEffect, useState } from 'react';
import { subscribeToTransactions, addTransaction, deleteTransaction } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { Transaction, AddTransactionForm, TransactionFilters } from '@/types';
import { isWithinInterval, parseISO } from 'date-fns';

export const useTransactions = (customerId?: string) => {
  const { user } = useAuthStore();
  const { transactions, setTransactions } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToTransactions(
      user.uid,
      (updatedTransactions) => {
        setTransactions(updatedTransactions);
      },
      customerId
    );

    return () => unsubscribe();
  }, [user, customerId, setTransactions]);

  const createTransaction = async (
    customerId: string,
    transactionData: AddTransactionForm
  ) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const transactionId = await addTransaction(user.uid, customerId, transactionData);
      return transactionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create transaction';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeTransaction = async (transactionId: string, customerId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteTransaction(transactionId, customerId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = (filters: TransactionFilters) => {
    let filtered = transactions;

    // Filter by customer
    if (filters.customerId) {
      filtered = filtered.filter(t => t.customerId === filters.customerId);
    }

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Filter by payment method
    if (filters.paymentMethod) {
      filtered = filtered.filter(t => t.paymentMethod === filters.paymentMethod);
    }

    // Filter by amount range
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(t => t.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(t => t.amount <= filters.maxAmount!);
    }

    // Filter by date range
    if (filters.dateFrom && filters.dateTo) {
      filtered = filtered.filter(t =>
        isWithinInterval(t.createdAt, {
          start: filters.dateFrom!,
          end: filters.dateTo!,
        })
      );
    }

    return filtered;
  };

  const getTransactionsByCustomer = (customerId: string) => {
    return transactions.filter(t => t.customerId === customerId);
  };

  const getRecentTransactions = (limit: number = 10) => {
    return transactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  };

  return {
    transactions,
    loading,
    error,
    createTransaction,
    removeTransaction,
    filterTransactions,
    getTransactionsByCustomer,
    getRecentTransactions,
  };
};