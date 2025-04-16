import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardWidget from '@/components/dashboard/DashboardWidget';
import RecentlyViewedDoctors from '@/components/dashboard/RecentlyViewedDoctors';
import UpcomingAppointments from '@/components/dashboard/UpcomingAppointments';

export default async function PatientDashboard() {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== 'PATIENT') redirect('/login');

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
    <div className="container-fluid py-5 px-4 px-md-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="h2 mb-0">Welcome, {session.user.firstName}</h1>
      </div>
      
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="row g-4">
            {widgets.map((widget, index) => (
              <div key={index} className="col-12 col-sm-6 col-md-4">
                <DashboardWidget {...widget} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="col-12 col-lg-4">
          <div className="d-flex flex-column gap-4">
            <UpcomingAppointments />
            <RecentlyViewedDoctors />
          </div>
        </div>
      </div>
    </div>
  );
}
