import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  const doctorId = session?.user?.id

  if (!doctorId) return NextResponse.json([], { status: 401 })

  const appointments = await prisma.appointment.findMany({
    where: { doctorId },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { scheduledStart: 'desc' },
  })

  return NextResponse.json(appointments)
}
