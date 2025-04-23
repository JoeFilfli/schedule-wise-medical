// app/api/payments/complete/route.ts

import { NextResponse }       from 'next/server'
import { getServerSession }   from 'next-auth'
import { authOptions }        from '@/lib/auth'
import { prisma }             from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { appointmentId, method } = await req.json()
  if (!appointmentId || !method) {
    return NextResponse.json({ error: 'Missing appointmentId or method' }, { status: 400 })
  }

  // 1) load the appointment (to get priceDue & doctorId & patientId)
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      priceDue:   true,
      doctorId:   true,
      patientId:  true,
    }
  })
  if (!appt) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }

  // 2) ensure the session user *is* the patient
  if (session.user.id !== appt.patientId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 3) fetch the patient’s current balance from the DB
  const patient = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { balance: true }
  })
  if (!patient) {
    return NextResponse.json({ error: 'Patient record missing' }, { status: 500 })
  }

  // 4) check sufficient funds
  if (patient.balance < appt.priceDue) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
  }

  // 5) do everything in one transaction:
  //    - decrement patient balance
  //    - increment doctor balance
  //    - mark appointment as paid
  try {
    await prisma.$transaction([
      // debit the patient
      prisma.user.update({
        where: { id: session.user.id },
        data:  { balance: { decrement: appt.priceDue } }
      }),
      // credit the doctor
      prisma.user.update({
        where: { id: appt.doctorId },
        data:  { balance: { increment: appt.priceDue } }
      }),
      // record the payment on the appointment
      prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          paidAmount:    appt.priceDue,
          paidAt:        new Date(),
          paymentMethod: method,
          receiptUrl:    '', // or generate a URL here
        }
      })
    ])
  } catch (err) {
    console.error('Payment transaction failed:', err)
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
