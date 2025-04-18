'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { IconLayoutDashboard, IconCalendar, IconUsers, IconHistory, IconCreditCard, IconMessage, IconStar, IconUser, IconSettings } from '@tabler/icons-react';

const navs = {
  DOCTOR: [
    { href: '/doctor/dashboard', icon: IconLayoutDashboard, label: 'Dashboard' },
    { href: '/doctor/calendar', icon: IconCalendar, label: 'Calendar' },
    { href: '/doctor/patients', icon: IconUsers, label: 'Patients' },
    { href: '/doctor/reviews', icon: IconStar, label: 'Reviews' },
    { href: '/doctor/profile', icon: IconUser, label: 'Profile' },
    { href: '/doctor/settings', icon: IconSettings, label: 'Settings' },
  ],
  PATIENT: [
    { href: '/patient/dashboard', icon: IconLayoutDashboard, label: 'Dashboard' },
    { href: '/patient/calendar', icon: IconCalendar, label: 'Calendar' },
    { href: '/patient/doctors', icon: IconUsers, label: 'Doctors' },
    { href: '/patient/appointments', icon: IconCalendar, label: 'Appointments' },
    { href: '/patient/history', icon: IconHistory, label: 'History' },
    { href: '/patient/payments', icon: IconCreditCard, label: 'Payments' },
    { href: '/patient/chat', icon: IconMessage, label: 'Chat' },
    { href: '/patient/reviews', icon: IconStar, label: 'Reviews' },
    { href: '/patient/profile', icon: IconUser, label: 'Profile' },
    { href: '/patient/settings', icon: IconSettings, label: 'Settings' },
  ],
};

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role as keyof typeof navs;

  const links = useMemo(() => (role ? navs[role] : []), [role]);

  if (status === 'loading') return null;

  return (
    <div className="d-flex" style={{ backgroundColor: '#FFFFFF', height: '100vh', overflow: 'hidden', padding: '10px' }}>
      <div 
        className="position-fixed top-0 start-0 h-100 d-flex flex-column align-items-center justify-content-center gap-2"
        style={{ 
          width: '64px',
          backgroundColor: '#007FFF',
          zIndex: 1000,
          padding: '4px'
        }}
      >
        {links.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <div key={item.href} className="position-relative" style={{ width: '100%', height: '36px' }}>
              {isActive && (
                <>
                  <div
                    className="position-absolute"
                    style={{
                      width: '3px',
                      height: '32px',
                      backgroundColor: '#ffffff',
                      left: 0,
                      borderTopRightRadius: '3px',
                      borderBottomRightRadius: '3px'
                    }}
                  />
                  <div
                    className="position-absolute"
                    style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: '#00647A',
                      borderRadius: '8px',
                      left: 'calc(50% - 18px)',
                      top: '0px',
                      zIndex: 0
                    }}
                  />
                </>
              )}
              <Link
                href={item.href}
                className="d-flex justify-content-center align-items-center"
                style={{
                  textDecoration: 'none',
                  height: '36px',
                  position: 'relative',
                  zIndex: 1
                }}
                title={item.label}
              >
                <div 
                  className="d-flex justify-content-center align-items-center"
                  style={{ 
                    width: '32px',
                    height: '32px'
                  }}
                >
                  <Icon
                    style={{
                      width: '20px',
                      height: '20px',
                      color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                      transition: 'color 0.2s ease'
                    }}
                    stroke={1.5}
                  />
                </div>
              </Link>
            </div>
          );
        })}
      </div>
      <div 
        style={{ 
          position: 'fixed',
          top: '16px',
          left: '16px',
          right: '16px',
          bottom: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          zIndex: 1,
          overflow: 'hidden'
        }}
      />
      <main 
        style={{ 
          position: 'relative',
          width: '100%',
          marginLeft: '48px',
          padding: '8px',
          zIndex: 2,
          height: 'calc(100vh - 32px)',
          overflow: 'auto'
        }}
      >
        {children}
      </main>
    </div>
  );
}


const azure = '#007FFF';
const azureDark = '#005BBB';
