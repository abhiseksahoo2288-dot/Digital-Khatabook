'use client';

import { Transaction, Customer } from '@/types';
import { formatCurrency, formatRelativeTime, capitalizeFirst } from '@/utils/format';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/hooks/useTransactions';

interface TransactionListProps {
  transactions: Transaction[];
  customers: Customer[];
  showCustomerName?: boolean;
  onTransactionDelete?: (transactionId: string) => void;
}

export function TransactionList({ 
  transactions, 
  customers, 
  showCustomerName = false,
  onTransactionDelete 
}: TransactionListProps) {
  const { removeTransaction } = useTransactions();

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  const handleDelete = async (transactionId: string, customerId: string) => {
    try {
      await removeTransaction(transactionId, customerId);
      onTransactionDelete?.(transactionId);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              transaction.type === 'credit' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {transaction.type === 'credit' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className={`font-semibold ${
                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
                {showCustomerName && (
                  <span className="text-sm text-gray-600">
                    • {getCustomerName(transaction.customerId)}
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-600 space-x-2">
                {transaction.item && (
                  <span>{transaction.item}</span>
                )}
                {transaction.quantity && (
                  <span>• Qty: {transaction.quantity}</span>
                )}
                <span>• {capitalizeFirst(transaction.paymentMethod)}</span>
                <span>• {formatRelativeTime(transaction.createdAt)}</span>
                <span className="text-xs text-gray-500">
                  • {transaction.type === 'credit' ? 'Customer owes' : 'Payment received'}
                </span>
              </div>
              
              {transaction.note && (
                <div className="text-sm text-gray-500 mt-1">
                  Note: {transaction.note}
                </div>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(transaction.id, transaction.customerId)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}