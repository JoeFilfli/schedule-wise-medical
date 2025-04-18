// app/api/payments/history/route.ts

import { NextResponse }      from 'next/server'
import { getServerSession }  from 'next-auth'
import { authOptions }       from '@/lib/auth'
import { prisma }            from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // All paid appointments for this patient
  const appts = await prisma.appointment.findMany({
    where: {
      patientId: session.user.id,
      paidAt:    { not: null }
    },
    include: { doctor: true }
  })

  const payload = appts.map(a => ({
    appointmentId: a.id,
    date:          a.paidAt!.toISOString(),
    amount:        a.paidAmount!,
    method:        a.paymentMethod!,
    receiptUrl:    a.receiptUrl || ''
  }))

  return NextResponse.json(payload)
}
