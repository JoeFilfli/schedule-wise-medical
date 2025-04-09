'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

const navs = {
  DOCTOR: [
    { href: '/doctor/dashboard', label: 'Dashboard' },
    { href: '/doctor/calendar', label: 'Calendar' },
    { href: '/doctor/patients', label: 'Patients' },
    { href: '/doctor/profile', label: 'Profile' },
    { href: '/doctor/reviews', label: 'Reviews' },
    { href: '/doctor/settings', label: 'Settings' },
  ],
  PATIENT: [
    { href: '/patient/dashboard', label: 'Dashboard' },
    { href: '/patient/doctors', label: 'Doctors' },
    { href: '/patient/appointments', label: 'Appointments' },
    { href: '/patient/history', label: 'History' },
    { href: '/patient/payments', label: 'Payments' },
    { href: '/patient/chat', label: 'Chat' },
    { href: '/patient/reviews', label: 'Reviews' },
    { href: '/patient/profile', label: 'Profile' },
    { href: '/patient/settings', label: 'Settings' },
  ],
};

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role as keyof typeof navs;

  const links = useMemo(() => (role ? navs[role] : []), [role]);

  if (status === 'loading') return null;

  return (
    <div className="d-flex">
      <aside
        className="bg-light border-end p-3"
        style={{
          width: '230px',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          overflowY: 'auto',
        }}
      >
        <h5 className="mb-4">{role}</h5>
        <ul className="nav flex-column">
          {links.map(link => (
            <li className="nav-item mb-2" key={link.href}>
              <Link
                href={link.href}
                className={`nav-link ${
                  pathname === link.href ? 'active text-primary fw-bold' : 'text-dark'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <main
        className="flex-grow-1"
        style={{
          marginLeft: '100px', 
          padding: '2rem',
          minHeight: '100vh',
        }}
      >
        {children}
      </main>
    </div>
  );
}
