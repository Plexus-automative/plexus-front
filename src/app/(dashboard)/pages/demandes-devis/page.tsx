'use client';

// next
import dynamic from 'next/dynamic';

// project-imports
const DemandesDevis = dynamic(() => import('views/apps/DemandesDevis'), { ssr: false });

// ==============================|| PAGES - DEMANDES DE DEVIS ||============================== //

export default function DemandesDevisPage() {
  return <DemandesDevis />;
}
