'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  IconCalendarEvent, 
  IconClock, 
  IconMedicalCross,
  IconCreditCard,
  IconUsers,
  IconStar
} from '@tabler/icons-react';
import StatsCard from './StatsCard';

type DashboardWidget = {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
};

export default function ModernDashboard({ 
  userName,
  widgets,
  children
}: { 
  userName: string;
  widgets?: DashboardWidget[];
  children?: React.ReactNode;
}) {
  // Sample stats data (replace with real data from API)
  const stats = [
    {
      title: 'Upcoming Appointments',
      value: '3',
      icon: <IconCalendarEvent size={24} />,
      change: { value: 5, isPositive: true },
    },
    {
      title: 'Next Appointment',
      value: 'Today at 2 PM',
      icon: <IconClock size={24} />,
    },
    {
      title: 'Prescriptions',
      value: '4',
      icon: <IconMedicalCross size={24} />,
      change: { value: 2, isPositive: true },
    },
    {
      title: 'Pending Payments',
      value: '$120',
      icon: <IconCreditCard size={24} />,
      change: { value: 10, isPositive: false },
    }
  ];

  // Default widgets if none provided
  const defaultWidgets = [
    {
      title: 'Book Appointment',
      description: 'Schedule a new appointment with your preferred doctor',
      icon: <IconCalendarEvent size={20} />,
      href: '/appointments/new',
      color: 'bg-primary-500'
    },
    {
      title: 'Find Doctors',
      description: 'Browse through our network of medical professionals',
      icon: <IconUsers size={20} />,
      href: '/doctors',
      color: 'bg-secondary-500'
    },
    {
      title: 'View Reviews',
      description: 'See what others are saying about our doctors',
      icon: <IconStar size={20} />,
      href: '/reviews',
      color: 'bg-amber-500'
    },
    {
      title: 'Payment History',
      description: 'View your previous payments and invoices',
      icon: <IconCreditCard size={20} />,
      href: '/payments',
      color: 'bg-emerald-500'
    }
  ];

  const dashboardWidgets = widgets || defaultWidgets;

  return (
    <div className="py-6 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-1 text-slate-900 dark:text-white">
            Welcome, {userName}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Here's your health dashboard overview
          </p>
        </div>
        <Link 
          href="/appointments/new" 
          className="btn-primary mt-3 md:mt-0"
        >
          Book New Appointment
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <StatsCard 
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
          />
        ))}
      </div>

      {/* Main Content */}
      {children ? (
        <div>{children}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardWidgets.map((widget, idx) => (
            <Link key={idx} href={widget.href} className="group">
              <div className="card hover:shadow-card-hover dark:hover:shadow-card-hover-dark transition-all duration-300 h-full">
                <div className="flex flex-col h-full">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${widget.color} text-white mb-4`}>
                    {widget.icon}
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2 text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {widget.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {widget.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 