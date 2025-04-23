import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';
import PageHeader from '@/components/layout/PageHeader';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PATIENT') redirect('/login');

  return (
    <div className="content-page">
      <PageHeader title="Settings" />
      
      <div className="page-content">
        <p>Configure your preferences and integrations.</p>

        <hr className="my-4" />

        <div className="d-flex justify-content-end">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
