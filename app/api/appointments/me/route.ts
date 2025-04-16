import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authConfig)

  if (!session?.user || session.user.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      patientId: session.user.id
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      slot: {
        select: {
          startTime: true,
          endTime: true,
          doctorId: true, // ✅ explicitly select doctorId
          doctor: {
            select: {
              id: true, // ✅ required
              firstName: true,
              lastName: true
            }
          }
        }
      }
    }
  })

  return NextResponse.json(appointments)
}
