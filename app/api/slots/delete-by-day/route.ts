import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseISO, startOfDay, endOfDay } from 'date-fns'

export async function DELETE(req: Request) {
  const session = await getServerSession(authConfig)
  if (!session?.user || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { date } = await req.json()
  const doctorId = session.user.id

  const from = startOfDay(parseISO(date))
  const to = endOfDay(parseISO(date))

  // 1. Get all slots for the day
  const slotsToDelete = await prisma.slot.findMany({
    where: {
      doctorId,
      startTime: { gte: from, lte: to }
    },
    include: {
      appointment: true
    }
  })

  // 2. Disconnect and mark appointments as cancelled
  for (const slot of slotsToDelete) {
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
  }

  // 3. Delete slots
  await prisma.slot.deleteMany({
    where: {
      id: { in: slotsToDelete.map(s => s.id) }
    }
  })

  return NextResponse.json({ success: true, deleted: slotsToDelete.length })
}
