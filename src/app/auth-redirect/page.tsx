'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

export default function AuthRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const user = session?.user as any;
    const customerNo = user?.customerNo;

    // Bris de glace glass-users land directly on the dossier creation page
    if (user?.isBriseDeGlace) {
      router.push('/pages/bris-de-glace/creation');
      return;
    }

    // C0082 goes to dashboard, everyone else to bienvenue
    if (customerNo === 'C0082') {
      router.push('/dashboard/default');
    } else {
      router.push('/bienvenue');
    }
  }, [session, status, router]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}
