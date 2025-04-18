import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ThemeProvider from './theme-provider';
import SessionWrapper from '@/components/auth/SessionWrapper';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SmartMed Scheduler',
  description: 'Responsive hospital management platform',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  const isDashboardRoute = session && ['DOCTOR', 'PATIENT'].includes(session.user.role);

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionWrapper>
          <ThemeProvider>
            {isDashboardRoute ? (
              <SidebarLayout>{children}</SidebarLayout>
            ) : (
              <main className="container mt-4">{children}</main>
            )}
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
