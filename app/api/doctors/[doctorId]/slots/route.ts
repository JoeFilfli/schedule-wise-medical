import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, props: { params: Promise<{ doctorId: string }> }) {
  const params = await props.params;
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