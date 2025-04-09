'use client'

import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'

interface Appointment {
  id: string
  status: string
  reason: string | null
  type?: string | null
  notes?: string | null  
  slot?: {
    startTime: string
    endTime: string
    doctor: {
      id: string
      firstName: string
      lastName: string
    }
  } | null
  doctorName?: string
  scheduledStart?: string
  scheduledEnd?: string
}


export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchAppointments()
  }, [])

  async function fetchAppointments() {
    const res = await fetch('/api/appointments/me')
    const data = await res.json()
    setAppointments(data)
  }

  async function cancelAppointment(id: string) {
    const res = await fetch('/api/appointments/cancel', {
      method: 'POST',
      body: JSON.stringify({ appointmentId: id }),
      headers: { 'Content-Type': 'application/json' }
    })

    if (res.ok) {
      alert('Appointment cancelled')
      fetchAppointments()
    } else {
      alert('Failed to cancel.')
    }
  }

  return (
    <div className="container py-4">
      <h3 className="mb-4">My Appointments</h3>

      {appointments.length === 0 && <p>No appointments scheduled.</p>}

      <ul className="list-group">
      {appointments.map((a) => {
  const isCancelledByDoctor = a.status === 'CANCELLED' && a.reason === 'Cancelled by doctor'

  const doctorName =
    a.slot?.doctor
      ? `${a.slot.doctor.firstName} ${a.slot.doctor.lastName}`
      : a.doctorName || 'Doctor'

  const startTime =
    a.slot?.startTime || a.scheduledStart || ''
  const endTime =
    a.slot?.endTime || a.scheduledEnd || ''
  
    
  return (
    <li key={a.id} className="list-group-item">
      <div className="d-flex justify-content-between">
        <div>
          <strong>Dr. {doctorName}</strong><br />
          {startTime && endTime && (
            <>
              {format(parseISO(startTime), 'PPpp')} → {format(parseISO(endTime), 'HH:mm')}<br />
            </>
          )}

          {a.type && (
            <div>
              <small><strong>Type:</strong> {a.type === 'new' ? 'New Problem' : 'Follow-Up'}</small>
            </div>
          )}

          {a.notes && (
            <div>
              <small><strong>Note:</strong> {a.notes}</small>
            </div>
          )}

          <small>Status: {a.status}</small><br />
          {isCancelledByDoctor && <small className="text-danger">❌ Cancelled by doctor</small>}
        </div>
        <div className="d-flex flex-column align-items-end gap-2" style={{ width: '140px' }}>
          {a.status !== 'CANCELLED' && a.slot && (
            <>
              <button
                onClick={() => router.push(`/patient/doctors/${a.slot?.doctor.id}?reschedule=${a.id}`)}
                className="btn btn-outline-secondary btn-sm w-100"
              >
                Reschedule
              </button>

              <button
                onClick={() => cancelAppointment(a.id)}
                className="btn btn-outline-danger btn-sm w-100"
              >
                Cancel
              </button>
            </>
          )}
        </div>

      </div>
    </li>
  )
})}
      </ul>
    </div>
  )
}
