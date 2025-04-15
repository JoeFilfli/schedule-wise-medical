import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { doctorId: string } }
) {
  try {
    const doctor = await prisma.user.findUnique({
      where: {
        id: params.doctorId,
        role: 'DOCTOR',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePicture: true,
        doctorProfile: {
          select: {
            specialty: true,
            bio: true,
          },
        },
      },
    });

    if (!doctor) {
      return new NextResponse('Doctor not found', { status: 404 });
    }

    // Format the profile picture if it exists
    const formattedDoctor = {
      ...doctor,
      profilePicture: doctor.profilePicture
        ? `data:image/png;base64,${Buffer.from(doctor.profilePicture).toString('base64')}`
        : null
    };

    return NextResponse.json(formattedDoctor);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
