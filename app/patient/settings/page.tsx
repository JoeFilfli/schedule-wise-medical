import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';

export default async function SettingsPage() {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== 'PATIENT') redirect('/login');

  return (
    <div>
      <h1>Settings</h1>
      <p>Configure your preferences and integrations.</p>

      <hr className="my-4" />

      <div className="d-flex justify-content-end">
        <LogoutButton />
      </div>
    </div>
  );
}
