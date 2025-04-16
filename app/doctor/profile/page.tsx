import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import EditProfileForm from '@/components/EditProfileForm';

export default async function DoctorProfile() {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== 'DOCTOR') redirect('/login');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      profilePicture: true,
      doctorProfile: {
        select: {
          specialty: true,
          bio: true,
        },
      },
    },
  });

  const profilePicture = user?.profilePicture
    ? `data:image/png;base64,${Buffer.from(user.profilePicture).toString('base64')}`
    : null;

  return (
    <div className="container py-4 d-flex justify-content-left">
      <div style={{ maxWidth: 500, width: '100%' }}>
        <h1 className="text-center mb-4">My Profile</h1>
        <EditProfileForm user={{ ...user, profilePicture }} isDoctor />
      </div>
    </div>
  );
}
