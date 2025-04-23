'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import Card from '@/components/ui/Card';
import { useState, useEffect } from 'react';

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
  'Ophthalmologist': { bg: 'var(--primary-50)', text: 'var(--primary-600)' },
  'General Practitioner (GP)': { bg: 'var(--secondary-50)', text: 'var(--secondary-600)' },
  'Hepatologist': { bg: 'var(--accent-50)', text: 'var(--accent-600)' },
  'Rheumatologist': { bg: 'var(--primary-100)', text: 'var(--primary-700)' },
  'default': { bg: 'var(--neutral-100)', text: 'var(--neutral-600)' }
};

export default function RecentlyViewedDoctors() {
  const { recentDoctors, clearRecentDoctors } = useRecentlyViewed();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  
  if (recentDoctors.length === 0) {
    return null;
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getSpecialtyColors = (specialty: string) => {
    return specialtyColors[specialty] || specialtyColors.default;
  };

  const headerAction = recentDoctors.length > 0 ? (
    <button 
      onClick={clearRecentDoctors}
      className="btn btn-sm btn-outline-secondary"
    >
      Clear
    </button>
  ) : null;

  return (
    <Card
      title="Recently Viewed"
      subtitle="Doctor Profiles"
      headerAction={headerAction}
    >
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
    </Card>
  );
} 