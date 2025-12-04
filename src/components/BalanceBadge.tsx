'use client';

import { formatCurrency } from '@/utils/format';

interface BalanceBadgeProps {
  balance: number;
  size?: 'sm' | 'md' | 'lg';
}

export function BalanceBadge({ balance, size = 'md' }: BalanceBadgeProps) {
  const isPositive = balance >= 0;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${sizeClasses[size]}
        ${isPositive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
        }
      `}
    >
      {isPositive ? '+' : ''}{formatCurrency(balance)}
    </span>
  );
}