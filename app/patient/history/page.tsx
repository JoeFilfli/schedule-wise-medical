import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function MedicalHistory() {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== 'PATIENT') redirect('/login');

  return (
    <div className="container mt-4">
      <h1>Medical History</h1>
      <p>Track your past visits and follow-ups.</p>
    </div>
  );
}
