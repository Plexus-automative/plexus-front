'use client';

import { useEffect } from 'react';

// next
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// project-imports
import Loader from 'components/Loader';
import { useBuyNowLink } from 'hooks/getBuyNowLink';

// types
import { GuardProps } from 'types/auth';

// ==============================|| GUEST GUARD ||============================== //

export default function GuestGuard({ children }: GuardProps) {
  const { status } = useSession();
  const router = useRouter();
  const { getQueryParams } = useBuyNowLink();

  useEffect(() => {
    if (status === 'authenticated') {
      // Passer par /auth-redirect, qui aiguille selon le profil (dashboard C0082,
      // bris de glace, sinon bienvenue). Renvoyer directement sur APP_DEFAULT_PATH
      // envoyait tout le monde sur /bienvenue en rouvrant le site avec une session
      // encore valide, même les comptes qui doivent atterrir ailleurs.
      router.push(`/auth-redirect${getQueryParams}`);
    }
  }, [status, router, getQueryParams]);

  if (status === 'loading') return <Loader />;

  return <>{children}</>;
}
