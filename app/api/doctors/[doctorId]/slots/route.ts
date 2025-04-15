import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { doctorId: string } }
) {
  try {
    const slots = await prisma.slot.findMany({
      where: {
        doctorId: params.doctorId,
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
  } catch (error) {
    console.error('Error fetching slots:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}