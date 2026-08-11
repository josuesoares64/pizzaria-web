import { DashboardFooter } from '@/components/layout/DashboardFooter';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">{children}</div>
      <DashboardFooter />
    </div>
  );
}