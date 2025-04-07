"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { CBREButton } from "@/components/cbre-button";
import { CBREStyledCard } from "@/components/cbre-styled-card";
import { CBREArrowButton } from "@/components/cbre-arrow-button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the elements example page
    router.push('/elements-example');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl font-calibre">Redirecting to UI elements...</p>
    </div>
  );
}
