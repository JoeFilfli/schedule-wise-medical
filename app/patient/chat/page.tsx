import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PatientChat() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PATIENT') redirect('/login');

  return (
    <div className="container mt-4">
      <h1>Chat with Assistant</h1>
      <p>Ask questions or reschedule via our AI assistant.</p>
    </div>
  );
}
