import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

// app/api/slots/route.ts

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const slots = await prisma.slot.findMany({
    where: { doctorId: session.user.id },
    orderBy: { startTime: 'asc' },
    include: {
      appointment: {
        include: {
          patient: true
        }
      }
    }
  })

  return NextResponse.json(slots)
}
