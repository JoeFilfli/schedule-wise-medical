import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        doctorProfile: {
          select: {
            specialty: true,
          }
        },
        _count: {
          select: {
            doctorAppointments: true
          }
        }
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    // Calculate average ratings and format profile pictures
    const doctorsWithRatings = await Promise.all(
      doctors.map(async (doctor) => {
        const reviews = await prisma.review.findMany({
          where: {
            doctorId: doctor.id
          },
          select: {
            rating: true
          }
        });

        const averageRating = reviews.length > 0
          ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
          : 0;

        return {
          ...doctor,
          profilePicture: doctor.profilePicture 
            ? `data:image/jpeg;base64,${Buffer.from(doctor.profilePicture).toString('base64')}`
            : '/default-avatar.png',
          doctorProfile: {
            ...doctor.doctorProfile,
            averageRating
          }
        };
      })
    );

    return NextResponse.json(doctorsWithRatings);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}
