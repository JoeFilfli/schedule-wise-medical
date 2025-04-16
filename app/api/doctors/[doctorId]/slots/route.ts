import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    const slots = await prisma.slot.findMany({
      where: {
        doctorId: doctorId,
        appointment: null,
        startTime: {
          gte: new Date(),
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}