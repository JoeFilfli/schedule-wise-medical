import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { slotId } = await req.json()

  const slot = await prisma.slot.findUnique({
    where: { id: slotId },
    include: {
      doctor: true,
      appointment: true
    }
  })
  
  if (!slot) {
    return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
  }
  
  const doctor = slot.doctor 
  

  if (!slot) {
    return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
  }

  if (slot.appointment) {
    return NextResponse.json({ error: 'Slot already booked' }, { status: 400 })
  }

  await prisma.appointment.create({
    data: {
      slot: { connect: { id: slot.id } },
      doctor: { connect: { id: doctor.id } },
      patient: { connect: { id: session.user.id } },
      status: 'SCHEDULED',
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      scheduledStart: slot.startTime,
      scheduledEnd: slot.endTime
    }
  })
  
  

  return NextResponse.json({ success: true })
}
