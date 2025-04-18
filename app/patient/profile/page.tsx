// app/patient/profile/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import EditProfileForm from '@/components/EditProfileForm';

export default async function PatientProfile() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PATIENT') {
    redirect('/login');
  }

  // Fetch user including balance
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      firstName:      true,
      lastName:       true,
      email:          true,
      phoneNumber:    true,
      profilePicture: true,
      balance:        true
    },
  });

  if (!user) {
    redirect('/login');
  }

  // Convert binary picture to data URL if present
  const profilePicture = user.profilePicture
    ? `data:image/png;base64,${Buffer.from(user.profilePicture).toString('base64')}`
    : null;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-center">
        <div style={{ maxWidth: 500, width: '100%' }}>
          <h1 className="text-center mb-4">My Profile</h1>

          
          {/* Edit form for other fields */}
          <EditProfileForm
            user={{
              firstName:      user.firstName,
              lastName:       user.lastName,
              email:          user.email,
              phoneNumber:    user.phoneNumber,
              profilePicture,
            }}
          />

          
          
        </div>
        
      </div>
    </div>
  );
}
