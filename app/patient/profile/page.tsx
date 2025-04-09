import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PatientProfile() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PATIENT') redirect('/login');

  return (
    <div>
      <h1>My Profile</h1>
      <div className="card p-4 mt-3 shadow-sm">
        <div className="row mb-3">
          <div className="col-sm-4 fw-bold">First Name:</div>
          <div className="col-sm-8">{session.user.firstName}</div>
        </div>

        <div className="row mb-3">
          <div className="col-sm-4 fw-bold">Last Name:</div>
          <div className="col-sm-8">{session.user.lastName}</div>
        </div>

        <div className="row mb-3">
          <div className="col-sm-4 fw-bold">Email:</div>
          <div className="col-sm-8">{session.user.email}</div>
        </div>

        <div className="row mb-3">
          <div className="col-sm-4 fw-bold">Role:</div>
          <div className="col-sm-8">{session.user.role}</div>
        </div>
      </div>
    </div>
  );
}
