'use client';

import { useState, useEffect } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { format } from 'date-fns';

interface Doctor {
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/appointments/upcoming');
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const data = await response.json();
        console.log('Fetched appointments:', data); // For debugging
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to load appointments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : appointments.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < appointments.length - 1 ? prev + 1 : 0));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-4 p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0 fw-bold">Upcoming Appointments</h5>
        </div>
        <div className="text-center py-4">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-4 p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0 fw-bold">Upcoming Appointments</h5>
        </div>
        <div className="text-center py-4 text-danger">{error}</div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-4 p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0 fw-bold">Upcoming Appointments</h5>
        </div>
        <div className="text-center py-4 text-muted">No upcoming appointments</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-4 p-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0 fw-bold">Upcoming Appointments</h5>
        <div className="d-flex gap-2">
          <button 
            onClick={handlePrevious}
            className="btn btn-light rounded-circle p-1"
            style={{ width: '32px', height: '32px' }}
          >
            <IconChevronLeft size={20} stroke={1.5} />
          </button>
          <button 
            onClick={handleNext}
            className="btn btn-light rounded-circle p-1"
            style={{ width: '32px', height: '32px' }}
          >
            <IconChevronRight size={20} stroke={1.5} />
          </button>
        </div>
      </div>

      <div className="d-flex gap-3 overflow-hidden">
        {appointments.map((appointment, index) => {
          // Try to get the appointment date from various possible fields
          const dateString = appointment.scheduledStart;
          const date = new Date(dateString);
          const dayName = format(date, 'EEE');
          const dayNumber = format(date, 'd');
          const time = format(date, 'h:mm a');
          
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
                    backgroundColor: index === 0 ? '#EEF3FF' : '#E6FFE6',
                    minWidth: '80px'
                  }}
                >
                  <div 
                    className="mb-1"
                    style={{
                      color: index === 0 ? '#2563EB' : '#22C55E',
                      fontSize: '14px'
                    }}
                  >
                    {dayName}
                  </div>
                  <div 
                    className="fw-bold"
                    style={{
                      color: index === 0 ? '#2563EB' : '#22C55E',
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
                      backgroundColor: index === 0 ? '#2563EB' : '#22C55E',
                      color: 'white',
                      fontSize: '12px'
                    }}
                  >
                    {format(new Date(appointment.scheduledStart), 'h:mm a')}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 