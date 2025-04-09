import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function BookAppointmentPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PATIENT') redirect('/login');

  const doctors = await prisma.user.findMany({
    where: { role: 'DOCTOR' },
    select: { id: true, firstName: true, lastName: true, doctorProfile: true },
  });

  return (
    <div className="container">
      <h2 className="mb-4">Book Appointment</h2>
      <form action="/api/appointments/book" method="POST" className="card card-body">
        <div className="mb-3">
          <label>Doctor</label>
          <select name="doctorId" className="form-select" required>
            {doctors.map(doc => (
              <option key={doc.id} value={doc.id}>
                Dr. {doc.firstName} {doc.lastName} – {doc.doctorProfile?.specialty || 'General'}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label>Date & Time</label>
          <input name="date" type="datetime-local" className="form-control" required />
        </div>
        <div className="mb-3">
          <label>Type</label>
          <select name="type" className="form-select">
            <option value="IN_PERSON">In Person</option>
            <option value="TELECONSULT">Teleconsult</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary w-100">Book</button>
      </form>
    </div>
  );
}
