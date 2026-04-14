'use client';

import { useEffect } from 'react';

// next
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// project-imports
import Loader from 'components/Loader';
import { useBuyNowLink } from 'hooks/getBuyNowLink';
import { APP_DEFAULT_PATH } from 'config';

// types
import { GuardProps } from 'types/auth';

// ==============================|| GUEST GUARD ||============================== //

export default function GuestGuard({ children }: GuardProps) {
  const { status } = useSession();
  const router = useRouter();
  const { getQueryParams } = useBuyNowLink();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(`${APP_DEFAULT_PATH}${getQueryParams}`);
    }
  }, [status, router, getQueryParams]);

  if (status === 'loading') return <Loader />;

  return <>{children}</>;
}
