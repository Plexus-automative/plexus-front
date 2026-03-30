'use client';

// next
import dynamic from 'next/dynamic';

// project-imports
const DashboardDefault = dynamic(() => import('views/dashboard/DashboardDefault'), { ssr: false });

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function Dashboard() {
  return <DashboardDefault />;
}
