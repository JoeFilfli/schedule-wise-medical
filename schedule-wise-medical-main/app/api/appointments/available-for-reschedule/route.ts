import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const doctorId = searchParams.get('doctorId')

  const slots = await prisma.slot.findMany({
    where: {
      doctorId: doctorId || undefined,
      appointment: null,
      startTime: { gte: new Date() },
    },
    orderBy: { startTime: 'asc' },
    take: 5,
  })

  return NextResponse.json(slots)
}
