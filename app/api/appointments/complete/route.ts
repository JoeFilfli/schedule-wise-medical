// app/api/appointments/complete/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch (parseErr) {
    console.error('❌ Failed to parse JSON:', parseErr)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { id, status, review, price } = body
  console.log('📥 /api/appointments/complete payload:', body)

  if (!id || !status || price == null) {
    return NextResponse.json(
      { error: 'Missing id, status or price' },
      { status: 400 }
    )
  }

  const parsedPrice = Number(price)
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
  }

  try {
    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: "COMPLETED",
        review,
        priceDue: parsedPrice,  
      },
    })
    console.log('✅ Appointment updated:', updated)
    return NextResponse.json({ success: true, appointment: updated })
  } catch (err) {
    console.error('❌ Prisma update error:', err)
    return NextResponse.json(
      { error: 'Database update failed' },
      { status: 500 }
    )
  }
}
