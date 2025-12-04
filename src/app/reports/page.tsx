'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionList } from '@/components/TransactionList';
import { useCustomers } from '@/hooks/useCustomers';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionFilters, TransactionType, PaymentMethod } from '@/types';
import { formatCurrency } from '@/utils/format';
import { Download, Filter, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportsPage() {
  const { customers } = useCustomers();
  const { transactions, filterTransactions } = useTransactions();
  
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = filterTransactions(filters);

  const stats = {
    totalTransactions: filteredTransactions.length,
    totalCredit: filteredTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0),
    totalDebit: filteredTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0),
  };

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const exportToPDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const pdf = new jsPDF();
      
      pdf.setFontSize(20);
      pdf.text('Transaction Report', 20, 30);
      
      pdf.setFontSize(12);
      pdf.text(`Total Transactions: ${stats.totalTransactions}`, 20, 50);
      pdf.text(`Total Credit: ₹${stats.totalCredit}`, 20, 60);
      pdf.text(`Total Debit: ₹${stats.totalDebit}`, 20, 70);
      
      let yPos = 90;
      filteredTransactions.slice(0, 20).forEach((transaction, index) => {
        const customer = customers.find(c => c.id === transaction.customerId);
        const text = `${index + 1}. ${customer?.name || 'Unknown'} - ${transaction.type.toUpperCase()} - ₹${transaction.amount}`;
        pdf.text(text, 20, yPos);
        yPos += 10;
      });
      
      pdf.save(`transactions-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    });
  };

  const exportToCSV = () => {
    // Generate CSV export
    const csvContent = [
      ['Date', 'Customer', 'Type', 'Amount', 'Item', 'Payment Method', 'Note'],
      ...filteredTransactions.map(transaction => {
        const customer = customers.find(c => c.id === transaction.customerId);
        return [
          format(transaction.createdAt, 'yyyy-MM-dd HH:mm'),
          customer?.name || 'Unknown',
          transaction.type,
          transaction.amount.toString(),
          transaction.item || '',
          transaction.paymentMethod,
          transaction.note || '',
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
            <p className="text-gray-600">Generate and export transaction reports</p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            
            <Button variant="outline" onClick={exportToPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Date From</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom ? format(filters.dateFrom, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Date To</Label>
                  <Input
                    type="date"
                    value={filters.dateTo ? format(filters.dateTo, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select
                    value={filters.customerId || ''}
                    onValueChange={(value) => handleFilterChange('customerId', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All customers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All customers</SelectItem>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Transaction Type</Label>
                  <Select
                    value={filters.type || ''}
                    onValueChange={(value: TransactionType | '') => handleFilterChange('type', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="debit">Debit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={filters.paymentMethod || ''}
                    onValueChange={(value: PaymentMethod | '') => handleFilterChange('paymentMethod', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All methods</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Min Amount</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={filters.minAmount || ''}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Minimum amount"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Max Amount</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={filters.maxAmount || ''}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Maximum amount"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTransactions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Credit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(stats.totalCredit)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Debit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {formatCurrency(stats.totalDebit)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>
              Filtered Transactions ({filteredTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList 
              transactions={filteredTransactions}
              customers={customers}
              showCustomerName={true}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}