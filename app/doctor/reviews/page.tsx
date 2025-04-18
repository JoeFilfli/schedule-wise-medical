import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';

export default async function DoctorReviews() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'DOCTOR') redirect('/login');

  return (
    <div className="content-page">
      <PageHeader 
        title="Patient Reviews & Incentives" 
        subtitle="Check your feedback and rewards summary"
        size="large"
      />
      
      <div className="page-content">
        {/* Review content would go here */}
      </div>
    </div>
  );
}
