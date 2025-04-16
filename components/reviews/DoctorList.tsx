'use client';

import { useEffect, useState } from 'react';
import { IconStarFilled } from '@tabler/icons-react';
import { Avatar } from '@/components/ui/Avatar';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  doctorProfile: {
    specialty: string;
    averageRating: number;
  } | null;
  profilePicture: string | null;
}

interface DoctorListProps {
  selectedDoctorId: string | null;
  onDoctorSelect: (doctorId: string) => void;
}

export function DoctorList({ selectedDoctorId, onDoctorSelect }: DoctorListProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctors');
        if (!response.ok) throw new Error('Failed to fetch doctors');
        const data = await response.json();
        setDoctors(data);
      } catch (err) {
        setError('Failed to load doctors');
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading doctors...</div>;
  }

  if (error) {
    return <div className="text-danger p-4">{error}</div>;
  }

  if (doctors.length === 0) {
    return <div className="text-muted p-4">No doctors found</div>;
  }

  return (
    <div className="space-y-2">
      {doctors.map((doctor) => (
        <button
          key={doctor.id}
          className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
            selectedDoctorId === doctor.id 
              ? 'bg-blue-50 border border-blue-200' 
              : 'hover:bg-gray-50 border border-transparent'
          }`}
          onClick={() => onDoctorSelect(doctor.id)}
        >
          <div className="flex items-center gap-4">
            <Avatar
              src={doctor.profilePicture}
              alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
              size={40}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h6 className="font-medium text-gray-900 text-base truncate">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h6>
                {doctor.doctorProfile?.averageRating && doctor.doctorProfile.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <IconStarFilled size={16} className="text-yellow-400" />
                    <span className="text-gray-600 text-sm font-medium">
                      {doctor.doctorProfile.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-500 text-sm truncate">
                {doctor.doctorProfile?.specialty || 'General Practice'}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
} 