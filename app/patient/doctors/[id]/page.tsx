'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { format, parseISO } from 'date-fns'

interface Slot {
  id: string
  startTime: string
  endTime: string
}

export default function DoctorSlotsPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const doctorId = Array.isArray(params.id) ? params.id[0] : params.id
  const oldAppointmentId = searchParams.get('reschedule')

  const [slots, setSlots] = useState<Slot[]>([])

  useEffect(() => {
    if (doctorId) {
      fetchSlots()
    }
  }, [doctorId])

  async function fetchSlots() {
    const res = await fetch(`/api/doctors/${doctorId}/slots`)
    const data = await res.json()
    setSlots(data)
  }

  async function bookSlot(slotId: string) {
    const confirmBooking = window.confirm('Are you sure you want to register this slot?')
    if (!confirmBooking) return
  
    if (oldAppointmentId) {
      await fetch('/api/appointments/cancel', {
        method: 'POST',
        body: JSON.stringify({ appointmentId: oldAppointmentId }),
        headers: { 'Content-Type': 'application/json' }
      })
    }
  
    const res = await fetch('/api/appointments/book', {
      method: 'POST',
      body: JSON.stringify({ slotId }),
      headers: { 'Content-Type': 'application/json' }
    })
  
    if (res.ok) {
      alert('Appointment booked!')
      router.push('/patient/appointments')
    } else {
      alert('Booking failed.')
    }
  }
  

  // Group slots by day
  const groupedSlots: Record<string, Slot[]> = {}
  slots.forEach(slot => {
    const dateKey = format(parseISO(slot.startTime), 'yyyy-MM-dd')
    if (!groupedSlots[dateKey]) groupedSlots[dateKey] = []
    groupedSlots[dateKey].push(slot)
  })

  return (
    <div className="container py-4">
      <h3 className="mb-4">Available Slots</h3>

      {slots.length === 0 && <p>No available slots</p>}

      {Object.entries(groupedSlots).map(([date, daySlots]) => (
        <div key={date} className="mb-4">
          <h5 className="fw-bold border-bottom pb-1 mb-3">
            {format(parseISO(daySlots[0].startTime), 'EEEE, MMMM d')}
          </h5>

          <div className="d-flex flex-wrap gap-2">
            {daySlots.map(slot => (
              <button
                key={slot.id}
                onClick={() => bookSlot(slot.id)}
                className="btn btn-outline-success"
              >
                {format(parseISO(slot.startTime), 'HH:mm')} - {format(parseISO(slot.endTime), 'HH:mm')}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
