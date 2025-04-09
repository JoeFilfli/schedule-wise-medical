'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
}

interface Doctor {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string | null;
  doctorProfile: {
    specialty: string | null;
    bio: string | null;
  } | null;
}

export default function DoctorSlotsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const doctorId = Array.isArray(params.id) ? params.id[0] : params.id;
  const oldAppointmentId = searchParams.get('reschedule');

  const [slots, setSlots] = useState<Slot[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [appointmentType, setAppointmentType] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doctorId) {
      fetchSlots();
      fetchDoctor();
    }
  }, [doctorId]);

  async function fetchSlots() {
    const res = await fetch(`/api/doctors/${doctorId}/slots`);
    const data = await res.json();
    setSlots(data);
  }

  async function fetchDoctor() {
    const res = await fetch(`/api/doctors/${doctorId}/profile`);
    const data = await res.json();
    setDoctor(data);
  }

  async function bookSlot() {
    if (!selectedSlot || !appointmentType) return;

    setLoading(true);

    if (oldAppointmentId) {
      await fetch('/api/appointments/cancel', {
        method: 'POST',
        body: JSON.stringify({ appointmentId: oldAppointmentId }),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch('/api/appointments/book', {
      method: 'POST',
      body: JSON.stringify({
        slotId: selectedSlot.id,
        type: appointmentType,
        note,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    setLoading(false);

    if (res.ok) {
      router.push('/patient/appointments');
    } else {
      alert('Booking failed.');
    }
  }

  const groupedSlots: Record<string, Slot[]> = {};
  slots.forEach((slot) => {
    const dateKey = format(parseISO(slot.startTime), 'yyyy-MM-dd');
    if (!groupedSlots[dateKey]) groupedSlots[dateKey] = [];
    groupedSlots[dateKey].push(slot);
  });

  return (
    <div className="container py-4">
      {/* Doctor Profile Header */}
      {doctor && (
        <div className="d-flex align-items-start gap-4 mb-5">
          <Image
            src={doctor.profilePicture || '/default-avatar.png'}
            alt="Doctor Profile"
            width={120}
            height={120}
            className="rounded-circle border shadow"
            style={{ objectFit: 'cover' }}
          />
          <div>
        <h2 className="mb-2">Dr. {doctor.firstName} {doctor.lastName}</h2>
          {doctor.doctorProfile?.specialty && (
            <p className="mb-2">
              <strong>Specialty:</strong> {doctor.doctorProfile.specialty}
            </p>
          )}
        </div>

        </div>
      )}

      <h4 className="mb-3">Available Slots</h4>

      {slots.length > 0 && (
        <p className="text-muted mb-4">
          Select a time slot to book your appointment.
        </p>
      )}
      {slots.length === 0 && <p>No available slots</p>}

      {Object.entries(groupedSlots).map(([date, daySlots]) => (
        <div key={date} className="mb-4">
          <h5 className="fw-bold border-bottom pb-1 mb-3">
            {format(parseISO(daySlots[0].startTime), 'EEEE, MMMM d')}
          </h5>

          <div className="d-flex flex-wrap gap-2">
            {daySlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot)}
                className="btn btn-outline-success fs-6 px-4 py-2"
              >
                {format(parseISO(slot.startTime), 'HH:mm')} -{' '}
                {format(parseISO(slot.endTime), 'HH:mm')}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Booking Modal */}
      {selectedSlot && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: '#00000080' }}>
          <div className="modal-dialog">
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
                <p><strong>Selected Time:</strong><br />
                  {format(parseISO(selectedSlot.startTime), 'PPPP p')} - {format(parseISO(selectedSlot.endTime), 'p')}
                </p>

                <div className="mb-3">
                  <label className="form-label">Appointment Type</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="appointmentType"
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
                      name="appointmentType"
                      value="follow-up"
                      onChange={(e) => setAppointmentType(e.target.value)}
                      id="follow-up"
                    />
                    <label className="form-check-label" htmlFor="follow-up">Follow-Up</label>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Message to Doctor (optional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Your message..."
                  />
                </div>
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
                  disabled={loading}
                >
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
