'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format, parseISO } from 'date-fns';
import DatePicker from 'react-datepicker';
import type { DatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  doctor: {
    firstName: string;
    lastName: string;
  };
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FormData {
  doctor?: string;
  from?: string;
  to?: string;
}

interface SlotButtonProps {
  slot: Slot;
  onClick: (slot: Slot) => void;
  isSelected: boolean;
}

const SlotButton: React.FC<SlotButtonProps> = ({ slot, onClick, isSelected }) => (
  <button
    onClick={() => onClick(slot)}
    className={`btn btn-outline-primary mb-2 me-2 ${isSelected ? 'active' : ''}`}
    style={{ minWidth: '120px' }}
  >
    {format(parseISO(slot.startTime), 'HH:mm')} - {format(parseISO(slot.endTime), 'HH:mm')}
  </button>
);

const SlotsList: React.FC<{ 
  slots: Record<string, Slot[]>;
  onSlotSelect: (slot: Slot) => void;
  selectedSlot: Slot | null;
}> = ({ slots, onSlotSelect, selectedSlot }) => (
  <div className="mt-3">
    {Object.entries(slots).map(([date, daySlots]) => (
      <div key={date} className="mb-4">
        <h6 className="fw-bold mb-2">{format(parseISO(date), 'EEEE, MMMM d')}</h6>
        <div className="d-flex flex-wrap">
          {daySlots.map((slot) => (
            <SlotButton
              key={slot.id}
              slot={slot}
              onClick={onSlotSelect}
              isSelected={selectedSlot?.id === slot.id}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default function PatientChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant' as const,
      content:
        '👋 Hello! I can help you find doctors, book appointments, or answer questions.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [availableSlots, setAvailableSlots] = useState<Record<string, Slot[]>>({});
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [appointmentType, setAppointmentType] = useState<'' | 'new' | 'follow-up'>('');
  const [note, setNote] = useState('');
  const [showSlots, setShowSlots] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showDateRangeForm, setShowDateRangeForm] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [bookingError, setBookingError] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (input === '' && !loading) {
      inputRef.current?.focus();
    }
  }, [input, loading]);

  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, [messages]);

  useEffect(() => {
    if (selectedDoctor) {
      fetchSlots();
    }
  }, [selectedDoctor]);

  async function fetchSlots() {
    try {
      const res = await fetch(`/api/doctors/${selectedDoctor}/slots`);
      if (!res.ok) throw new Error('Failed to fetch slots');
      const data = await res.json();
      setAvailableSlots(data);
      setShowSlots(true);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user' as const, content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    try {
    const res = await fetch('/api/chat', {
      method: 'POST',
        body: JSON.stringify({ messages: updatedMessages, formData }),
      headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      let reply = data.reply;
      
      // Parse the reply if it's a stringified JSON
      if (typeof reply === 'string') {
        try {
          reply = JSON.parse(reply);
        } catch (e) {
          // If parsing fails, treat it as a regular message
          reply = { action: 'Response', response: reply };
        }
      }
      
      if (reply.action === 'RenderDateRangeForm') {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant' as const, content: reply.message },
        ]);
        setFormData({ doctor: reply.doctor });
        setSelectedDoctor(reply.doctor);
        setShowDateRangeForm(true);
      } else if (reply.action === 'RenderSlotsWithBookingUI') {
        // Don't add the raw JSON to messages
        setMessages((prev) => [
          ...prev,
          { role: 'assistant' as const, content: `📅 Available slots for ${reply.doctor}:` },
        ]);
        
        // Create a formatted message with the slots
        let slotsMessage = '';
        Object.entries(reply.slots).forEach(([date, slots]) => {
          const formattedDate = format(parseISO(date), 'EEEE, MMMM d');
          slotsMessage += `\n\n**${formattedDate}**\n`;
          (slots as any[]).forEach((slot) => {
            const startTime = format(parseISO(slot.startTime), 'HH:mm');
            const endTime = format(parseISO(slot.endTime), 'HH:mm');
            slotsMessage += `\n- ${startTime} - ${endTime}`;
          });
        });

        if (slotsMessage) {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant' as const, content: slotsMessage.trim() },
          ]);
        }

        setAvailableSlots(reply.slots);
        setSelectedDoctor(reply.doctor);
        setShowSlots(true);
      } else if (reply.action === 'Response') {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant' as const, content: reply.response },
        ]);
      } else {
        // Handle any other response types
        setMessages((prev) => [
          ...prev,
          { role: 'assistant' as const, content: reply.response || '✅ How can I help you next?' },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant' as const, content: '❌ Something went wrong.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function submitDateRange() {
    if (!fromDate || !toDate) return;
    setLoading(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formData: {
          ...formData,
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
        messages: [],
      }),
    });

    const data = await res.json();
    setShowDateRangeForm(false);
    setFromDate(null);
    setToDate(null);
    setLoading(false);

    if (data.reply.action === 'RenderSlotsWithBookingUI') {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant' as const, content: '📅 Here are the available slots:' },
      ]);
      setAvailableSlots(data.reply.slots);
      setShowSlots(true);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant' as const, content: data.reply },
      ]);
    }
  }

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
  };

  const renderMessage = (msg: Message, index: number) => {
    if (msg.content.startsWith('{"action":"RenderSlotsWithBookingUI"')) {
      try {
        const data = JSON.parse(msg.content);
  return (
          <div key={index} className="mb-3 text-start">
            <div className="d-inline-block px-3 py-2 rounded bg-white border" style={{ maxWidth: '100%' }}>
              <h5 className="mb-3">📅 Available Slots for {data.doctor}</h5>
              <SlotsList
                slots={data.slots}
                onSlotSelect={handleSlotSelect}
                selectedSlot={selectedSlot}
              />
            </div>
          </div>
        );
      } catch (e) {
        return null;
      }
    }

    return (
      <div
        key={index}
        className={`mb-3 ${msg.role === 'user' ? 'text-end' : 'text-start'}`}
      >
        <div
          className={`d-inline-block px-3 py-2 rounded ${
            msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border'
          }`}
          style={{ maxWidth: '100%' }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ children }) => (
                <table className="table table-bordered table-sm mb-2">
                  {children}
                </table>
              ),
              th: ({ children }) => (
                <th className="bg-light text-center">{children}</th>
              ),
              td: ({ children }) => <td className="text-center">{children}</td>,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || !appointmentType) {
      setBookingError('Please select an appointment type');
      return;
    }

    setIsBooking(true);
    setBookingError('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          type: appointmentType,
          notes: note,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to book appointment');
      }

      // Success - close modal and show success message
      setSelectedSlot(null);
      setAppointmentType('');
      setNote('');
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant' as const,
          content: `✅ Appointment booked successfully for ${format(parseISO(selectedSlot.startTime), 'PPPP')} at ${format(parseISO(selectedSlot.startTime), 'p')} with Dr. ${selectedSlot.doctor.firstName} ${selectedSlot.doctor.lastName}`,
        },
      ]);

      // Refresh available slots
      if (selectedDoctor) {
        const updatedRes = await fetch(`/api/doctors/${selectedDoctor}/slots`);
        if (updatedRes.ok) {
          const updatedSlots = await updatedRes.json();
          setAvailableSlots(updatedSlots);
        }
      }
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Failed to book appointment');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="h-100 d-flex flex-column bg-white" style={{ overflow: 'hidden' }}>
      <div className="container-fluid py-4 d-flex flex-column h-100">
        <h2 className="mb-4 text-center">💬 Chat with Assistant</h2>

        <div className="mx-auto w-100 px-2 d-flex flex-column" style={{ maxWidth: '1200px', flex: 1, minHeight: 0 }}>
          <div
            ref={scrollContainerRef}
            className="flex-grow-1 overflow-auto"
          >
            {messages.map((msg, i) => renderMessage(msg, i))}
            {showDateRangeForm && (
              <div className="bg-light p-3 border rounded mb-3">
                <div className="d-flex flex-column flex-md-row gap-3 align-items-center justify-content-center">
              <DatePicker
                selected={fromDate}
                    onChange={(date: Date | null) => setFromDate(date)}
                selectsStart
                startDate={fromDate}
                endDate={toDate}
                placeholderText="Start Date"
                className="form-control"
              />
              <DatePicker
                selected={toDate}
                    onChange={(date: Date | null) => setToDate(date)}
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

          <div className="mt-3">
      <form onSubmit={handleSubmit} className="d-flex gap-2">
        <input
                ref={inputRef}
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
        </div>
      </div>

      {/* Booking Modal */}
      {selectedSlot && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Appointment</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setSelectedSlot(null);
                    setAppointmentType('');
                    setNote('');
                    setBookingError('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {bookingError && (
                  <div className="alert alert-danger">{bookingError}</div>
                )}
                <div className="alert alert-info">
                  <div className="mb-2">
                    <strong>Selected Time:</strong>
                    <br />
                    {format(parseISO(selectedSlot.startTime), 'PPPP p')} -{' '}
                    {format(parseISO(selectedSlot.endTime), 'p')}
                  </div>
                  <div>
                    <strong>Doctor:</strong> Dr. {selectedSlot.doctor.firstName}{' '}
                    {selectedSlot.doctor.lastName}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Appointment Type</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="appointmentType"
                      value="new"
                      checked={appointmentType === 'new'}
                      onChange={(e) => setAppointmentType(e.target.value as 'new' | 'follow-up')}
                    />
                    <label className="form-check-label">New Problem</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="appointmentType"
                      value="follow-up"
                      checked={appointmentType === 'follow-up'}
                      onChange={(e) => setAppointmentType(e.target.value as 'new' | 'follow-up')}
                    />
                    <label className="form-check-label">Follow-Up</label>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add any notes for the doctor..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedSlot(null);
                    setAppointmentType('');
                    setNote('');
                    setBookingError('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleBookAppointment}
                  disabled={isBooking || !appointmentType}
                >
                  {isBooking ? 'Booking...' : 'Book Appointment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}