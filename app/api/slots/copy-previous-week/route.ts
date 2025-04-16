import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addDays, parseISO } from 'date-fns'

export async function POST(req: Request) {
  const session = await getServerSession(authConfig)

  if (!session?.user || session.user.role !== 'DOCTOR') {
    console.log('[DEBUG] ❌ Unauthorized access')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const weekStart = parseISO(body.weekStart)

  const lastWeekStart = addDays(weekStart, -7)
  const lastWeekEnd = weekStart

  console.log('[DEBUG] Navigated week:', weekStart)
  console.log('[DEBUG] Previous week range:', lastWeekStart, 'to', lastWeekEnd)

  const prevSlots = await prisma.slot.findMany({
    where: {
      doctorId: session.user.id,
      startTime: {
        gte: lastWeekStart,
        lt: lastWeekEnd
      }
    }
  })

  console.log(`[DEBUG] Found ${prevSlots.length} slot(s) in previous week.`)

  if (prevSlots.length === 0) {
    return NextResponse.json({ success: false, message: 'No slots found in previous week' }, { status: 404 })
  }

  const copied = prevSlots.map((slot) => ({
    doctorId: session.user.id,
    startTime: addDays(slot.startTime, 7),
    endTime: addDays(slot.endTime, 7)
  }))

  const result = await prisma.slot.createMany({
    data: copied,
    skipDuplicates: true
  })

  return NextResponse.json({ success: true, count: copied.length })
}
