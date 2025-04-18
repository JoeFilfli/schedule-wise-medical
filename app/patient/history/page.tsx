import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';

export default async function MedicalHistory() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PATIENT') redirect('/login');

  return (
    <div className="content-page">
      <PageHeader title="Medical History" />
      
      <div className="page-content">
        <p>Track your past visits and follow-ups.</p>
      </div>
    </div>
  );
}
