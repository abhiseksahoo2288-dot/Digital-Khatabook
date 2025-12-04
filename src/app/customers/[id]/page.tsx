'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransactionList } from '@/components/TransactionList';
import { BalanceBadge } from '@/components/BalanceBadge';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { useCustomers } from '@/hooks/useCustomers';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency, formatPhone, formatDate } from '@/utils/format';
import { generateTransactionReceipt } from '@/utils/pdf';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Plus, 
  QrCode, 
  Download,
  ArrowLeft 
} from 'lucide-react';
import { Customer } from '@/types';

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;
  
  const { customers } = useCustomers();
  const { getTransactionsByCustomer } = useTransactions();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const foundCustomer = customers.find(c => c.id === customerId);
    setCustomer(foundCustomer || null);
  }, [customers, customerId]);

  if (!customer) {
    return (
      <DashboardLayout title="Customer Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-500 mb-4">Customer not found</div>
            <Link href="/customers">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Customers
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const customerTransactions = getTransactionsByCustomer(customerId);

  const generateCustomerReport = () => {
    // This would generate a PDF report for the customer
    console.log('Generating customer report...');
  };

  return (
    <DashboardLayout title={customer.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/customers">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              <p className="text-gray-600">Customer Details</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowQR(true)}
            >
              <QrCode className="mr-2 h-4 w-4" />
              QR Code
            </Button>
            
            <Button
              variant="outline"
              onClick={generateCustomerReport}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            
            <Link href={`/customers/${customerId}/add-transaction`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </Link>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{formatPhone(customer.phone)}</span>
              </div>
              
              {customer.address && (
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span className="text-sm">{customer.address}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  Customer since {formatDate(customer.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Current Balance</div>
                <BalanceBadge balance={customer.balance} size="lg" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Total Credit</div>
                  <div className="font-semibold text-green-600">
                    {formatCurrency(customer.totalCredit)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Total Debit</div>
                  <div className="font-semibold text-red-600">
                    {formatCurrency(customer.totalDebit)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Total Transactions</div>
                <div className="text-2xl font-bold">{customerTransactions.length}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Last Transaction</div>
                <div className="text-sm">
                  {customerTransactions.length > 0 
                    ? formatDate(customerTransactions[0].createdAt)
                    : 'No transactions yet'
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList 
              transactions={customerTransactions}
              customers={[customer]}
              showCustomerName={false}
            />
          </CardContent>
        </Card>

        {/* QR Code Modal */}
        {showQR && (
          <QRCodeGenerator
            customerId={customer.id}
            customerName={customer.name}
            onClose={() => setShowQR(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}