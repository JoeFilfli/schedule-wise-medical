// components/CalendarPage.tsx
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
  parseISO,
} from 'date-fns'
import PageHeader from '@/components/layout/PageHeader'

interface Slot {
  id: string
  startTime: string
  endTime: string
  appointment:
    | {
        id:        string
        status:    'SCHEDULED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED'
        type:      string | null
        notes:     string | null
        patient:   { firstName: string; lastName: string }
        price?:    number    
      }
    | null
}

export default function CalendarPage() {
  const [slots,        setSlots]        = useState<Slot[]>([])
  const [selectedDate, setSelectedDate] = useState<Date|null>(null)
  const [activeSlot,   setActiveSlot]   = useState<Slot|null>(null)
  const [weekStart,    setWeekStart]    = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [weekDays,     setWeekDays]     = useState<Date[]>([])
  const [isClient,     setIsClient]     = useState(false)

  // Doctor inputs
  const [review,    setReview]    = useState('')
  const [newStatus, setNewStatus] = useState<'COMPLETED'|'NO_SHOW'|'CANCELLED'>('COMPLETED')
  const [price,     setPrice]     = useState(30)
  const [updating,  setUpdating]  = useState(false)

  // Slot‑generation inputs
  const [start,     setStart]     = useState('08:00')
  const [end,       setEnd]       = useState('15:00')
  const [length,    setLength]    = useState(20)
  const [breakTime, setBreakTime] = useState(5)

  const hours = Array.from({ length: 12 }, (_, i) => i + 8)

  // on mount
  useEffect(() => { setIsClient(true) }, [])

  // whenever weekStart changes
  useEffect(() => {
    setWeekDays(Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)))
    fetchSlots()
  }, [weekStart])

  // reset price when modal opens
  useEffect(() => {
    if (activeSlot?.appointment) {
      setPrice(activeSlot.appointment.price ?? 30)
      setReview('')
      setNewStatus(activeSlot.appointment.status as any)
    }
  }, [activeSlot])

  async function fetchSlots() {
    const res  = await fetch('/api/slots')
    const data = (await res.json()) as Slot[]
    setSlots(data)
  }

  async function deleteSlot(id: string) {
    if (!confirm('Cancel this slot?')) return
    await fetch('/api/slots/delete', {
      method: 'DELETE',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ id }),
    })
    setActiveSlot(null)
    await fetchSlots()
  }

  async function handleCompleteAppointment() {
    if (!activeSlot?.appointment?.id) return
    setUpdating(true)

    const payload = {
      id:     activeSlot.appointment.id,
      status: newStatus,
      review,
      price,              // <— send edited price
    }

    const res = await fetch('/api/appointments/complete', {
      method:  'POST',
      headers: { 'Content-Type':'application/json' },
      body:    JSON.stringify(payload),
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
    if (!confirm(`Delete all slots for ${format(date,'EEEE, MMM d')}?`)) return
    await fetch('/api/slots/delete-by-day', {
      method: 'DELETE',
      headers: { 'Content-Type':'application/json' },
      body:    JSON.stringify({ date: format(date,'yyyy-MM-dd') })
    })
    setSelectedDate(null)
    await fetchSlots()
  }

  async function generateSlots() {
    if (!selectedDate) return
    await fetch('/api/slots/generate', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({
        date:      format(selectedDate,'yyyy-MM-dd'),
        startTime: start,
        endTime:   end,
        length,
        breakTime,
      })
    })
    setSelectedDate(null)
    await fetchSlots()
  }

  // copy previous week
  async function copyPreviousWeekToThisWeek() {
    const res = await fetch('/api/slots/copy-previous-week', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ weekStart: weekStart.toISOString() })
    })
    const result = await res.json()
    if (res.ok && result.success) {
      await fetchSlots()
      alert("Copied last week's slots!")
    } else {
      alert(result.message || 'Failed to copy previous week.')
    }
  }

  const getSlotsForHour = (day: Date, hour: number) =>
    slots.filter(s => {
      const dt = parseISO(s.startTime)
      return isSameDay(dt, day) && getHours(dt) === hour
    })

  const goPreviousWeek = () => setWeekStart(w => addDays(w, -7))
  const goNextWeek     = () => setWeekStart(w => addDays(w,  7))

  if (!isClient) return null

  return (
    <div className="content-page calendar-page-container">
      <PageHeader 
        title="Weekly Calendar" 
        subtitle="Manage your appointment slots"
        size="large"
      >
        <div className="d-flex gap-2">
          <button onClick={goPreviousWeek} className="btn btn-outline-primary btn-sm">⬅️ Previous</button>
          <button onClick={goNextWeek} className="btn btn-outline-primary btn-sm">Next ➡️</button>
          <button className="btn btn-secondary btn-sm" onClick={copyPreviousWeekToThisWeek}>
            ↻ Copy Previous Week
          </button>
        </div>
      </PageHeader>
      
      {/* Status Legend */}
      <div className="mb-3">
        <h5>Status Legend</h5>
        <div className="d-flex gap-4 flex-wrap">
          <div className="d-flex align-items-center gap-1">
            <span className="badge bg-success text-white" style={{width: '1rem', height: '1rem'}}></span>
            <small className="text-success">Scheduled</small>
          </div>
          <div className="d-flex align-items-center gap-1">
            <span className="badge bg-secondary text-white" style={{width: '1rem', height: '1rem'}}></span>
            <small className="text-secondary">Completed</small>
          </div>
          <div className="d-flex align-items-center gap-1">
            <span className="badge bg-warning text-dark" style={{width: '1rem', height: '1rem'}}></span>
            <small className="text-warning">No-Show</small>
          </div>
          <div className="d-flex align-items-center gap-1">
            <span className="badge bg-danger text-white" style={{width: '1rem', height: '1rem'}}></span>
            <small className="text-danger">Urgent</small>
          </div>
        </div>
      </div>
      <div className="calendar-scrollable-area">
        {/* Calendar Grid */}
        <div className="table-responsive border">
          <table className="table table-bordered text-center align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width:'100px' }}>Time</th>
                {weekDays.map((day, idx) => {
                  const today = isSameDay(day,new Date())
                  return (
                    <th
                      key={idx}
                      className={today?'bg-info text-white fw-bold':''}
                      style={{ cursor:'pointer' }}
                      onClick={()=>setSelectedDate(day)}
                    >
                      <div>{format(day,'EEE dd')}</div>
                      {today && <small>Today</small>}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {hours.map(hour=>(
                <tr key={hour}>
                  <td className="bg-light fw-semibold">
                    {format(setHours(setMinutes(new Date(),0),hour),'HH:mm')}
                  </td>
                  {weekDays.map((day,col)=>(
                    <td key={col} className="p-1">
                      {getSlotsForHour(day,hour).map(slot=>{
                        const st = slot.appointment?.status
                        let bg='bg-info-subtle', txt=''
                        // Urgent appointments in red
                        if (slot.appointment?.type === 'urgent') {
                          bg = 'bg-danger'
                          txt = 'text-white'
                        } else if (st === 'SCHEDULED') {
                          bg = 'bg-success'
                          txt = 'text-white'
                        } else if (st === 'COMPLETED') {
                          bg = 'bg-secondary'
                          txt = 'text-white'
                        } else if (st === 'NO_SHOW') {
                          bg = 'bg-warning'
                          txt = 'text-dark'
                        }
                        return (
                          <div
                            key={slot.id}
                            className={`border rounded p-1 mb-1 small ${bg} ${txt}`}
                            style={{ cursor:'pointer' }}
                            onClick={()=>setActiveSlot(slot)}
                          >
                            {format(parseISO(slot.startTime),'HH:mm')}–{format(parseISO(slot.endTime),'HH:mm')}
                          </div>
                        )
                      })}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Slot Details Modal */}
        {activeSlot && (
          <div className="modal fade show d-block" style={{ backgroundColor:'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">

                <div className="modal-header">
                  <h5 className="modal-title">Slot Details</h5>
                  <button className="btn-close" onClick={()=>setActiveSlot(null)} />
                </div>

                <div className="modal-body">
                  <p>
                    <strong>Time:</strong>{' '}
                    {format(parseISO(activeSlot.startTime),'HH:mm')}–{format(parseISO(activeSlot.endTime),'HH:mm')}
                  </p>

                  {activeSlot.appointment ? (
                    <>
                      <p><strong>Status:</strong> {activeSlot.appointment.status}</p>
                      <p><strong>Patient:</strong> {activeSlot.appointment.patient.firstName} {activeSlot.appointment.patient.lastName}</p>
                      <p><strong>Type:</strong> {activeSlot.appointment.type||'—'}</p>
                      <p><strong>Note:</strong> {activeSlot.appointment.notes||'—'}</p>

                      <div className="mb-3">
                        <label className="form-label">Price ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={price}
                          onChange={e=>setPrice(Number(e.target.value))}
                          min={0}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Doctor's Review</label>
                        <textarea
                          rows={3}
                          className="form-control"
                          value={review}
                          onChange={e=>setReview(e.target.value)}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Mark As</label>
                        <select
                          className="form-select"
                          value={newStatus}
                          onChange={e=>setNewStatus(e.target.value as any)}
                        >
                          <option value="COMPLETED">Completed</option>
                          <option value="NO_SHOW">No‑Show</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>

                      <button
                        className="btn btn-primary w-100 mb-2"
                        onClick={handleCompleteAppointment}
                        disabled={updating}
                      >
                        {updating?'Saving…':'Submit & Close'}
                      </button>

                      <button
                        className="btn btn-outline-danger w-100"
                        onClick={()=>deleteSlot(activeSlot.id)}
                      >
                        ❌ Cancel Slot & Notify
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-outline-danger w-100"
                      onClick={()=>deleteSlot(activeSlot.id)}
                    >
                      ❌ Delete Slot
                    </button>
                  )}
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={()=>setActiveSlot(null)}>
                    Close
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Generate Slots Modal */}
        {selectedDate && (
          <div className="modal fade show d-block" style={{ backgroundColor:'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">

                <div className="modal-header">
                  <h5 className="modal-title">Generate Slots: {format(selectedDate,'EEEE, MMM d')}</h5>
                  <button className="btn-close" onClick={()=>setSelectedDate(null)} />
                </div>

                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">Start Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={start}
                      onChange={e=>setStart(e.target.value)}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">End Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={end}
                      onChange={e=>setEnd(e.target.value)}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Slot Length (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={length}
                      onChange={e=>setLength(+e.target.value)}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Break Between Slots (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={breakTime}
                      onChange={e=>setBreakTime(+e.target.value)}
                    />
                  </div>
                  <div className="alert alert-warning d-flex justify-content-between align-items-center">
                    <div>Need to clear this day's slots?</div>
                    <button
                      onClick={()=>deleteSlotsForDay(selectedDate)}
                      className="btn btn-sm btn-outline-danger"
                    >
                      Delete All Slots
                    </button>
                  </div>
                </div>

                <div className="modal-footer">
                  <button onClick={generateSlots} className="btn btn-primary">
                    Generate
                  </button>
                  <button onClick={()=>setSelectedDate(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
