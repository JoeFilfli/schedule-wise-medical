'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string | null;
  doctorProfile?: {
    specialty: string;
  } | null;
}

const specialtyColors: { [key: string]: { bg: string, text: string } } = {
  'Ophthalmologist': { bg: '#FFE6E6', text: '#FF69B4' },
  'General Practitioner (GP)': { bg: '#E6E6FF', text: '#4169E1' },
  'Hepatologist': { bg: '#E6FFF9', text: '#20B2AA' },
  'Rheumatologist': { bg: '#FFE6F0', text: '#FF1493' },
  'default': { bg: '#E6E6E6', text: '#666666' }
};

export default function RecentlyViewedDoctors() {
  const { recentDoctors, clearRecentDoctors } = useRecentlyViewed();

  if (recentDoctors.length === 0) {
    return null;
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getSpecialtyColors = (specialty: string) => {
    return specialtyColors[specialty] || specialtyColors.default;
  };

  return (
    <div className="bg-white rounded-4 p-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h5 className="mb-1 fw-bold">Recent Viewed</h5>
          <h6 className="text-dark mb-4">Doctor Profiles</h6>
        </div>
      </div>
      
      <div className="d-flex flex-column gap-4">
        {recentDoctors.map((doctor) => {
          const initials = getInitials(doctor.firstName, doctor.lastName);
          const specialty = doctor.doctorProfile?.specialty || 'Doctor';
          const colors = getSpecialtyColors(specialty);
          
          return (
            <div
              key={doctor.id}
              className="d-flex align-items-center justify-content-between"
            >
              <div className="d-flex align-items-center gap-3">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center position-relative overflow-hidden"
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: colors.bg,
                    color: colors.text,
                    fontSize: '16px',
                    fontWeight: 500
                  }}
                >
                  {doctor.profilePicture ? (
                    <Image
                      src={doctor.profilePicture}
                      alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="48px"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <div className="fw-semibold mb-1">Dr {doctor.firstName} {doctor.lastName}</div>
                  <div style={{ color: colors.text, fontSize: '14px' }}>{specialty}</div>
                </div>
              </div>
              <Link 
                href={`/patient/doctors/${doctor.id}`}
                className="btn btn-link text-decoration-none"
                style={{ fontSize: '14px' }}
              >
                View Profile
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
} 