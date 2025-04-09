"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function Home() {
    const router = useRouter();
    useEffect(() => {
        // Redirect to the elements example page
        router.push('/elements-example');
    }, [router]);
    return (<div className="min-h-screen flex items-center justify-center">
      <p className="text-xl font-calibre">Redirecting to UI elements...</p>
    </div>);
}
//# sourceMappingURL=page.jsx.map