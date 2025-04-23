import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const url = new URL(req.url);
  const search = url.searchParams.get('search')?.toLowerCase() || '';

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: session.user.id,
      status: { in: ['SCHEDULED', 'COMPLETED'] },
      patient: {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      },
    },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      slot: true,
    },
    orderBy: { scheduledStart: 'desc' },
  });

  const grouped = appointments.reduce((acc, appt) => {
    const pid = appt.patientId;
    if (!acc[pid]) {
      acc[pid] = {
        patient: appt.patient,
        appointments: [],
      };
    }
    acc[pid].appointments.push(appt);
    return acc;
  }, {} as Record<string, any>);

  return NextResponse.json(Object.values(grouped));
}
