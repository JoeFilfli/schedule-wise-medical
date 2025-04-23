'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string | null;
  doctorProfile?: {
    specialty: string | null;
  } | null;
}

interface RecentlyViewedContextType {
  recentDoctors: Doctor[];
  addDoctor: (doctor: Doctor) => void;
  clearRecentDoctors: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | null>(null);

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [recentDoctors, setRecentDoctors] = useState<Doctor[]>([]);

  // Load from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('recentlyViewedDoctors');
    if (stored) {
      setRecentDoctors(JSON.parse(stored));
    }
  }, []);

  const addDoctor = (doctor: Doctor) => {
    setRecentDoctors(prev => {
      // Remove if doctor already exists
      const filtered = prev.filter(d => d.id !== doctor.id);
      // Add to beginning of array, limit to 5 items
      const updated = [doctor, ...filtered].slice(0, 5);
      // Save to sessionStorage
      sessionStorage.setItem('recentlyViewedDoctors', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentDoctors = () => {
    setRecentDoctors([]);
    sessionStorage.removeItem('recentlyViewedDoctors');
  };

  return (
    <RecentlyViewedContext.Provider value={{ recentDoctors, addDoctor, clearRecentDoctors }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
} 