import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SYSTEM_PROMPT_TEMPLATE = `
You are an AI chatbot for a hospital booking website.
You are chatting with a patient. Their name is {firstName} {lastName}. Be friendly, helpful, and clear in your tone.
You can help users with tasks like:
- Viewing available doctors
- Checking a doctor's availability
- Booking an appointment

When a user asks to see doctors or lists doctors, respond with:
{
  "action": "ListDoctors",
  "response": "Here are the available doctors:"
}

When a user asks about a specific doctor's availability, respond with:
{
  "action": "ShowSlots",
  "doctor": "Dr. [First Name] [Last Name]",
  "response": "I'll help you check availability for Dr. [First Name] [Last Name]"
}

For general questions or when no specific action is needed, respond with:
{
  "action": "Response",
  "response": "Your friendly response here"
}

⚠️ Output only valid JSON. No markdown. No code block.
`

export async function POST(req: Request) {
  const session = await getServerSession(authConfig)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { messages, formData } = body

  // 📅 If formData has a date range
  if (formData?.from && formData?.to) {
    const from = new Date(formData.from)
    const to = new Date(formData.to)

    let doctorFilter = {}
    if (formData?.doctor) {
      const doctorParts = formData.doctor.match(/Dr\.?\s*([A-Za-z]+)\s+([A-Za-z]+)/i)
      if (doctorParts) {
        const [, first, last] = doctorParts
        const doctor = await prisma.user.findFirst({
          where: {
            role: 'DOCTOR',
            firstName: { contains: first, mode: 'insensitive' },
            lastName: { contains: last, mode: 'insensitive' },
          },
        })

        if (doctor) {
          doctorFilter = { doctorId: doctor.id }
        }
      }
    }

    const slots = await prisma.slot.findMany({
      where: {
        appointment: null,
        startTime: { gte: from, lte: to },
        ...doctorFilter,
      },
      include: { doctor: true },
      orderBy: { startTime: 'asc' },
    })

    if (slots.length === 0) {
      return NextResponse.json({ 
        reply: JSON.stringify({
          action: 'Response',
          response: '📅 No available slots in this date range.'
        })
      })
    }

    // Group slots by date
    const groupedSlots = slots.reduce((acc, slot) => {
      const date = new Date(slot.startTime).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        doctor: {
          firstName: slot.doctor.firstName,
          lastName: slot.doctor.lastName,
        },
      })
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      reply: JSON.stringify({
        action: 'RenderSlotsWithBookingUI',
        slots: groupedSlots,
        doctor: formData?.doctor || 'All Doctors',
      }),
    })
  }

  // 💬 Process Gemini intent
  const userPrompt = messages.map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
  const prompt =
    SYSTEM_PROMPT_TEMPLATE.replace('{firstName}', session.user.firstName).replace('{lastName}', session.user.lastName) +
    `\n${userPrompt}\nAssistant:`

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  )

  const geminiData = await geminiRes.json()
  let raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
  if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?/, '').replace(/```$/, '').trim()

  try {
    const parsed = JSON.parse(raw)

    if (parsed.action === 'ShowSlots') {
      return NextResponse.json({
        reply: JSON.stringify({
          action: 'RenderDateRangeForm',
          doctor: parsed.doctor,
          message: parsed.doctor
            ? `📆 Please choose a date range to see availability for ${parsed.doctor}`
            : '📆 Please choose a date range to check all available slots.',
        }),
      })
    }

    if (parsed.action === 'ListDoctors') {
      const doctors = await prisma.user.findMany({
        where: { role: 'DOCTOR' },
        include: { doctorProfile: true },
        take: 10,
      })

      const doctorList = doctors
        .map(
          (d) =>
            `- Dr. ${d.firstName} ${d.lastName} (${d.doctorProfile?.specialty || 'General'})`
        )
        .join('\n')

      return NextResponse.json({
        reply: JSON.stringify({
          action: 'Response',
          response: `${parsed.response || '👨‍⚕️ Here are some available doctors:'}\n\n${doctorList}`
        })
      })
    }

    return NextResponse.json({ 
      reply: JSON.stringify({
        action: 'Response',
        response: parsed.response || '✅ How can I help you next?'
      })
    })
  } catch (err) {
    console.error('❌ Invalid JSON from Gemini:', raw)
    return NextResponse.json({ 
      reply: JSON.stringify({
        action: 'Response',
        response: '⚠️ Sorry, I could not understand that.'
      })
    })
  }
}
