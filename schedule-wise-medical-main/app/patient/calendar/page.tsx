'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';
import PageHeader from '@/components/layout/PageHeader';
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
        // Fetch all patient appointments
        const res = await fetch('/api/appointments/me');
        if (!res.ok) throw new Error('Failed to fetch appointments');
        const data: any[] = await res.json();

        // Only include appointments with a valid slot
        const formattedEvents: EventInput[] = data
          .filter(app => app.slot !== null)
          .map(app => ({
            id: app.id,
            title: 'Medical Appointment',
            start: app.slot.startTime,
            end: app.slot.endTime,
            backgroundColor: '#3b82f6',
            borderColor: '#2563eb',
            textColor: '#ffffff',
            display: 'block',
            extendedProps: {
              doctorName: `Dr. ${app.slot.doctor.firstName} ${app.slot.doctor.lastName}`
            }
          }));

        setEvents(formattedEvents);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointments:', err);
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
      <div className="calendar-container shadow rounded bg-white">
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
          height="auto"
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
    <div className="content-page calendar-page-container">
      <PageHeader 
        title="My Calendar" 
        subtitle="Track and manage your upcoming appointments"
        size="large"
      />
      <div className="calendar-scrollable-area">
        {renderContent()}
      </div>
    </div>
  );
} 