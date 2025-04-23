// app/api/payments/pending/route.ts

import { NextResponse }      from 'next/server'
import { getServerSession }  from 'next-auth'
import { authOptions }       from '@/lib/auth'
import { prisma }            from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only COMPLETED & not yet paid
  const appts = await prisma.appointment.findMany({
    where: {
      patientId:   session.user.id,
      status:      'COMPLETED',
      paidAt:      null,
    },
    include: {
      doctor: true,
      slot:   true,
    }
  })

  const payload = appts.map(a => ({
    appointmentId: a.id,
    doctorName:    `${a.doctor.firstName} ${a.doctor.lastName}`,
    date:          a.slot
                     ? a.slot.startTime.toISOString()
                     : a.scheduledStart?.toISOString() ?? '',
    amount:        a.priceDue
  }))

  return NextResponse.json(payload)
}
