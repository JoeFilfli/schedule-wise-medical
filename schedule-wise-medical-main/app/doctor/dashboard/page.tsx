import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';

export default async function DoctorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'DOCTOR') {
    redirect('/login');
  }

  return (
    <div className="content-page">
      <PageHeader 
        title={`Welcome Dr. ${session.user.firstName}`}
        subtitle="Here's a snapshot of your schedule and activity today"
        size="large"
      />
      
      <div className="page-content">
        {/* Placeholders for scheduling alerts, quick actions */}
      </div>
    </div>
  );
}
