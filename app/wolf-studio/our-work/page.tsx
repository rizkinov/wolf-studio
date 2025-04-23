'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { navigateToOurWork } from '@/lib/navigation';

export default function OurWorkPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the Our Work section on the landing page
    router.push(navigateToOurWork());
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-xl">Redirecting to Our Work...</p>
    </div>
  );
} 