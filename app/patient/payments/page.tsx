// app/patient/payments/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PaymentsDashboard from '@/components/payments/PaymentsDashboard';

export default async function PatientPaymentsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PATIENT') {
    redirect('/login');
  }

  return <PaymentsDashboard />;
}
