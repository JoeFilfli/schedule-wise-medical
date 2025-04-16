'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';
import './calendar.css';

interface Appointment {
  id: string;
  title: string;
  start: string;
  end: string;
}

export default function CalendarPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [view, setView] = useState<string>('timeGridDay');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/appointments/me');
        if (!response.ok) throw new Error('Failed to fetch appointments');
        const appointmentsData = await response.json();

        const formattedEvents = appointmentsData.map((appointment: any) => ({
          id: appointment.id,
          title: 'Medical Appointment',
          start: appointment.slot.startTime,
          end: appointment.slot.endTime,
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          textColor: '#ffffff',
          display: 'block',
          extendedProps: {
            doctorName: `Dr. ${appointment.slot.doctor.lastName}`,
            specialty: appointment.slot.doctor.specialty || ''
          }
        }));
        
        setEvents(formattedEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to load calendar. Please try again later.');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleEventClick = (info: any) => {
    console.log('Event clicked:', info.event);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      );
    }

    return (
      <div className="bg-white rounded overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek,dayGridMonth'
          }}
          events={events}
          eventClick={handleEventClick}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          height="calc(100vh - 200px)"
          expandRows={true}
          stickyHeaderDates={true}
          dayMaxEvents={true}
          nowIndicator={true}
          editable={false}
          selectable={false}
          slotDuration="00:30:00"
          slotLabelInterval="01:00"
          eventDisplay={view === 'dayGridMonth' ? 'auto' : 'block'}
          views={{
            dayGridMonth: {
              eventContent: (arg) => {
                return (
                  <div 
                    className="month-view-event" 
                    title={`${arg.timeText} - ${arg.event.title}\nDoctor: ${arg.event.extendedProps.doctorName}`}
                  >
                    <div 
                      className="event-dot"
                      style={{ 
                        backgroundColor: arg.event.backgroundColor,
                        border: `1px solid ${arg.event.borderColor}`
                      }}
                    />
                    <span className="event-title">{arg.event.title}</span>
                  </div>
                );
              }
            },
            timeGridDay: {
              eventContent: (arg) => {
                return (
                  <div className="event-content">
                    <div className="fc-event-time fw-semibold">
                      {arg.timeText}
                    </div>
                    <div className="fc-event-title-container">
                      <div className="fc-event-title fw-medium">
                        {arg.event.title}
                      </div>
                      <div className="fc-event-doctor small">
                        {arg.event.extendedProps.doctorName}
                        {arg.event.extendedProps.specialty && (
                          <span className="opacity-75">
                            {' • '}{arg.event.extendedProps.specialty}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            },
            timeGridWeek: {
              eventContent: (arg) => {
                return (
                  <div className="event-content">
                    <div className="fc-event-time fw-semibold">
                      {arg.timeText}
                    </div>
                    <div className="fc-event-title-container">
                      <div className="fc-event-title fw-medium">
                        {arg.event.title}
                      </div>
                      <div className="fc-event-doctor small">
                        {arg.event.extendedProps.doctorName}
                      </div>
                    </div>
                  </div>
                );
              }
            }
          }}
          datesSet={(arg) => setView(arg.view.type)}
        />
      </div>
    );
  };

  return (
    <div className="h-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">My Calendar</h1>
      </div>
      {renderContent()}
    </div>
  );
} 