'use client'

import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function PatientChat() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: '👋 Hello! I can help you find doctors or check slot availability.' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [formMode, setFormMode] = useState<null | string>(null)
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

  useEffect(() => {
    scrollToBottom()
  }, [messages, formMode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const newMsg = { role: 'user', content: input }
    const updatedMessages = [...messages, newMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updatedMessages }),
    })

    const data = await res.json()

    try {
      const parsed = JSON.parse(data.reply)
      if (parsed.action === 'RenderDateRangeForm') {
        setFormMode(parsed.message)
        setMessages(prev => [...prev, { role: 'assistant', content: parsed.message }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: parsed.response || data.reply }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } finally {
      setLoading(false)
    }
  }

  async function submitDateRange() {
    if (!fromDate || !toDate) return
    setLoading(true)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formData: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
        messages: [],
      }),
    })

    const data = await res.json()
    setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    setFormMode(null)
    setFromDate(null)
    setToDate(null)
    setLoading(false)
  }

  return (
    <div className="container-fluid px-4 py-4" style={{ height: '93vh', display: 'flex', flexDirection: 'column' }}>
      <h2 className="mb-3 text-center">💬 Chat with Assistant</h2>

      <div className="border rounded bg-light p-3 mb-3" style={{ flex: 1, overflowY: 'auto' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`mb-3 ${msg.role === 'user' ? 'text-end' : 'text-start'}`}>
            <div className={`d-inline-block px-3 py-2 rounded ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border'}`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {formMode && (
          <div className="bg-white p-3 border rounded mb-3">
            <p className="mb-2">{formMode}</p>
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
              <button
                className="btn btn-success"
                onClick={submitDateRange}
                disabled={loading || !fromDate || !toDate}
              >
                {loading ? 'Loading...' : 'Show Slots'}
              </button>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
