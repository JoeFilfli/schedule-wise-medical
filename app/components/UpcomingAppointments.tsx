import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { Appointment, DoctorProfile, User } from '@prisma/client'
import { useToast } from '@/components/ui/use-toast'

type AppointmentWithDoctor = Appointment & {
  doctor: User & {
    doctorProfile: DoctorProfile | null
  }
}

export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        setError(null)
        console.debug('Fetching upcoming appointments...')
        
        const response = await fetch('/api/appointments/upcoming')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.debug('Received appointments:', data)
        setAppointments(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch appointments'
        console.error('Error fetching appointments:', err)
        setError(errorMessage)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [toast])

  if (loading) {
    return (
      <Card>
        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
        </div>
        <CardContent>Loading...</CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
        </div>
        <CardContent className="text-destructive">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
        </div>
        <CardContent>No upcoming appointments</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <div className="px-6 py-4">
        <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
      </div>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex flex-col space-y-1 border-b pb-3 last:border-0"
            >
              <div className="font-medium">
                Dr. {appointment.doctor.doctorProfile?.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(appointment.scheduledStart!), 'PPP')}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(appointment.scheduledStart!), 'p')} - {format(new Date(appointment.scheduledEnd!), 'p')}
              </div>
              {appointment.reason && (
                <div className="text-sm">
                  Reason: {appointment.reason}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 