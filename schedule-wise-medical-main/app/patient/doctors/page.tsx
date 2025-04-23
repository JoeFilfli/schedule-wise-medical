'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PageHeader from '@/components/layout/PageHeader';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  doctorProfile: {
    specialty: string | null;
    bio: string | null;
  } | null;
}

export default function DoctorSearchPage() {
  const [query, setQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function fetchDoctors() {
    const res = await fetch(`/api/doctors?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setDoctors(data);
  }

  return (
    <div className="content-page">
      <PageHeader 
        title="Find a Doctor" 
        subtitle="Browse specialists and schedule appointments"
        size="large"
      />
      
      <div className="page-content">
        <div className="input-group mb-4">
          <input
            className="form-control"
            placeholder="Search by name or specialty..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-primary" onClick={fetchDoctors}>
            Search
          </button>
        </div>

        <ul className="list-group">
          {doctors.map((doc) => (
            <li
              key={doc.id}
              className="list-group-item d-flex align-items-center justify-content-between gap-3"
            >
              <div className="d-flex align-items-center gap-3">
                <Image
                  src={doc.profilePicture || '/default-avatar.png'}
                  alt="Doctor"
                  width={60}
                  height={60}
                  className="rounded-circle border"
                  style={{ objectFit: 'cover' }}
                />
                <div>
                  <button
                    className="btn btn-link p-0 text-start text-decoration-none"
                    onClick={() => setSelectedDoctor(doc)}
                    style={{ fontSize: '1.1rem', fontWeight: 600 }}
                  >
                    {doc.firstName} {doc.lastName}
                  </button>
                  <div className="text-muted small">
                    {doc.doctorProfile?.specialty}
                  </div>
                </div>
              </div>
              <Link
                href={`/patient/doctors/${doc.id}`}
                className="btn btn-outline-primary btn-sm"
              >
                View Slots
              </Link>
            </li>
          ))}
        </ul>

        {/* Modal */}
        {selectedDoctor && (
          <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: '#00000080' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedDoctor(null)}
                  />
                </div>
                <div className="modal-body text-start">
                <div className="text-center mb-3">
                  <Image
                    src={selectedDoctor.profilePicture || '/default-avatar.png'}
                    alt="Profile"
                    width={120}
                    height={120}
                    className="rounded-circle border shadow"
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                <div className="mb-2">
                  <strong>First name:</strong><br />
                  <span>{selectedDoctor.firstName}</span>
                </div>

                <div className="mb-2">
                  <strong>Last name:</strong><br />
                  <span>{selectedDoctor.lastName}</span>
                </div>
                <div className="mb-2">
                  <strong>Specialty:</strong><br />
                  <span className="text-muted">{selectedDoctor.doctorProfile?.specialty || 'No specialty provided'}</span>
                </div>

                <div>
                  <strong>Bio:</strong><br />
                  <span>{selectedDoctor.doctorProfile?.bio || 'No bio available.'}</span>
                </div>
                </div>

                <div className="modal-footer">
                  <Link
                    href={`/patient/doctors/${selectedDoctor.id}`}
                    className="btn btn-primary"
                  >
                    View Slots
                  </Link>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedDoctor(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
