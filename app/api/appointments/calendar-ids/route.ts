import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all doctors' calendar IDs
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      }
    });

    // Format the response
    const calendars = doctors.map(doctor => ({
      id: doctor.id,
      name: `Dr. ${doctor.firstName} ${doctor.lastName}`
    }));

    return NextResponse.json(calendars);
  } catch (error) {
    console.error('Error fetching calendar IDs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 