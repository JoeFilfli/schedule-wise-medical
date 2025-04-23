import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

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
      profilePicture: true,
      doctorProfile: {
        select: {
          specialty: true,
          bio: true
        }
      }
    }
  });

  const formatted = doctors.map(doc => ({
    ...doc,
    profilePicture: doc.profilePicture
      ? `data:image/png;base64,${Buffer.from(doc.profilePicture).toString('base64')}`
      : null
  }));

  return NextResponse.json(formatted);
}
