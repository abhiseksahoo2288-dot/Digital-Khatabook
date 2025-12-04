'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions } from '@/hooks/useTransactions';
import { AddTransactionForm as AddTransactionFormType, AddTransactionFormErrors, TransactionType, PaymentMethod } from '@/types';
import { X } from 'lucide-react';

interface AddTransactionFormProps {
  customerId: string;
  customerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddTransactionForm({ 
  customerId, 
  customerName, 
  onClose, 
  onSuccess 
}: AddTransactionFormProps) {
  const { createTransaction, loading } = useTransactions();
  const [formData, setFormData] = useState<AddTransactionFormType>({
    type: 'credit',
    amount: 0,
    item: '',
    quantity: 1,
    paymentMethod: 'cash',
    note: '',
  });
  const [errors, setErrors] = useState<AddTransactionFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: AddTransactionFormErrors = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (formData.quantity && formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await createTransaction(customerId, formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleInputChange = (field: keyof AddTransactionFormType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'amount' || field === 'quantity') {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add Transaction - {customerName}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: TransactionType) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit (Sale on credit - Customer owes you)</SelectItem>
                  <SelectItem value="debit">Debit (Cash sale or Payment received)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="Enter amount"
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="item">Item/Description</Label>
              <Input
                id="item"
                type="text"
                value={formData.item}
                onChange={(e) => handleInputChange('item', e.target.value)}
                placeholder="What was purchased/sold?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                placeholder="Enter quantity"
                className={errors.quantity ? 'border-red-500' : ''}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value: PaymentMethod) => handleInputChange('paymentMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Input
                id="note"
                type="text"
                value={formData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                placeholder="Additional notes (optional)"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Adding...' : 'Add Transaction'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}