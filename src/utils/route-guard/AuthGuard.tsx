'use client';

import { useEffect, useRef, useState } from 'react';

// next
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// project-imports
import Loader from 'components/Loader';

// types
import { GuardProps } from 'types/auth';

// ==============================|| AUTH GUARD ||============================== //

export default function AuthGuard({ children }: GuardProps) {
  const { status } = useSession();
  const router = useRouter();
  // Track whether the session has finished its initial load (loading → authenticated/unauthenticated)
  const hasInitialized = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only act once the session has moved past the initial 'loading' state
    if (status === 'loading') return;

    // Mark that we have completed the first session check
    hasInitialized.current = true;

    if (status === 'authenticated') {
      setIsReady(true);
    } else if (status === 'unauthenticated') {
      // Small delay to prevent redirect loops on production if session flickers during slow load
      const timeout = setTimeout(() => {
        router.push('/login');
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [status, router]);

  // Show loader while session is loading OR while we haven't confirmed auth yet
  if (status === 'loading' || !isReady) return <Loader />;

  return <>{children}</>;
}
