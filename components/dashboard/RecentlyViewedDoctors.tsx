'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  doctorProfile?: {
    specialty: string | null;
  } | null;
}

export default function RecentlyViewedDoctors() {
  const { recentDoctors, clearRecentDoctors } = useRecentlyViewed();

  if (recentDoctors.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3 p-3 shadow-sm" style={{ maxWidth: '400px' }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h5 className="mb-0 fw-semibold small">Recently Viewed</h5>
        </div>
        <button 
          onClick={clearRecentDoctors}
          className="btn btn-sm btn-outline-secondary py-0 px-2"
          style={{ fontSize: '0.75rem' }}
        >
          Clear
        </button>
      </div>
      
      <div className="d-flex flex-wrap gap-2">
        {recentDoctors.map((doctor) => (
          <Link 
            key={doctor.id}
            href={`/patient/doctors/${doctor.id}`}
            className="text-decoration-none"
          >
            <div className="d-flex align-items-center gap-2 p-1 rounded-2 hover-bg-light transition-all">
              <div className="position-relative" style={{ width: '32px', height: '32px' }}>
                {doctor.profilePicture ? (
                  <Image
                    src={doctor.profilePicture}
                    alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                    fill
                    className="rounded-circle border"
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                ) : (
                  <div 
                    className="rounded-circle border d-flex align-items-center justify-content-center bg-light"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <div className="text-dark" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Dr. {doctor.firstName} {doctor.lastName}
                </div>
                {doctor.doctorProfile?.specialty && (
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {doctor.doctorProfile.specialty}
                  </small>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 