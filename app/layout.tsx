import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ThemeProvider from './theme-provider';
import SessionWrapper from '@/components/auth/SessionWrapper';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { RecentlyViewedProvider } from '@/context/RecentlyViewedContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hospital Web App',
  description: 'Responsive hospital management platform',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);

  const isDashboardRoute = session && ['DOCTOR', 'PATIENT'].includes(session.user.role);

  return (
    <html lang="en" style={{ height: '100%' }}>
      <body className={inter.className} style={{ height: '100%' }}>
        <SessionWrapper>
          <ThemeProvider>
            <RecentlyViewedProvider>
              {isDashboardRoute ? (
                <SidebarLayout>{children}</SidebarLayout>
              ) : (
                <main className="container mt-4" style={{ height: '100%' }}>{children}</main>
              )}
            </RecentlyViewedProvider>
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
