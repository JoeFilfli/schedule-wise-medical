import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'


export async function POST(req: Request) {
    const session = await getServerSession(authConfig)
    if (!session?.user || session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  
    const { appointmentId } = await req.json()
  
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    })
  
    if (!appointment || appointment.patientId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 403 })
    }
  
    await prisma.appointment.delete({
      where: { id: appointmentId }
    })
  
    return NextResponse.json({ success: true })
  }
  