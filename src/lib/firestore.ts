import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Customer, Transaction, AddCustomerForm, AddTransactionForm } from '@/types';

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  CUSTOMERS: 'customers',
  TRANSACTIONS: 'transactions',
} as const;

// User operations
export const createUser = async (userData: Omit<User, 'createdAt'>) => {
  const userRef = doc(db, COLLECTIONS.USERS, userData.uid);
  await setDoc(userRef, {
    ...userData,
    createdAt: Timestamp.now(),
  }, { merge: true });
};

export const getUser = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
    } as User;
  }
  return null;
};

// Customer operations
export const addCustomer = async (userId: string, customerData: AddCustomerForm): Promise<string> => {
  console.log('Adding customer:', customerData);
  const customerRef = await addDoc(collection(db, COLLECTIONS.CUSTOMERS), {
    ...customerData,
    userId,
    createdAt: Timestamp.now(),
    totalCredit: 0,
    totalDebit: 0,
    balance: 0,
  });
  console.log('Customer added with ID:', customerRef.id);
  return customerRef.id;
};

export const updateCustomer = async (customerId: string, updates: Partial<Customer>) => {
  const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
  await updateDoc(customerRef, updates);
};

export const deleteCustomer = async (customerId: string) => {
  const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
  await deleteDoc(customerRef);
};

export const getCustomers = async (userId: string): Promise<Customer[]> => {
  const q = query(
    collection(db, COLLECTIONS.CUSTOMERS),
    where('userId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  }) as Customer[];
};

export const getCustomer = async (customerId: string): Promise<Customer | null> => {
  const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
  const customerSnap = await getDoc(customerRef);
  
  if (customerSnap.exists()) {
    const data = customerSnap.data();
    return {
      id: customerSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    } as Customer;
  }
  return null;
};

// Transaction operations
export const addTransaction = async (
  userId: string,
  customerId: string,
  transactionData: AddTransactionForm
): Promise<string> => {
  console.log('Adding transaction:', transactionData);
  const batch = writeBatch(db);
  
  // Add transaction
  const transactionRef = doc(collection(db, COLLECTIONS.TRANSACTIONS));
  batch.set(transactionRef, {
    ...transactionData,
    customerId,
    userId,
    createdAt: Timestamp.now(),
  });
  
  // Update customer balance
  const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
  const customer = await getCustomer(customerId);
  
  if (customer) {
    const newTotalCredit = transactionData.type === 'credit' 
      ? customer.totalCredit + transactionData.amount 
      : customer.totalCredit;
    const newTotalDebit = transactionData.type === 'debit' 
      ? customer.totalDebit + transactionData.amount 
      : customer.totalDebit;
    const newBalance = newTotalDebit - newTotalCredit;
    
    batch.update(customerRef, {
      totalCredit: newTotalCredit,
      totalDebit: newTotalDebit,
      balance: newBalance,
    });
  }
  
  await batch.commit();
  console.log('Transaction added with ID:', transactionRef.id);
  return transactionRef.id;
};

export const getTransactions = async (
  userId: string,
  customerId?: string,
  limitCount?: number
): Promise<Transaction[]> => {
  let q = query(
    collection(db, COLLECTIONS.TRANSACTIONS),
    where('userId', '==', userId)
  );
  
  if (customerId) {
    q = query(q, where('customerId', '==', customerId));
  }
  
  if (limitCount) {
    q = query(q, limit(limitCount));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  }) as Transaction[];
};

export const deleteTransaction = async (transactionId: string, customerId: string) => {
  const batch = writeBatch(db);
  
  // Get transaction to update customer balance
  const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, transactionId);
  const transactionSnap = await getDoc(transactionRef);
  
  if (transactionSnap.exists()) {
    const transaction = transactionSnap.data() as Transaction;
    
    // Delete transaction
    batch.delete(transactionRef);
    
    // Update customer balance
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    const customer = await getCustomer(customerId);
    
    if (customer) {
      const newTotalCredit = transaction.type === 'credit' 
        ? customer.totalCredit - transaction.amount 
        : customer.totalCredit;
      const newTotalDebit = transaction.type === 'debit' 
        ? customer.totalDebit - transaction.amount 
        : customer.totalDebit;
      const newBalance = newTotalDebit - newTotalCredit;
      
      batch.update(customerRef, {
        totalCredit: newTotalCredit,
        totalDebit: newTotalDebit,
        balance: newBalance,
      });
    }
    
    await batch.commit();
  }
};

// Realtime listeners
export const subscribeToCustomers = (userId: string, callback: (customers: Customer[]) => void) => {
  console.log('Setting up customer subscription for userId:', userId);
  const q = query(
    collection(db, COLLECTIONS.CUSTOMERS),
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    console.log('Customer snapshot received, docs count:', querySnapshot.docs.length);
    const customers = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Customer doc:', doc.id, data);
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    }) as Customer[];
    console.log('Processed customers:', customers);
    callback(customers);
  }, (error) => {
    console.error('Error in customer subscription:', error);
  });
};

export const subscribeToTransactions = (
  userId: string,
  callback: (transactions: Transaction[]) => void,
  customerId?: string
) => {
  let q = query(
    collection(db, COLLECTIONS.TRANSACTIONS),
    where('userId', '==', userId)
  );
  
  if (customerId) {
    q = query(q, where('customerId', '==', customerId));
  }
  
  return onSnapshot(q, (querySnapshot) => {
    const transactions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    }) as Transaction[];
    callback(transactions);
  }, (error) => {
    console.error('Error in transaction subscription:', error);
  });
};