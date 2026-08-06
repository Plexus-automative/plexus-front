'use client';

// next
import dynamic from 'next/dynamic';

// project-imports
const DashboardAnalytics = dynamic(() => import('views/dashboard/DashboardAnalytics'), { ssr: false });

// ==============================|| DASHBOARD - ANALYTICS ||============================== //

export default function Analytics() {
  return <DashboardAnalytics />;
}
