import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { doctorId: string } }
) {
  const { doctorId } = params

  if (!doctorId) {
    return NextResponse.json({ error: 'Missing doctorId' }, { status: 400 })
  }

  const slots = await prisma.slot.findMany({
    where: {
      doctorId,
      startTime: {
        gte: new Date() 
      },
      appointment: null
    },
    orderBy: {
      startTime: 'asc'
    }
  })

  return NextResponse.json(slots)
}