'use client';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  initials: string;
  color: string;
}

export default function RecentlyViewed() {
  const doctors: Doctor[] = [
    {
      id: '1',
      firstName: 'Ayman',
      lastName: 'Kousarani',
      specialty: 'General Medicine',
      initials: 'AK',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      id: '2',
      firstName: 'Maryam',
      lastName: 'Brazer',
      specialty: 'General Practitioner',
      initials: 'MC',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: '3',
      firstName: 'Demi',
      lastName: 'Joan',
      specialty: 'Nephrologist',
      initials: 'DJ',
      color: 'bg-cyan-100 text-cyan-600'
    },
    {
      id: '4',
      firstName: 'Susan',
      lastName: 'Myers',
      specialty: 'Neurologist',
      initials: 'SM',
      color: 'bg-rose-100 text-rose-600'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Recent Viewed</h2>
      <h3 className="text-sm text-gray-600 mb-4">Doctor Profiles</h3>
      
      <div className="space-y-4">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${doctor.color} flex items-center justify-center font-medium`}>
                {doctor.initials}
              </div>
              <div>
                <div className="text-sm font-medium">Dr {doctor.firstName} {doctor.lastName}</div>
                <div className="text-xs text-gray-500">{doctor.specialty}</div>
              </div>
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-sm text-blue-600 hover:text-blue-700">
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 