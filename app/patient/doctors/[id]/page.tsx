'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import PageHeader from '@/components/layout/PageHeader';

import FullCalendar from '@fullcalendar/react';
import type { EventInput, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  patientName?: string;
}

interface Doctor {
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  doctorProfile: {
    specialty: string | null;
    bio: string | null;
  } | null;
}

interface Appointment {
  id: string;
  slot: {
    id: string;
    startTime: string;
    endTime: string;
    doctor: { id: string };
  };
}

export default function DoctorSlotsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const calendarRef = useRef<FullCalendar>(null);

  const doctorId     = Array.isArray(params.id) ? params.id[0] : params.id;
  const rescheduleId = searchParams.get('reschedule') ?? undefined;

  const [slots, setSlots]               = useState<Slot[]>([]);
  const [events, setEvents]             = useState<EventInput[]>([]);
  const [doctor, setDoctor]             = useState<Doctor|null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot|null>(null);
  const [oldSlot, setOldSlot]           = useState<Slot|null>(null);
  const [appointmentType, setAppointmentType] = useState('');
  const [note, setNote]                       = useState('');
  const [loading, setLoading]                 = useState(false);

  // Fetch old appointment slot when rescheduling
  useEffect(() => {
    if (!rescheduleId) return;
    fetch('/api/appointments/me')
      .then(r => r.json())
      .then((data: Appointment[]) => {
        const appt = data.find(a => a.id === rescheduleId);
        if (appt) {
          setOldSlot({
            id:        appt.slot.id,
            startTime: appt.slot.startTime,
            endTime:   appt.slot.endTime
          });
          // scroll to it for visibility
          const time = appt.slot.startTime.slice(11);
          calendarRef.current?.getApi().scrollToTime(time);
        }
      })
      .catch(console.error);
  }, [rescheduleId]);

  // Fetch slots & doctor, build events including oldSlot
  useEffect(() => {
    if (!doctorId) return;
    Promise.all([
      fetch(`/api/doctors/${doctorId}/slots`),
      fetch(`/api/doctors/${doctorId}/profile`)
    ])
      .then(async ([slotsRes, docRes]) => {
        const slotsData: Slot[] = await slotsRes.json();
        setSlots(slotsData);
        setDoctor(await docRes.json());

        const evts: EventInput[] = slotsData.map(s => ({
          id: s.id,
          title: s.patientName ?? 'Available',
          start: s.startTime,
          end: s.endTime,
          classNames: s.id === oldSlot?.id ? ['old-slot'] : []
        }));

        // If oldSlot isn't in the fetched free slots, add it explicitly
        if (oldSlot && !slotsData.some(s => s.id === oldSlot.id)) {
          evts.push({
            id: oldSlot.id,
            title: 'Your Booking',
            start: oldSlot.startTime,
            end: oldSlot.endTime,
            classNames: ['old-slot']
          });
        }

        setEvents(evts);
      })
      .catch(console.error);
  }, [doctorId, oldSlot]);

  async function bookSlot() {
    if (!selectedSlot || !appointmentType) return;
    setLoading(true);
    if (rescheduleId) {
      await fetch('/api/appointments/cancel', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ appointmentId: rescheduleId })
      });
    }
    const res = await fetch('/api/appointments/book', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        slotId: selectedSlot.id,
        type:   appointmentType,
        note
      })
    });
    setLoading(false);
    if (res.ok) router.push('/patient/appointments');
    else alert('Booking failed.');
  }

  function handleEventClick(info: EventClickArg) {
    const slot = slots.find(s => s.id === info.event.id) || oldSlot;
    if (slot) {
      setSelectedSlot(slot);
    }
  }

  return (
    <div className="content-page calendar-page-container">
      {doctor && (
        <PageHeader title={`Dr. ${doctor.firstName} ${doctor.lastName}'s Calendar`}>
          <div className="d-flex align-items-center gap-2">
            <Image
              src={doctor.profilePicture || '/default-avatar.png'}
              alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
              width={40} height={40}
              className="rounded-circle border"
            />
          </div>
        </PageHeader>
      )}
      
      <div className="calendar-scrollable-area">
        {/* Light-red warning banner */}
        {oldSlot && (
          <div className="alert mb-3 old-banner">
            <strong>Your Current Booking:</strong><br/>
            {format(parseISO(oldSlot.startTime), 'PPpp')} → {format(parseISO(oldSlot.endTime), 'p')}
          </div>
        )}

        {/* Calendar */}
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          slotMinTime="08:00:00"
          slotMaxTime="19:00:00"
          allDaySlot={false}
          navLinks
          events={events}
          eventClick={handleEventClick}
          height="auto"
        />

        {/* Booking Modal */}
        {selectedSlot && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Appointment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedSlot(null)}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Time:</strong><br/>
                    {format(parseISO(selectedSlot.startTime), 'PPpp')} →{' '}
                    {format(parseISO(selectedSlot.endTime), 'p')}
                  </p>
                  <fieldset className="mb-3">
                    <legend>Type</legend>
                    <div className="form-check">
                      <input
                        id="type-new"
                        name="type"
                        type="radio"
                        className="form-check-input"
                        value="new"
                        onChange={e => setAppointmentType(e.target.value)}
                      />
                      <label htmlFor="type-new" className="form-check-label">
                        New Problem
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        id="type-follow"
                        name="type"
                        type="radio"
                        className="form-check-input"
                        value="follow-up"
                        onChange={e => setAppointmentType(e.target.value)}
                      />
                      <label htmlFor="type-follow" className="form-check-label">
                        Follow‑Up
                      </label>
                    </div>
                  </fieldset>
                  <textarea
                    className="form-control mb-3"
                    rows={3}
                    placeholder="Optional note…"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedSlot(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={bookSlot}
                    disabled={!appointmentType || loading}
                  >
                    {loading ? 'Booking…' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Light-red styles */}
      <style jsx global>{`
      /* Existing overrides… */
      .old-slot {
        background: #fde2e2 !important;
        border:    2px dashed #f5c2c2 !important;
        color:     #842029 !important;
      }
      .old-banner {
        background-color: #fde2e2 !important;
        color:            #842029 !important;
        border:           1px solid #f5c2c2 !important;
      }

      /* Highlight "today" in light blue */
      .fc .fc-day-today,
      .fc .fc-timegrid-col .fc-timegrid-col-axis:has(+ .fc-timegrid-col[data-date].fc-col-today),
      .fc .fc-timegrid-col-frame .fc-daygrid-day.fc-col-today {
        background-color: #e0f7fa !important;
      }
    `}</style>

    </div>
  );
}
