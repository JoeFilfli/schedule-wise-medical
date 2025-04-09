import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PatientDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PATIENT') redirect('/login');

  return (
    <div className="container mt-4">
      <h1>Patient Dashboard</h1>
      <p>Upcoming appointments, reminders, and messages.</p>
    </div>
  );
}
