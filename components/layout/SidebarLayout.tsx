'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { 
  IconLayoutDashboard, 
  IconCalendar, 
  IconUsers, 
  IconHistory, 
  IconCreditCard, 
  IconMessage, 
  IconStar, 
  IconUser, 
  IconSettings,
  IconMenu2,
  IconX,
  IconBell,
  IconMoon,
  IconSun,
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-react';
import { useTheme } from '@/app/theme-provider';
import ThemeToggle from '@/components/ThemeToggle';

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
  const router = useRouter();
  const role = session?.user?.role as keyof typeof navs;
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only show content after component is mounted to prevent duplicates during SSR
  useEffect(() => {
    // Set mounted state to true
    setMounted(true);
    
    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem('sidebarOpen');
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === 'true');
    }
  }, []);

  // Save sidebar state when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebarOpen', sidebarOpen.toString());
    }
  }, [sidebarOpen, mounted]);

  const links = useMemo(() => (role ? navs[role] : []), [role]);

  if (!mounted || status === 'loading') {
    return <div className="loading-container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    router.push(href);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="d-flex flex-column h-100">
      {/* Header */}
      <header data-header-id="main-header" className="border-bottom sticky-top shadow-sm bg-white">
        <div className="d-flex justify-content-between align-items-center px-3 py-2">
          {/* Mobile menu toggle */}
          <button 
            className="btn btn-sm d-md-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
          </button>

          {/* Logo - visible on all screens */}
          <div className="d-flex align-items-center">
            <div className="me-2">
              <div style={{ 
                width: '32px', 
                height: '32px', 
                backgroundColor: 'var(--primary)', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontFamily: 'var(--font-heading)',
                fontWeight: 'bold'
              }}>
                MS
              </div>
            </div>
            <h5 className="mb-0 fw-bold d-none d-md-block" style={{ fontFamily: 'var(--font-heading)' }}>
              Medical Scheduler
            </h5>
          </div>

          {/* Right side controls */}
          <div className="d-flex align-items-center gap-3">
            <ThemeToggle />
            <button className="btn btn-outline-secondary btn-sm rounded-circle position-relative">
              <IconBell size={18} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
                <span className="visually-hidden">unread notifications</span>
              </span>
            </button>
            <div className="d-flex align-items-center">
              <div className="rounded-circle overflow-hidden" style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary-100)' }}>
                {session?.user ? (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white" style={{ backgroundColor: 'var(--primary)' }}>
                    {session.user.firstName?.charAt(0) || ''}
                  </div>
                ) : (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                    <IconUser size={20} />
                  </div>
                )}
              </div>
              <span className="ms-2 d-none d-md-block">
                {session?.user ? `${session.user.firstName} ${session.user.lastName}` : ''}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="d-flex flex-grow-1 position-relative">
        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div 
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none" 
            style={{ zIndex: 1040 }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          data-sidebar-id="main-sidebar" 
          className={`bg-white border-end p-0 shadow-sm ${mobileMenuOpen ? 'd-block' : 'd-none'} d-md-block`}
          style={{ 
            width: sidebarOpen ? '240px' : '64px',
            transition: 'width 0.3s ease',
            zIndex: 1041,
            position: 'fixed',
            top: '56px',
            bottom: 0,
            overflow: 'auto'
          }}
        >
          <div className="p-2">
            {/* Sidebar toggle button */}
            <button
              className="btn btn-sm btn-outline-secondary d-none d-md-flex justify-content-center align-items-center mb-3 w-100"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <>
                  <IconChevronLeft size={16} className="me-2" />
                  <span>Collapse</span>
                </>
              ) : (
                <IconChevronRight size={16} />
              )}
            </button>
            
            <ul className="nav flex-column gap-1 mt-2">
              {links.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href} className="nav-item">
                    <a
                      href={item.href}
                      onClick={(e) => handleLinkClick(e, item.href)}
                      className={`nav-link d-flex align-items-center rounded-3 px-3 py-2 ${
                        isActive 
                          ? 'bg-primary text-white' 
                          : 'text-muted hover-text-primary'
                      }`}
                      style={{
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Icon
                        size={20}
                        stroke={1.5}
                        className="me-3"
                      />
                      <span className={sidebarOpen ? 'd-inline' : 'd-none'}>
                        {item.label}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main 
          className="flex-grow-1 p-3 overflow-auto fade-in"
          style={{ 
            marginLeft: sidebarOpen ? '240px' : '64px',
            transition: 'margin-left 0.3s ease',
            marginTop: '56px',
            height: 'calc(100vh - 56px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative'
          }}
        >
          <div className="container-fluid">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


const azure = '#007FFF';
const azureDark = '#005BBB';
