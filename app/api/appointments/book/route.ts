import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { slotId, type, note } = await req.json();

  if (!slotId || !['new', 'follow-up'].includes(type)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const slot = await prisma.slot.findUnique({
    where: { id: slotId },
    include: {
      doctor: true,
      appointment: true,
    },
  });

  if (!slot) {
    return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
  }

  if (!slot.doctor) {
    return NextResponse.json({ error: 'Slot missing doctor info' }, { status: 500 });
  }

  if (slot.appointment) {
    return NextResponse.json({ error: 'Slot already booked' }, { status: 400 });
  }

  const appointment = await prisma.appointment.create({
    data: {
      slot: { connect: { id: slot.id } },
      doctor: { connect: { id: slot.doctor.id } },
      patient: { connect: { id: session.user.id } },
      type,
      reason: type === 'new' ? 'New Problem' : 'Follow-Up',
      notes: note,
      status: 'SCHEDULED',
      doctorName: `${slot.doctor.firstName} ${slot.doctor.lastName}`,
      scheduledStart: slot.startTime,
      scheduledEnd: slot.endTime,
    },
  });

  return NextResponse.json({ success: true, appointmentId: appointment.id });
}
