'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CustomerCard } from '@/components/CustomerCard';
import { AddCustomerForm } from '@/components/AddCustomerForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCustomers } from '@/hooks/useCustomers';
import { Plus, Search } from 'lucide-react';

export default function CustomersPage() {
  const { customers, searchCustomers } = useCustomers();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = searchQuery 
    ? searchCustomers(searchQuery) 
    : customers;

  return (
    <DashboardLayout title="Customers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
            <p className="text-gray-600">Manage your customer relationships</p>
          </div>
          
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search customers by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Customer Grid */}
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {searchQuery ? 'No customers found matching your search.' : 'No customers yet.'}
            </div>
            {!searchQuery && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Customer
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        )}

        {/* Add Customer Form Modal */}
        {showAddForm && (
          <AddCustomerForm
            onClose={() => {
              console.log('Closing add customer form');
              setShowAddForm(false);
            }}
            onSuccess={() => {
              console.log('Customer added successfully, closing form');
              setShowAddForm(false);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}