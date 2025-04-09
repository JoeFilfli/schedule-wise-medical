import SidebarLayout from '@/components/layout/SidebarLayout';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
