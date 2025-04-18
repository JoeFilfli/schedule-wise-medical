'use client'

import { useEffect, useState } from 'react'
import { format, parseISO, isAfter } from 'date-fns'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'

interface Appointment {
  id: string
  status: string
  reason: string | null
  type?: string | null
  notes?: string | null  
  review?: string | null
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

type AppointmentWithDate = Appointment & { startDate: Date }

export default function AppointmentsPage() {
  const [appointments, setAppointments]           = useState<Appointment[]>([])
  const [selected,    setSelected]                = useState<AppointmentWithDate|null>(null)
  const [isClient,    setIsClient]                = useState(false)
  const router                                    = useRouter()

  useEffect(() => {
    setIsClient(true)
    fetchAppointments()
  }, [])

  async function fetchAppointments() {
    try {
      const res = await fetch('/api/appointments/me')
      const data: Appointment[] = await res.json()
      setAppointments(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function cancelAppointment(id: string) {
    const res = await fetch('/api/appointments/cancel', {
      method: 'POST',
      body: JSON.stringify({ appointmentId: id }),
      headers: { 'Content-Type': 'application/json' }
    })
    if (res.ok) {
      fetchAppointments()
      setSelected(null)
    } else {
      alert('Failed to cancel.')
    }
  }

  if (!isClient) return null

  const now = new Date()

  // Build enriched array with parsed startDate
  const enriched: AppointmentWithDate[] = appointments.map(a => {
    const startStr = a.slot?.startTime || a.scheduledStart || ''
    const startDate = startStr ? parseISO(startStr) : now
    return { ...a, startDate }
  })

  // Split into upcoming/past
  const upcoming = enriched
    .filter(a => isAfter(a.startDate, now) || a.startDate.getTime() === now.getTime())
    .sort((a,b) => a.startDate.getTime() - b.startDate.getTime())

  const past = enriched
    .filter(a => a.startDate.getTime() < now.getTime())
    .sort((a,b) => b.startDate.getTime() - a.startDate.getTime())

  // Render list helper
  const renderList = (list: AppointmentWithDate[]) => (
    <ul className="list-group">
      {list.map(a => {
        const endStr = a.slot?.endTime || a.scheduledEnd || ''
        const end = endStr ? parseISO(endStr) : a.startDate
        const doctorName = a.slot
          ? `${a.slot.doctor.firstName} ${a.slot.doctor.lastName}`
          : a.doctorName || 'Doctor'

        return (
          <li
            key={a.id}
            className="list-group-item list-group-item-action clickable-item"
            role="button"
            tabIndex={0}
            onClick={() => setSelected(a)}
            onKeyDown={e => { if (e.key === 'Enter') setSelected(a) }}
          >
            <div className="d-flex justify-content-between">
              <div>
                <strong>Dr. {doctorName}</strong><br/>
                {format(a.startDate, 'PPpp')} → {format(end, 'HH:mm')}<br/>
                <small>Status: {a.status}</small>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="content-page">
      <PageHeader title="My Appointments" />
      
      <div className="page-content">
        {upcoming.length > 0 && (
          <>
            <h5>Upcoming</h5>
            {renderList(upcoming)}
          </>
        )}

        {past.length > 0 && (
          <>
            <h5 className="mt-4">Past</h5>
            {renderList(past)}
          </>
        )}

        {upcoming.length === 0 && past.length === 0 && (
          <p>No appointments scheduled.</p>
        )}

        {/* Details Modal */}
        {selected && (
          <div
            className="modal fade show d-block"
            role="dialog"
            aria-modal="true"
            aria-labelledby="appt-detail-title"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={e => { if (e.currentTarget === e.target) setSelected(null) }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 id="appt-detail-title" className="modal-title">
                    Appointment Details
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close details"
                    onClick={() => setSelected(null)}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Doctor:</strong>{' '}
                    {selected.slot
                      ? `${selected.slot.doctor.firstName} ${selected.slot.doctor.lastName}`
                      : selected.doctorName}
                  </p>
                  <p>
                    <strong>When:</strong><br/>
                    {format(selected.startDate, 'PPPP p')} →{' '}
                    {selected.slot?.endTime
                      ? format(parseISO(selected.slot.endTime), 'p')
                      : format(selected.startDate, 'p')}
                  </p>
                  {selected.type && (
                    <p>
                      <strong>Type:</strong>{' '}
                      {selected.type === 'new' ? 'New Problem' : 'Follow‑Up'}
                    </p>
                  )}
                  {selected.notes && (
                    <p><strong>Note:</strong> {selected.notes}</p>
                  )}
                  {selected.review && (
                    <p><strong>Review:</strong> {selected.review}</p>
                  )}
                  <p><strong>Status:</strong> {selected.status}</p>
                  {selected.reason && (
                    <p><strong>Reason:</strong> {selected.reason}</p>
                  )}
                </div>
                <div className="modal-footer">
                  {selected.status === 'SCHEDULED' && selected.slot && (
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        router.push(
                          `/patient/doctors/${selected.slot!.doctor.id}?reschedule=${selected.id}`
                        )
                      }
                    >
                      Reschedule
                    </button>
                  )}
                  {selected.status === 'SCHEDULED' && (
                    <button
                      className="btn btn-danger"
                      onClick={() => cancelAppointment(selected.id)}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelected(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clickable styles */}
        <style jsx global>{`
          .clickable-item {
            cursor: pointer;
            transition: background-color 0.2s, transform 0.1s;
          }
          .clickable-item:hover {
            background-color: #e7f3ff; /* light blue */
            transform: translateY(-1px);
          }
          .clickable-item:active {
            background-color: #d0e7ff;
          }
        `}</style>
      </div>
    </div>
  )
}
