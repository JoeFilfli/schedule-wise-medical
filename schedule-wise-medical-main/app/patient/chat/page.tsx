'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import remarkGfm from 'remark-gfm'
import { parseISO, format } from 'date-fns'
import PageHeader from '@/components/layout/PageHeader'

interface Slot {
  id: string
  startTime: string
  endTime: string
  doctor: {
    firstName: string
    lastName: string
  }
}

export default function PatientChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [formMode, setFormMode] = useState<{ doctor?: string; message: string } | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const [appointmentType, setAppointmentType] = useState('')
  const [note, setNote] = useState('')

  async function fetchReply(payload: any) {
    setLoading(true)
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    try {
      const parsed = JSON.parse(data.reply)

      if (parsed.action === 'RenderDateRangeForm') {
        setFormMode({ doctor: parsed.doctor, message: parsed.message })
        return
      }

      if (parsed.action === 'RenderSlotsWithBookingUI') {
        setSlots(parsed.slots)
        return
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: parsed.response || data.reply }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const input = (e.currentTarget as any).elements.message.value.trim()
    if (!input) return

    const newMsg = { role: 'user', content: input }
    const updated = [...messages, newMsg]
    setMessages(updated)
    fetchReply({ messages: updated })
    ;(e.currentTarget as any).reset()
  }

  async function submitDateRange() {
    if (!fromDate || !toDate) return
    fetchReply({
      formData: {
        doctor: formMode?.doctor,
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
      messages,
    })

    setFormMode(null)
    setFromDate(null)
    setToDate(null)
  }

  async function bookSlot() {
    if (!selectedSlot || !appointmentType) return

    const res = await fetch('/api/appointments/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slotId: selectedSlot.id,
        type: appointmentType,
        note,
      }),
    })

    if (res.ok) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `✅ Appointment confirmed for ${format(parseISO(selectedSlot.startTime), 'PPpp')}` },
      ])
      setSlots([])
      setSelectedSlot(null)
      setAppointmentType('')
      setNote('')
    } else {
      alert('❌ Booking failed.')
    }
  }

  const groupedSlots: Record<string, Slot[]> = {}
  slots.forEach((slot) => {
    const dateKey = format(parseISO(slot.startTime), 'yyyy-MM-dd')
    if (!groupedSlots[dateKey]) groupedSlots[dateKey] = []
    groupedSlots[dateKey].push(slot)
  })

  return (
    <div className="content-page">
      <PageHeader title="Chat with Assistant" />
      
      <div className="page-content d-flex flex-column">
        <div className="border bg-light rounded p-3 mb-3" style={{ 
          flex: 1, 
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {messages.map((msg, i) => (
            <div key={i} className={`mb-3 ${msg.role === 'user' ? 'text-end' : 'text-start'}`}>
              <div className={`d-inline-block px-3 py-2 rounded ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border'}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}

          {formMode && (
            <div className="bg-white p-3 border rounded mb-3">
              <p className="mb-2">{formMode.message}</p>
              <div className="d-flex flex-column flex-md-row gap-3 align-items-center">
                <DatePicker
                  selected={fromDate}
                  onChange={(date) => setFromDate(date)}
                  selectsStart
                  startDate={fromDate}
                  endDate={toDate}
                  placeholderText="Start Date"
                  className="form-control"
                />
                <DatePicker
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  selectsEnd
                  startDate={fromDate}
                  endDate={toDate}
                  placeholderText="End Date"
                  className="form-control"
                />
                <button className="btn btn-success" onClick={submitDateRange} disabled={!fromDate || !toDate || loading}>
                  {loading ? 'Loading...' : 'Show Slots'}
                </button>
              </div>
            </div>
          )}

          {slots.length > 0 && (
            <>
              <hr />
              <h5 className="mb-3">📅 Available Slots</h5>
              {Object.entries(groupedSlots).map(([date, list]) => (
                <div key={date} className="mb-4">
                  <h6>{format(parseISO(list[0].startTime), 'EEEE, MMMM d')}</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {list.map((slot) => (
                      <button
                        key={slot.id}
                        className="btn btn-outline-success"
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {format(parseISO(slot.startTime), 'HH:mm')} → {format(parseISO(slot.endTime), 'HH:mm')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="d-flex gap-2">
          <input type="text" name="message" className="form-control" placeholder="Ask something..." disabled={loading} />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? '...' : 'Send'}
          </button>
        </form>

        {/* Booking modal */}
        {selectedSlot && (
          <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: '#00000080' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Appointment</h5>
                  <button type="button" className="btn-close" onClick={() => setSelectedSlot(null)} />
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Time:</strong>{' '}
                    {format(parseISO(selectedSlot.startTime), 'PPPP p')} - {format(parseISO(selectedSlot.endTime), 'p')}
                  </p>
                  <div className="mb-3">
                    <label className="form-label">Appointment Type</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="type"
                        value="new"
                        onChange={(e) => setAppointmentType(e.target.value)}
                        id="new"
                      />
                      <label className="form-check-label" htmlFor="new">New Problem</label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="type"
                        value="follow-up"
                        onChange={(e) => setAppointmentType(e.target.value)}
                        id="follow-up"
                      />
                      <label className="form-check-label" htmlFor="follow-up">Follow-Up</label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Message to Doctor (optional)</label>
                    <textarea className="form-control" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedSlot(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={bookSlot}
                    disabled={!appointmentType}
                  >
                    Book Appointment
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
