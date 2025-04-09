import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''

  const doctors = await prisma.user.findMany({
    where: {
      role: 'DOCTOR',
      OR: [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { doctorProfile: { specialty: { contains: q, mode: 'insensitive' } } }
      ]
    },
    select: {
      id: true, 
      firstName: true,
      lastName: true,
      doctorProfile: {
        select: {
          specialty: true,
          bio: true
        }
      }
    }
  })

  return NextResponse.json(doctors)
}
