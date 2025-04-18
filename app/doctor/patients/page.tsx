'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  status: string;
  reason?: string;
  notes?: string;
  type?: string;
  priceDue: number;
  paidAmount?: number;
  paidAt?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
}

interface PatientGroup {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  appointments: Appointment[];
}

export default function DoctorAppointmentsPage() {
  const [data, setData] = useState<PatientGroup[]>([]);
  const [filtered, setFiltered] = useState<PatientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<PatientGroup | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData(search = '') {
    const res = await fetch(`/api/doctor/appointments?search=${search}`);
    const json = await res.json();
    setData(json);
    setFiltered(json);
    setLoading(false);
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    fetchData(val);
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">🩺 Doctor Appointments</h2>

      <div className="mb-4">
        <input
          className="form-control"
          type="text"
          placeholder="Search by patient name..."
          value={query}
          onChange={handleSearch}
        />
      </div>

      {loading && <p>Loading...</p>}
      {!loading && filtered.length === 0 && <p>No appointments found.</p>}

      {filtered.map(({ patient }) => (
        <div
          key={patient.id}
          className="border-bottom pb-3 mb-3"
          style={{ cursor: 'pointer' }}
          onClick={() =>
            setSelected(data.find((d) => d.patient.id === patient.id) || null)
          }
        >
          <h5>
            👤 {patient.firstName} {patient.lastName}{' '}
            <small className="text-muted">({patient.email})</small>
          </h5>
        </div>
      ))}

      {/* Modal */}
      {selected && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: '#00000080' }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Appointments for {selected.patient.firstName}{' '}
                  {selected.patient.lastName}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setSelected(null)}
                />
              </div>
              <div className="modal-body">
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Reason</th>
                      <th>Notes</th>
                      <th>Price</th>
                      <th>Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.appointments.map((appt) => (
                      <tr key={appt.id}>
                        <td>{appt.status}</td>
                        <td>
                          {appt.scheduledStart
                            ? format(new Date(appt.scheduledStart), 'PPpp')
                            : '-'}
                        </td>
                        <td>{appt.type || '-'}</td>
                        <td>{appt.reason || '-'}</td>
                        <td>{appt.notes || '-'}</td>
                        <td>${appt.priceDue.toFixed(2)}</td>
                        <td>
                          {appt.status === 'COMPLETED' ? (
                            appt.paidAt ? (
                              <span className="text-success">✅</span>
                            ) : (
                              <span className="text-danger">❌</span>
                            )
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
