import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');

  switch (session.user.role) {
    case 'DOCTOR':
      redirect('/doctor/dashboard');
    case 'PATIENT':
      redirect('/patient/dashboard');
    case 'ADMIN':
      redirect('/admin'); 
    default:
      redirect('/login');
  }
}
