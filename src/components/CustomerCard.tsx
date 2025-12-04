'use client';

import Link from 'next/link';
import { Customer } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPhone } from '@/utils/format';
import { User, Phone, MapPin, Plus, Eye, QrCode } from 'lucide-react';
import { BalanceBadge } from '@/components/BalanceBadge';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { useState } from 'react';

interface CustomerCardProps {
  customer: Customer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Phone className="h-3 w-3 mr-1" />
                  {formatPhone(customer.phone)}
                </div>
              </div>
            </div>
            <BalanceBadge balance={customer.balance} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {customer.address && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-3 w-3 mr-2" />
              <span className="truncate">{customer.address}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Credit</span>
              <div className="font-semibold text-green-600">
                {formatCurrency(customer.totalCredit)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Total Debit</span>
              <div className="font-semibold text-red-600">
                {formatCurrency(customer.totalDebit)}
              </div>
            </div>
          </div>

          <div className="flex space-x-1">
            <Link href={`/customers/${customer.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-xs px-2">
                <Eye className="mr-1 h-3 w-3" />
                View
              </Button>
            </Link>
            
            <Link href={`/customers/${customer.id}/add-transaction`} className="flex-1">
              <Button size="sm" className="w-full text-xs px-2">
                <Plus className="mr-1 h-3 w-3" />
                Transaction
              </Button>
            </Link>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQR(true)}
              className="px-2"
            >
              <QrCode className="h-3 w-3" />
            </Button>
          </div>
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
    </>
  );
}