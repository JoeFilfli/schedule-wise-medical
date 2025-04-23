'use client';

import { useState, useEffect } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { format } from 'date-fns';
import Card from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  doctorProfile: {
    specialty: string;
  } | null;
}

interface Appointment {
  id: string;
  createdAt: string;
  doctor: Doctor;
  scheduledStart: string;
  scheduledEnd: string;
}

export default function UpcomingAppointments() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/appointments/upcoming');
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id })
      });
      if (!res.ok) throw new Error('Cancel failed');
      await fetchAppointments();
      setCurrentIndex(0);
    } catch (err) {
      console.error(err);
      alert('Failed to cancel appointment');
    }
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : appointments.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < appointments.length - 1 ? prev + 1 : 0));
  };

  if (!mounted) return null;

  const renderActions = (
    <div className="d-flex gap-2">
      <button 
        onClick={handlePrevious}
        className="btn btn-light rounded-circle p-1"
        style={{ width: '32px', height: '32px' }}
        disabled={appointments.length <= 1}
      >
        <IconChevronLeft size={20} stroke={1.5} />
      </button>
      <button 
        onClick={handleNext}
        className="btn btn-light rounded-circle p-1"
        style={{ width: '32px', height: '32px' }}
        disabled={appointments.length <= 1}
      >
        <IconChevronRight size={20} stroke={1.5} />
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <Card 
        title="Upcoming Appointments"
        headerAction={renderActions}
      >
        <div className="text-center py-4">Loading...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card 
        title="Upcoming Appointments"
        headerAction={renderActions}
      >
        <div className="text-center py-4 text-danger">{error}</div>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card 
        title="Upcoming Appointments"
        headerAction={renderActions}
      >
        <div className="text-center py-4 text-muted">No upcoming appointments</div>
      </Card>
    );
  }

  return (
    <Card 
      title="Upcoming Appointments"
      headerAction={renderActions}
    >
      <div className="d-flex gap-3 overflow-hidden">
        {appointments.map((appointment, index) => {
          const dateString = appointment.scheduledStart;
          const date = new Date(dateString);
          const dayName = format(date, 'EEE');
          const dayNumber = format(date, 'd');
          
          return (
            <div 
              key={appointment.id}
              className="flex-grow-1"
              style={{
                transform: `translateX(${-100 * currentIndex}%)`,
                transition: 'transform 0.3s ease-in-out',
                minWidth: '100%'
              }}
            >
              <div className="d-flex align-items-center gap-4 p-3 rounded-4 border">
                <div 
                  className="text-center p-3 rounded-4"
                  style={{
                    backgroundColor: index === 0 ? 'var(--primary-50)' : 'var(--accent-50)',
                    minWidth: '80px'
                  }}
                >
                  <div 
                    className="mb-1"
                    style={{
                      color: index === 0 ? 'var(--primary)' : 'var(--accent)',
                      fontSize: '14px'
                    }}
                  >
                    {dayName}
                  </div>
                  <div 
                    className="fw-bold"
                    style={{
                      color: index === 0 ? 'var(--primary)' : 'var(--accent)',
                      fontSize: '24px',
                      lineHeight: 1
                    }}
                  >
                    {dayNumber}
                  </div>
                </div>

                <div>
                  <h6 className="mb-1 fw-semibold">
                    Dr {appointment.doctor.firstName} {appointment.doctor.lastName}
                  </h6>
                  <div className="text-muted mb-2" style={{ fontSize: '14px' }}>
                    {appointment.doctor.doctorProfile?.specialty || 'General'}
                  </div>
                  <div 
                    className="px-2 py-1 rounded-2 d-inline-block"
                    style={{
                      backgroundColor: index === 0 ? 'var(--primary)' : 'var(--accent)',
                      color: 'white',
                      fontSize: '12px'
                    }}
                  >
                    {format(new Date(appointment.scheduledStart), 'h:mm a')}
                  </div>
                </div>

                {index === currentIndex && (
                  <div className="d-flex gap-2 mt-2">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => router.push(`/patient/doctors/${appointment.doctor.id}?reschedule=${appointment.id}`)}
                      aria-label={`Reschedule appointment on ${format(date, 'PPpp')}`}
                    >
                      Reschedule
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => handleCancel(appointment.id)}
                      aria-label={`Cancel appointment on ${format(date, 'PPpp')}`}
                    >
                      Cancel
                    </button>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
} 