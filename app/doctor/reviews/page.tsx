import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DoctorReviews() {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== 'DOCTOR') redirect('/login');

  return (
    <div className="container mt-4">
      <h1>Patient Reviews & Incentives</h1>
      <p>Check your feedback and rewards summary.</p>
    </div>
  );
}
