import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { id } = await req.json()

  // 1. Find slot with appointment (if any)
  const slot = await prisma.slot.findUnique({
    where: { id },
    include: { appointment: true }
  })

  if (!slot) {
    return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
  }

  // 2. If booked → cancel the appointment
  if (slot.appointment) {
    await prisma.appointment.update({
      where: { id: slot.appointment.id },
      data: {
        status: 'CANCELLED',
        reason: 'Cancelled by doctor',
        slot: { disconnect: true }
      }
    })
  }

  // 3. Delete the slot
  await prisma.slot.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}
