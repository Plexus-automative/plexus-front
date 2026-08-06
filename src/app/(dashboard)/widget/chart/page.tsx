'use client';

// next
import dynamic from 'next/dynamic';

// project-imports
const WidgetChart = dynamic(() => import('views/widget/WidgetChart'), { ssr: false });

// ==============================|| WIDGET - CHARTS ||============================== //

export default function Chart() {
  return <WidgetChart />;
}
