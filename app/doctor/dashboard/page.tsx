import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DoctorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'DOCTOR') {
    redirect('/login');
  }

  return (
    <div className="container mt-4">
      <h1>Welcome Dr. {session.user.firstName}</h1>
      <p>Here's a snapshot of your schedule and activity today:</p>
      {/* Placeholders for scheduling alerts, quick actions */}
    </div>
  );
}
