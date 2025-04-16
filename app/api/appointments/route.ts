import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slotId, type, notes } = await req.json()

    // Validate required fields
    if (!slotId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if slot exists and is available
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { appointment: true, doctor: true }
    })

    if (!slot) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      )
    }

    if (slot.appointment) {
      return NextResponse.json(
        { error: 'Slot is already booked' },
        { status: 400 }
      )
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patient: {
          connect: { id: session.user.id }
        },
        slot: {
          connect: { id: slotId }
        },
        doctor: {
          connect: { id: slot.doctorId }
        },
        type: type,
        notes: notes || '',
        status: 'SCHEDULED'
      },
      include: {
        slot: {
          include: {
            doctor: true
          }
        }
      }
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error booking appointment:', error)
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    )
  }
} 