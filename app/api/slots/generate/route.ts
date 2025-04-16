import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authConfig } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { addMinutes } from 'date-fns'

export async function POST(req: Request) {
  const session = await getServerSession(authConfig)

  if (!session?.user || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()

  // BULK MODE: Copy week
  if (body.date === 'bulk' && Array.isArray(body.slots)) {
    const createManyData = body.slots.map((s: any) => ({
      doctorId: session.user.id,
      startTime: new Date(s.startTime),
      endTime: new Date(s.endTime)
    }))

    await prisma.slot.createMany({
      data: createManyData,
      skipDuplicates: true // prevent exact duplicates
    })

    return NextResponse.json({ success: true, count: createManyData.length })
  }

  // NORMAL MODE: Generate from range
  const { date, startTime, endTime, length, breakTime } = body

  if (!date || !startTime || !endTime || !length) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const start = new Date(`${date}T${startTime}`)
  const end = new Date(`${date}T${endTime}`)
  const slots = []

  let current = start
  while (addMinutes(current, length) <= end) {
    const slotEnd = addMinutes(current, length)
    slots.push({
      doctorId: session.user.id,
      startTime: current,
      endTime: slotEnd
    })
    current = addMinutes(slotEnd, breakTime)
  }

  await prisma.slot.createMany({ data: slots, skipDuplicates: true })

  return NextResponse.json({ success: true, count: slots.length })
}
