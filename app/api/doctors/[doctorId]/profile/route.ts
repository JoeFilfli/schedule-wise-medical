import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: { doctorId: string } }
) {
  const doctorId = params.doctorId;

  const doctor = await prisma.user.findUnique({
    where: { id: doctorId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      profilePicture: true,
      doctorProfile: {
        select: {
          specialty: true,
          bio: true
        }
      }
    }
  });

  if (!doctor) {
    return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...doctor,
    profilePicture: doctor.profilePicture
      ? `data:image/png;base64,${Buffer.from(doctor.profilePicture).toString('base64')}`
      : null
  });
}