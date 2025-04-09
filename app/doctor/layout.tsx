import SidebarLayout from '@/components/layout/SidebarLayout';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
