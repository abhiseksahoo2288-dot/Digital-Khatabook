'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AddTransactionForm } from '@/components/AddTransactionForm';
import { Button } from '@/components/ui/button';
import { useCustomers } from '@/hooks/useCustomers';
import { ArrowLeft } from 'lucide-react';
import { Customer } from '@/types';

export default function AddTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  
  const { customers } = useCustomers();
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const foundCustomer = customers.find(c => c.id === customerId);
    setCustomer(foundCustomer || null);
  }, [customers, customerId]);

  const handleSuccess = () => {
    router.push(`/customers/${customerId}`);
  };

  const handleClose = () => {
    router.push(`/customers/${customerId}`);
  };

  if (!customer) {
    return (
      <DashboardLayout title="Add Transaction">
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

  return (
    <DashboardLayout title={`Add Transaction - ${customer.name}`}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href={`/customers/${customerId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {customer.name}
            </Button>
          </Link>
        </div>

        <AddTransactionForm
          customerId={customerId}
          customerName={customer.name}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </DashboardLayout>
  );
}