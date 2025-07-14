"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the wolf studio page
    router.push('/wolf-studio');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl font-calibre">Redirecting to WOLF Studio...</p>
    </div>
  );
}
