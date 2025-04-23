import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { slotId, doctorId, patientId, type, note } = await req.json()

  const slot = await prisma.slot.findUnique({
    where: { id: slotId },
  })

  if (!slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })

  const appt = await prisma.appointment.create({
    data: {
      slotId,
      doctorId,
      patientId,
      type,
      notes: note,
      status: 'SCHEDULED',
      priceDue: 30,
      scheduledStart: slot.startTime,
      scheduledEnd: slot.endTime,
    },
  })

  return NextResponse.json(appt)
}
