'use client';

// next
import dynamic from 'next/dynamic';

// project-imports
const ActivityJournal = dynamic(() => import('views/dashboard/ActivityJournal'), { ssr: false });

// ==============================|| PAGES - JOURNAL D'ACTIVITÉ ||============================== //

export default function JournalActivitePage() {
  return <ActivityJournal />;
}
