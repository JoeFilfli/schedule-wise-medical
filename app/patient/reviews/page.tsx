import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';

export default async function PatientReviews() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PATIENT') redirect('/login');

  return (
    <div className="content-page">
      <PageHeader title="Leave a Review" />
      
      <div className="page-content">
        <p>Submit feedback and track your reward points.</p>
      </div>
    </div>
  );
}
