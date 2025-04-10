'use client'

import { useEffect, useState } from 'react'
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  getHours,
  setHours,
  setMinutes,
  parseISO
} from 'date-fns'

interface Slot {
  id: string
  startTime: string
  endTime: string
  appointment: {
    id: string
    status: string
    type: string | null
    notes: string | null
    patient: {
      firstName: string
      lastName: string
    }
  } | null
}

export default function CalendarPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null)
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [weekDays, setWeekDays] = useState<Date[]>([])

  const [start, setStart] = useState('08:00')
  const [end, setEnd] = useState('15:00')
  const [length, setLength] = useState(20)
  const [breakTime, setBreakTime] = useState(5)

  const [review, setReview] = useState('')
  const [newStatus, setNewStatus] = useState('COMPLETED')
  const [updating, setUpdating] = useState(false)

  const hours = Array.from({ length: 12 }, (_, i) => i + 8)

  useEffect(() => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    setWeekDays(days)
    fetchSlots()
  }, [weekStart])

  async function fetchSlots() {
    const res = await fetch('/api/slots')
    const data = await res.json()
    setSlots(data)
  }

  async function generateSlots() {
    if (!selectedDate || !start || !end) return
    await fetch('/api/slots/generate', {
      method: 'POST',
      body: JSON.stringify({
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: start,
        endTime: end,
        length,
        breakTime
      }),
      headers: { 'Content-Type': 'application/json' }
    })
    setSelectedDate(null)
    await fetchSlots()
  }

  async function deleteSlot(id: string) {
    const confirmDelete = window.confirm('Are you sure you want to cancel this slot?')
    if (!confirmDelete) return

    await fetch('/api/slots/delete', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
      headers: { 'Content-Type': 'application/json' }
    })

    await fetchSlots()
    setActiveSlot(null)
  }

  async function handleCompleteAppointment() {
    if (!activeSlot?.appointment?.id) return
    setUpdating(true)

    const res = await fetch('/api/appointments/complete', {
      method: 'POST',
      body: JSON.stringify({
        id: activeSlot.appointment.id,
        status: newStatus,
        review
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    setUpdating(false)
    if (res.ok) {
      await fetchSlots()
      setActiveSlot(null)
    } else {
      alert('Failed to update appointment.')
    }
  }

  async function deleteSlotsForDay(date: Date) {
    const confirmDelete = window.confirm(`Delete all slots for ${format(date, 'EEEE, MMM d')}?`)
    if (!confirmDelete) return

    await fetch('/api/slots/delete-by-day', {
      method: 'DELETE',
      body: JSON.stringify({ date: format(date, 'yyyy-MM-dd') }),
      headers: { 'Content-Type': 'application/json' }
    })

    await fetchSlots()
    setSelectedDate(null)
  }

  const getSlotsForHour = (day: Date, hour: number) => {
    return slots.filter((s) => {
      const slotTime = parseISO(s.startTime)
      return isSameDay(slotTime, day) && getHours(slotTime) === hour
    })
  }

  const goToPreviousWeek = () => setWeekStart(prev => addDays(prev, -7))
  const goToNextWeek = () => setWeekStart(prev => addDays(prev, 7))

  const copyPreviousWeekToThisWeek = async () => {
    const res = await fetch('/api/slots/copy-previous-week', {
      method: 'POST',
      body: JSON.stringify({ weekStart: weekStart.toISOString() }),
      headers: { 'Content-Type': 'application/json' }
    })

    const result = await res.json()
    if (res.ok && result.success) {
      await fetchSlots()
    } else {
      alert(result.message || '❌ Failed to copy.')
    }
  }

  return (
    <div className="container py-4">
      <h2 className="mb-3">Weekly Calendar</h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <button className="btn btn-outline-primary me-2" onClick={goToPreviousWeek}>⬅️ Previous</button>
          <button className="btn btn-outline-primary" onClick={goToNextWeek}>Next ➡️</button>
        </div>
        <button className="btn btn-primary" onClick={copyPreviousWeekToThisWeek}>
          ⬅️ Copy Previous Week Schedule
        </button>
      </div>

      <div className="table-responsive border">
        <table className="table table-bordered mb-0 text-center align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: '100px' }}>Time</th>
              {weekDays.map((day, idx) => {
                const isToday = isSameDay(day, new Date())
                return (
                  <th
                    key={idx}
                    className={`position-relative ${isToday ? 'bg-info-subtle text-info fw-bold' : ''}`}
                    style={{ cursor: 'pointer', backgroundColor: '#f0f9ff' }}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div>{format(day, 'EEE dd')}</div>
                    {isToday && <div className="small text-primary">Today</div>}
                    <div className="position-absolute top-0 end-0 pe-1 text-muted" style={{ fontSize: '0.75rem' }}>➕</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour}>
                <td className="bg-light fw-semibold">
                  {format(setHours(setMinutes(new Date(0), 0), hour), 'HH:mm')}
                </td>
                {weekDays.map((day, col) => {
                  const hourSlots = getSlotsForHour(day, hour)
                  return (
                    <td key={col} className="p-1">
                      {hourSlots.map((slot) => {
                        const isBooked = !!slot.appointment
                        return (
                          <div
                            key={slot.id}
                            className={`border rounded p-1 mb-1 small ${isBooked ? 'bg-success text-white' : 'bg-info-subtle'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setActiveSlot(slot)}
                          >
                            {format(parseISO(slot.startTime), 'HH:mm')} - {format(parseISO(slot.endTime), 'HH:mm')}
                          </div>
                        )
                      })}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slot Details Modal */}
      {activeSlot && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: '#00000080' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Slot Details</h5>
                <button type="button" className="btn-close" onClick={() => setActiveSlot(null)} />
              </div>
              <div className="modal-body">
                <p>
                  <strong>Time:</strong>{' '}
                  {format(parseISO(activeSlot.startTime), 'HH:mm')} -{' '}
                  {format(parseISO(activeSlot.endTime), 'HH:mm')}
                </p>

                {activeSlot.appointment ? (
                  <>
                    <p><strong>Status:</strong> Booked</p>
                    <p><strong>Patient:</strong> {activeSlot.appointment.patient.firstName} {activeSlot.appointment.patient.lastName}</p>
                    <p><strong>Type:</strong> {activeSlot.appointment.type === 'new' ? 'New Problem' : 'Follow-Up'}</p>
                    <p><strong>Patient Note:</strong> {activeSlot.appointment.notes || '—'}</p>

                    <div className="mb-2">
                      <label className="form-label">Doctor's Review / Prescription</label>
                      <textarea
                        rows={3}
                        className="form-control"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Mark Appointment As</label>
                      <select
                        className="form-select"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <option value="COMPLETED">Completed</option>
                        <option value="NO_SHOW">No Show</option>
                      </select>
                    </div>

                    <div className="d-flex flex-column gap-2">
                      <button
                        className="btn btn-primary"
                        onClick={handleCompleteAppointment}
                        disabled={updating}
                      >
                        {updating ? 'Saving...' : 'Submit & Close'}
                      </button>

                      <button
                        className="btn btn-outline-danger"
                        onClick={() => deleteSlot(activeSlot.id)}
                      >
                        ❌ Cancel Slot & Notify Patient
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p><strong>Status:</strong> Available</p>
                    <div className="d-flex flex-column gap-2">
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => deleteSlot(activeSlot.id)}
                      >
                        ❌ Delete Slot
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setActiveSlot(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Generate Slots Modal */}
      {selectedDate && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: '#00000080' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Generate Slots: {format(selectedDate, 'EEEE, MMM d')}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedDate(null)} />
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Start Time</label>
                  <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="form-control" />
                </div>
                <div className="mb-2">
                  <label className="form-label">End Time</label>
                  <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="form-control" />
                </div>
                <div className="mb-2">
                  <label className="form-label">Slot Length (minutes)</label>
                  <input type="number" value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="form-control" />
                </div>
                <div className="mb-2">
                  <label className="form-label">Break Between Slots (minutes)</label>
                  <input type="number" value={breakTime} onChange={(e) => setBreakTime(parseInt(e.target.value))} className="form-control" />
                </div>
                <div className="alert alert-warning d-flex justify-content-between align-items-center">
                  <div>Need to clear this day's slots?</div>
                  <button onClick={() => deleteSlotsForDay(selectedDate)} className="btn btn-sm btn-outline-danger">
                    Delete All Slots
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={generateSlots} className="btn btn-primary">Generate</button>
                <button onClick={() => setSelectedDate(null)} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
