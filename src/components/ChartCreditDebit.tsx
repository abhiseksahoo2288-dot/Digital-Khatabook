'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChartCreditDebitProps {
  creditAmount: number;
  debitAmount: number;
}

export function ChartCreditDebit({ creditAmount, debitAmount }: ChartCreditDebitProps) {
  const data = [
    {
      name: 'Credit',
      value: creditAmount,
      color: '#10B981',
    },
    {
      name: 'Debit',
      value: debitAmount,
      color: '#EF4444',
    },
  ];

  const COLORS = ['#10B981', '#EF4444'];

  if (creditAmount === 0 && debitAmount === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No transaction data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [
              new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(value),
              ''
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}