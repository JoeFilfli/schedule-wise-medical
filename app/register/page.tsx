import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RegisterForm from './RegisterForm';

export default async function RegisterPage() {
  const session = await getServerSession(authConfig);

  if (session) {
    redirect('/dashboard');
  }

  return <RegisterForm />;
}
