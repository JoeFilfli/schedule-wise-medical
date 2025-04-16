import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SidebarLayout from '@/components/layout/SidebarLayout';

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== 'PATIENT') redirect('/login');

  return (
    <SidebarLayout>
      {children}
    </SidebarLayout>
  );
}
