// app/login/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/'); // if logged in, skip login page
  }

  return <LoginForm />; // if not logged in, show login form
}
