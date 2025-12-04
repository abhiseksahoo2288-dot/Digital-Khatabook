'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Transaction } from '@/types';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface ChartDailyActivityProps {
  transactions: Transaction[];
}

export function ChartDailyActivity({ transactions }: ChartDailyActivityProps) {
  const chartData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 6); // Last 7 days
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(day => {
      const dayTransactions = transactions.filter(transaction => {
        const transactionDate = format(transaction.createdAt, 'yyyy-MM-dd');
        const currentDay = format(day, 'yyyy-MM-dd');
        return transactionDate === currentDay;
      });
      
      const credit = dayTransactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const debit = dayTransactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date: format(day, 'MMM dd'),
        credit,
        debit,
      };
    });
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No transaction data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis 
            tickFormatter={(value) => 
              new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                notation: 'compact',
              }).format(value)
            }
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(value),
              name === 'credit' ? 'Credit' : 'Debit'
            ]}
          />
          <Legend />
          <Bar dataKey="credit" fill="#10B981" name="Credit" />
          <Bar dataKey="debit" fill="#EF4444" name="Debit" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}