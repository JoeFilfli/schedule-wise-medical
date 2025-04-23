import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import DashboardWidget from '@/components/dashboard/DashboardWidget';

export default async function DoctorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'DOCTOR') {
    redirect('/login');
  }

  // Dashboard widgets for doctor
  const widgets = [
    {
      title: 'My Calendar',
      description: 'View and manage your schedule',
      emoji: '📅',
      href: '/doctor/calendar',
      color: 'primary'
    },
    {
      title: 'Patient Appointments',
      description: 'Manage upcoming and past appointments',
      emoji: '👥',
      href: '/doctor/patients',
      color: 'success'
    },
    {
      title: 'Reviews',
      description: 'See patient feedback',
      emoji: '⭐',
      href: '/doctor/reviews',
      color: 'info'
    },
    {
      title: 'Profile',
      description: 'Edit your profile and bio',
      emoji: '👤',
      href: '/doctor/profile',
      color: 'warning'
    },
    {
      title: 'Settings',
      description: 'Manage account settings',
      emoji: '⚙️',
      href: '/doctor/settings',
      color: 'secondary'
    }
  ];

  return (
    <div className="content-page">
      <PageHeader 
        title={`Welcome Dr. ${session.user.firstName}`}
        subtitle="Here's a snapshot of your schedule and activity today"
        size="large"
      />
      
      <div className="page-content">
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="row g-4">
              {widgets.map((widget, idx) => (
                <div key={idx} className="col-12 col-sm-6 col-md-4">
                  <DashboardWidget {...widget} />
                </div>
              ))}
            </div>
          </div>
          <div className="col-12 col-lg-4">
            {/* Sidebar: any quick links or alerts */}
          </div>
        </div>
      </div>
    </div>
  );
}
