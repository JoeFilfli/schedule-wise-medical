import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ doctorId: string }> }
) {
  try {
    const { doctorId } = await context.params;

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    const doctor = await prisma.user.findFirst({
      where: {
        id: doctorId,
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
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Convert profilePicture buffer to base64 if it exists
    const formattedDoctor = doctor.profilePicture
      ? {
          ...doctor,
          profilePicture: `data:image/png;base64,${Buffer.from(doctor.profilePicture).toString('base64')}`,
        }
      : doctor;

    return NextResponse.json(formattedDoctor);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctor profile' },
      { status: 500 }
    );
  }
}
