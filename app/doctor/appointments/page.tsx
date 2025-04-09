import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function DoctorAppointments() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'DOCTOR') redirect('/login');

  const appointments = await prisma.appointment.findMany({
    where: { doctorId: session.user.id },
    include: { patient: true },
    orderBy: { date: 'asc' },
  });

  return (
    <div className="container">
      <h2 className="mb-4">My Appointments</h2>
      <ul className="list-group">
        {appointments.map(appt => (
          <li key={appt.id} className="list-group-item">
            <strong>{new Date(appt.date).toLocaleString()}</strong><br />
            Patient: {appt.patient.firstName} {appt.patient.lastName}<br />
            Type: {appt.type} | Status: {appt.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
