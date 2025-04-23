import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { appointmentId } = await req.json()
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CANCELLED' },
  })
  return NextResponse.json({ ok: true })
}
