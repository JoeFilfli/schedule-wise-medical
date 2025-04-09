import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PatientPayments() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PATIENT') redirect('/login');

  return (
    <div className="container mt-4">
      <h1>Payments & Invoices</h1>
      <p>Manage your billing and receipts here.</p>
    </div>
  );
}
