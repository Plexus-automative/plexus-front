'use client';

// next
import dynamic from 'next/dynamic';

// project-imports
const DashboardFinance = dynamic(() => import('views/dashboard/DashboardFinance'), { ssr: false });

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function Finance() {
  return <DashboardFinance />;
}
