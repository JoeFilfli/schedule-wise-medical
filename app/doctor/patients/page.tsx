import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DoctorPatients() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'DOCTOR') redirect('/login');

  return (
    <div className="container mt-4">
      <h1>Patients</h1>
      <p>Manage your patient list and access medical histories.</p>
    </div>
  );
}
