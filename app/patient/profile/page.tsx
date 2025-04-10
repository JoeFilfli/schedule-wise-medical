import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import EditProfileForm from '@/components/EditProfileForm';

export default async function PatientProfile() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PATIENT') redirect('/login');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      profilePicture: true,
    },
  });

  const profilePicture = user?.profilePicture
    ? `data:image/png;base64,${Buffer.from(user.profilePicture).toString('base64')}`
    : null;

  return (
    <div className="container py-4 d-flex justify-content-left">
      <div style={{ maxWidth: 500, width: '100%' }}>
        <h1 className="text-center mb-4">My Profile</h1>
        <EditProfileForm user={{ ...user, profilePicture }} />
      </div>
    </div>
  );
}
