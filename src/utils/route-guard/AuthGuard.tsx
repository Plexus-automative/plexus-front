'use client';

import { useEffect } from 'react';

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') return <Loader />;

  return <>{children}</>;
}
