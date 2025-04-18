// app/doctor/profile/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import EditProfileForm from '@/components/EditProfileForm';

export default async function DoctorProfile() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'DOCTOR') {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      profilePicture: true,
      balance: true,
      doctorProfile: {
        select: {
          specialty: true,
          bio: true,
        },
      },
    },
  });

  if (!user) redirect('/login');

  const profilePicture = user.profilePicture
    ? `data:image/png;base64,${Buffer.from(user.profilePicture).toString('base64')}`
    : null;

  return (
    <div className="container py-4 d-flex justify-content-center">
      <div style={{ maxWidth: 600, width: '100%' }}>
        <h1 className="text-center mb-4">My Profile</h1>

        <div className="alert alert-info text-center fw-semibold fs-5 mb-4">
          💰 Balance: ${user.balance.toFixed(2)}
        </div>

        <EditProfileForm
          user={{
            ...user,
            doctorProfile: user.doctorProfile || undefined,
            profilePicture,
          }}
          isDoctor
        />
      </div>
    </div>
  );
}
