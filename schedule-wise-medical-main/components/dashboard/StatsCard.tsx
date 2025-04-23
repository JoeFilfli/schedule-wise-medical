import React from 'react';
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';

type StatsCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
};

export default function StatsCard({
  title,
  value,
  icon,
  change,
  description,
  className = '',
}: StatsCardProps) {
  return (
    <div className={`card hover:shadow-card-hover dark:hover:shadow-card-hover-dark transition-shadow duration-300 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">{value}</h3>
          
          {change && (
            <div className="flex items-center">
              <span 
                className={`inline-flex items-center text-sm font-medium ${
                  change.isPositive 
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {change.isPositive ? (
                  <IconArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <IconArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {Math.abs(change.value)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">from last period</span>
            </div>
          )}
          
          {description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-500 dark:text-primary-400">
          {icon}
        </div>
      </div>
    </div>
  );
} 