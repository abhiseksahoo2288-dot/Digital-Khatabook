'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCustomers } from '@/hooks/useCustomers';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/utils/format';
import { Users, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { ChartCreditDebit } from '@/components/ChartCreditDebit';
import { ChartDailyActivity } from '@/components/ChartDailyActivity';
import { TransactionList } from '@/components/TransactionList';

export default function DashboardPage() {
  const { customers } = useCustomers();
  const { transactions, getRecentTransactions } = useTransactions();
  
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalCredit: 0,
    totalDebit: 0,
    pendingBalance: 0,
  });

  useEffect(() => {
    const totalCustomers = customers.length;
    const totalCredit = customers.reduce((sum, customer) => sum + customer.totalCredit, 0);
    const totalDebit = customers.reduce((sum, customer) => sum + customer.totalDebit, 0);
    const pendingBalance = totalDebit - totalCredit;

    setStats({
      totalCustomers,
      totalCredit,
      totalDebit,
      pendingBalance,
    });
  }, [customers]);

  const recentTransactions = getRecentTransactions(5);

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      icon: <Users className="h-6 w-6 text-blue-600" />,
      color: 'text-blue-600',
    },
    {
      title: 'Total Credit',
      value: formatCurrency(stats.totalCredit),
      icon: <TrendingUp className="h-6 w-6 text-green-600" />,
      color: 'text-green-600',
    },
    {
      title: 'Total Debit',
      value: formatCurrency(stats.totalDebit),
      icon: <TrendingDown className="h-6 w-6 text-red-600" />,
      color: 'text-red-600',
    },
    {
      title: 'Outstanding Amount',
      value: formatCurrency(Math.abs(stats.pendingBalance)),
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      color: stats.pendingBalance < 0 ? 'text-red-600' : 'text-green-600',
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Credit vs Debit</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartCreditDebit 
                creditAmount={stats.totalCredit}
                debitAmount={stats.totalDebit}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartDailyActivity transactions={transactions} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList 
              transactions={recentTransactions}
              customers={customers}
              showCustomerName={true}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}