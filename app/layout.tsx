import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import ThemeProvider from './theme-provider';
import SessionWrapper from '@/components/auth/SessionWrapper';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { RecentlyViewedProvider } from '@/context/RecentlyViewedContext';

// Load fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Smart Medical Scheduler',
  description: 'Professional healthcare appointment management system',
  keywords: 'medical, healthcare, appointments, scheduling, doctor, patient',
  authors: [{ name: 'Smart Medical Scheduler Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const isDashboardRoute = session && ['DOCTOR', 'PATIENT'].includes(session.user.role);

  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body id="app-body" className={inter.className} style={{ height: '100%', overflow: 'hidden' }}>
        <SessionWrapper>
          <ThemeProvider>
            <RecentlyViewedProvider>
              {isDashboardRoute ? (
                <SidebarLayout key="sidebar-layout">{children}</SidebarLayout>
              ) : (
                <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
                  <main className="flex-grow-1 container-fluid px-4 py-3 overflow-auto">{children}</main>
                  <footer className="py-3 mt-auto border-top bg-light text-center">
                    <div className="container">
                      <small className="text-muted">
                        &copy; {new Date().getFullYear()} Smart Medical Scheduler. All rights reserved.
                      </small>
                    </div>
                  </footer>
                </div>
              )}
            </RecentlyViewedProvider>
          </ThemeProvider>
        </SessionWrapper>
        
        {/* Add a script to prevent duplicate rendering */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Clean up duplicate sidebars
              const sidebars = document.querySelectorAll('[data-sidebar-id="main-sidebar"]');
              if (sidebars.length > 1) {
                for (let i = 1; i < sidebars.length; i++) {
                  sidebars[i].remove();
                }
              }
              
              // Clean up duplicate headers
              const headers = document.querySelectorAll('[data-header-id="main-header"]');
              if (headers.length > 1) {
                for (let i = 1; i < headers.length; i++) {
                  headers[i].remove();
                }
              }
              
              // Clean up duplicate Medical Scheduler text nodes
              const h5Elements = document.querySelectorAll('h5.mb-0.fw-bold');
              for (let i = 0; i < h5Elements.length; i++) {
                if (h5Elements[i].textContent === 'Medical Scheduler' && i > 0) {
                  const parentElement = h5Elements[i].closest('.d-flex.flex-column.h-100');
                  if (parentElement && parentElement !== document.querySelector('.d-flex.flex-column.h-100')) {
                    parentElement.remove();
                  }
                }
              }
            })();
          `
        }} />

        {/* Add a second script that runs after page load to catch any remaining duplicates */}
        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              // This fixes any duplicates that appear after hydration
              setTimeout(function() {
                // Find all Medical Scheduler headers
                const appHeaders = Array.from(document.querySelectorAll('header')).filter(
                  header => header.textContent.includes('Medical Scheduler')
                );
                
                // Keep only the first one
                if (appHeaders.length > 1) {
                  for (let i = 1; i < appHeaders.length; i++) {
                    const parent = appHeaders[i].closest('.d-flex.flex-column.h-100');
                    if (parent) {
                      parent.remove();
                    } else {
                      appHeaders[i].remove();
                    }
                  }
                }

                // Find all dashboard sections
                const welcomeSections = Array.from(document.querySelectorAll('h1.h2.mb-0')).filter(
                  h1 => h1.textContent.includes('Welcome')
                );
                
                // Keep only the first welcome section
                if (welcomeSections.length > 1) {
                  for (let i = 1; i < welcomeSections.length; i++) {
                    const parent = welcomeSections[i].closest('.container-fluid');
                    if (parent) {
                      parent.remove();
                    }
                  }
                }
              }, 100);
            });
          `
        }} />
      </body>
    </html>
  );
}
