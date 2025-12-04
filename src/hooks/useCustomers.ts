import { useEffect, useState } from 'react';
import { subscribeToCustomers, addCustomer, updateCustomer, deleteCustomer } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { Customer, AddCustomerForm } from '@/types';

export const useCustomers = () => {
  const { user } = useAuthStore();
  const { customers, setCustomers } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    console.log('Setting up customer subscription for user:', user.uid);
    const unsubscribe = subscribeToCustomers(user.uid, (updatedCustomers) => {
      console.log('Received customers update:', updatedCustomers);
      setCustomers(updatedCustomers);
    });

    return () => unsubscribe();
  }, [user, setCustomers]);

  const createCustomer = async (customerData: AddCustomerForm) => {
    if (!user) throw new Error('User not authenticated');
    
    console.log('Creating customer with data:', customerData);
    setLoading(true);
    setError(null);
    
    try {
      const customerId = await addCustomer(user.uid, customerData);
      console.log('Customer created successfully:', customerId);
      return customerId;
    } catch (err) {
      console.error('Error creating customer:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create customer';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerData = async (customerId: string, updates: Partial<Customer>) => {
    setLoading(true);
    setError(null);
    
    try {
      await updateCustomer(customerId, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeCustomer = async (customerId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteCustomer(customerId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = (query: string) => {
    if (!query.trim()) return customers;
    
    const lowercaseQuery = query.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(lowercaseQuery) ||
        customer.phone.includes(query)
    );
  };

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomerData,
    removeCustomer,
    searchCustomers,
  };
};