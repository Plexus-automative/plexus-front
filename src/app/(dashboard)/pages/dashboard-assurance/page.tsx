'use client';

// next
import dynamic from 'next/dynamic';

// project-imports
const InsuranceDashboard = dynamic(() => import('views/dashboard/InsuranceDashboard'), { ssr: false });

// ==============================|| DASHBOARD - ASSURANCE ||============================== //

export default function DashboardAssurance() {
  return <InsuranceDashboard />;
}
