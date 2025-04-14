import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SYSTEM_PROMPT = `
You are an AI chatbot for a hospital booking website.
Your job is to help users book appointments, register, and view doctors.

If you need the system to do something for you, respond with:
Action: "ListDoctors" — when user asks to see doctors
Action: "ShowSlots" — when user wants doctor availability
Action: "BookAppointment" — when user wants to book
Action: "RegisterDoctor" — when someone wants to register as doctor
Action: "RegisterPatient" — when someone wants to register as patient

Respond normally in Markdown unless an Action is needed.
Do NOT respond with more than one Action. Use plain text only for everything else.
`

// Temporary in-memory store to track last slots by doctor name (use Redis or DB in prod)
const lastSlotMap = new Map<string, any[]>()

export async function POST(req: Request) {
  const { messages } = await req.json()

  const userPrompt = messages.map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
  const prompt = `${SYSTEM_PROMPT}\n${userPrompt}\nAssistant:`

  console.log('\n🌐 Sending prompt to Gemini:\n', prompt)

  const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  const geminiData = await geminiRes.json()
  const rawReply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  console.log('🤖 Gemini Raw Reply:\n', rawReply)

  let reply = rawReply
  const match = rawReply.match(/Action:\s*"?([A-Za-z0-9_]+)"?/i)
  const action = match?.[1]
  console.log('🔍 Detected Action:', action)

  if (action === 'ListDoctors') {
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      include: { doctorProfile: true },
      take: 10,
    })

    const doctorList = doctors.map(d =>
      `- Dr. ${d.firstName} ${d.lastName} (${d.doctorProfile?.specialty || 'General'})`
    ).join('\n')

    const contextPrompt = `
You requested a list of doctors. Here are the doctors:

${doctorList}

Now respond friendly to the user in Markdown as usual, using this data.
`

    const contextualRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: contextPrompt + '\n\n' + prompt }] }],
      }),
    })

    const contextualData = await contextualRes.json()
    reply = contextualData?.candidates?.[0]?.content?.parts?.[0]?.text || '✅ Doctors listed.'
    console.log('🧠 Gemini Final Response After Context:\n', reply)
  }

  else if (action === 'ShowSlots') {
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').at(-1)?.content || ''
    const doctorMatch = lastUserMessage.match(/Dr\.?\s?([A-Za-z]+)\s([A-Za-z]+)/i)

    if (!doctorMatch) {
      reply = "❗ Please mention the doctor's full name like `Dr. Ali Moukalid` so I can check their availability."
    } else {
      const [, firstName, lastName] = doctorMatch

      const doctor = await prisma.user.findFirst({
        where: {
          role: 'DOCTOR',
          firstName: { contains: firstName, mode: 'insensitive' },
          lastName: { contains: lastName, mode: 'insensitive' },
        },
      })

      if (!doctor) {
        reply = `❌ Sorry, I couldn't find Dr. ${firstName} ${lastName} in our system.`
      } else {
        const slots = await prisma.slot.findMany({
          where: {
            doctorId: doctor.id,
            appointment: null,
          },
          orderBy: { startTime: 'asc' },
          take: 10,
        })

        if (slots.length === 0) {
          reply = `📅 Dr. ${doctor.firstName} ${doctor.lastName} has no available slots at the moment.`
        } else {
          // Store for next use
          const doctorKey = `${doctor.firstName.toLowerCase()}-${doctor.lastName.toLowerCase()}`
          lastSlotMap.set(doctorKey, slots)

          const slotList = slots.map((slot, index) => {
            const start = new Date(slot.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            const end = new Date(slot.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            return `${index + 1}. ${start} → ${end}`
          }).join('\n')

          const contextPrompt = `
Here are the next available slots for Dr. ${doctor.firstName} ${doctor.lastName}:

${slotList}

Tell the user to choose a slot by its number.
`

          const contextualRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: contextPrompt + '\n\n' + prompt }] }],
            }),
          })

          const contextualData = await contextualRes.json()
          reply = contextualData?.candidates?.[0]?.content?.parts?.[0]?.text || `✅ Available slots listed.`
          console.log('🕓 Gemini Final Response for Slots:\n', reply)
        }
      }
    }
  }

  else if (action === 'BookAppointment') {
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').at(-1)?.content || ''

    const doctorMatch = lastUserMessage.match(/dr\.?\s?([a-z]+)\s([a-z]+)/i)
    const slotNumberMatch =
      lastUserMessage.match(/(?:slot|number)\s*(\d+)/i) ||
      lastUserMessage.match(/\b(\d+)\b/)
    const typeMatch = lastUserMessage.match(/\b(new|follow[- ]?up)\b/i)
    const noteMatch = lastUserMessage.match(/note[:\-–]?\s*(.+)$/i)

    console.log('🔍 Booking Details:', { doctorMatch, slotNumberMatch, typeMatch, noteMatch })
    if (!doctorMatch || !slotNumberMatch) {
      reply = '📝 To book, please mention the doctor’s full name and the slot number.'
    } else {
      const [, firstName, lastName] = doctorMatch
      const doctorKey = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`
      const slotIndex = parseInt(slotNumberMatch[1], 10) - 1

      const slots = lastSlotMap.get(doctorKey)
      const slot = slots?.[slotIndex]

      if (!slot) {
        reply = `❌ Invalid slot number. Please check available options.`
      } else if (!typeMatch) {
        reply = `❓Is this a *new problem* or a *follow-up* appointment?`
      } else if (!noteMatch) {
        reply = `📝 Please provide a short note for the doctor (your reason for the visit).`
      } else {
        const type = typeMatch[1].toLowerCase().includes('new') ? 'new' : 'follow-up'
        const note = noteMatch[1]

        // Book appointment
        await prisma.appointment.create({
          data: {
            slot: { connect: { id: slot.id } },
            doctor: { connect: { id: slot.doctorId } },
            patient: { connect: { id: slot.patientId } },
            type,
            reason: type === 'new' ? 'New Problem' : 'Follow-Up',
            notes: note,
            status: 'SCHEDULED',
            doctorName: `Dr. ${firstName} ${lastName}`,
            scheduledStart: slot.startTime,
            scheduledEnd: slot.endTime,
          },
        })

        reply = `✅ Your appointment with Dr. ${firstName} ${lastName} has been successfully booked at ${new Date(slot.startTime).toLocaleTimeString('en-US')}.`
      }
    }
  }

  return NextResponse.json({ reply })
}
