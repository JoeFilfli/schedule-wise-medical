// app/patient/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import DashboardWidget from '@/components/dashboard/DashboardWidget';
import RecentlyViewedDoctors from '@/components/dashboard/RecentlyViewedDoctors';
import UpcomingAppointments from '@/components/dashboard/UpcomingAppointments';
import PageHeader from '@/components/layout/PageHeader';

export default function PatientDashboard() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if we should redirect
    if (status === 'unauthenticated') {
      redirect('/login');
    }
  }, [status]);

  // Add loading state when not mounted or session is loading
  if (!mounted || status === 'loading') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Check authentication and role
  if (!session || session.user.role !== 'PATIENT') {
    return null; // Redirect is handled in useEffect
  }

  const widgets = [
    {
      title: 'Book Appointment',
      description: 'Schedule a new appointment with your preferred doctor',
      emoji: '📅',
      href: '/patient/doctors',
      color: 'primary'
    },
    {
      title: 'My Appointments',
      description: 'View and manage your upcoming appointments',
      emoji: '👨‍⚕️',
      href: '/patient/appointments',
      color: 'success'
    },
    {
      title: 'Medical History',
      description: 'Access your complete medical records and history',
      emoji: '📋',
      href: '/patient/history',
      color: 'info'
    },
    {
      title: 'Payments',
      description: 'View invoices and manage your payments',
      emoji: '💳',
      href: '/patient/payments',
      color: 'warning'
    },
    {
      title: 'Reviews',
      description: 'Leave feedback and track your reward points',
      emoji: '⭐',
      href: '/patient/reviews',
      color: 'danger'
    },
    {
      title: 'Settings',
      description: 'Manage your account settings and preferences',
      emoji: '⚙️',
      href: '/patient/settings',
      color: 'secondary'
    }
  ];

  return (
    <div className="content-page">
      <PageHeader 
        title={`Welcome, ${session?.user.firstName || 'User'}`}
        subtitle="Here's your medical dashboard overview"
        size="large"
      />
      
      <div className="page-content">
        <div className="row g-4">
          {/* Main column: Upcoming + Widgets */}
          <div className="col-12 col-lg-8">
            {/* Upcoming Appointments at top */}
            <div className="mb-4">
              <UpcomingAppointments />
            </div>

            {/* Dashboard cards */}
            <div className="row g-4">
              {widgets.map((widget, idx) => (
                <div key={`widget-${idx}`} className="col-12 col-sm-6 col-md-4">
                  <DashboardWidget {...widget} />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: Recently Viewed */}
          <div className="col-12 col-lg-4">
            <RecentlyViewedDoctors />
          </div>
        </div>
      </div>
    </div>
  );
}
