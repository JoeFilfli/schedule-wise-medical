import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardWidget from '@/components/dashboard/DashboardWidget';

export default async function DoctorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'DOCTOR') {
    redirect('/login');
  }

  const widgets = [
    {
      title: 'Calendar',
      description: 'Manage your schedule and appointments',
      emoji: '📅',
      href: '/doctor/calendar',
      color: 'primary'
    },
    {
      title: 'Patients',
      description: 'View and manage your patient list',
      emoji: '👥',
      href: '/doctor/patients',
      color: 'success'
    },
    {
      title: 'Medical Records',
      description: 'Access patient medical histories',
      emoji: '📋',
      href: '/doctor/patients',
      color: 'info'
    },
    {
      title: 'Reviews',
      description: 'View patient feedback and incentives',
      emoji: '⭐',
      href: '/doctor/reviews',
      color: 'warning'
    },
    {
      title: 'Profile',
      description: 'Manage your professional profile',
      emoji: '👨‍⚕️',
      href: '/doctor/profile',
      color: 'danger'
    },
    {
      title: 'Settings',
      description: 'Configure your preferences',
      emoji: '⚙️',
      href: '/doctor/settings',
      color: 'secondary'
    }
  ];

  return (
    <div className="container-fluid py-5 px-4 px-md-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="h2 mb-0">Welcome Dr. {session.user.firstName}</h1>
      </div>
      
      <div className="row g-4 g-md-5">
        {widgets.map((widget, index) => (
          <div key={index} className="col-12 col-sm-6 col-lg-4">
            <DashboardWidget {...widget} />
          </div>
        ))}
      </div>
    </div>
  );
}
