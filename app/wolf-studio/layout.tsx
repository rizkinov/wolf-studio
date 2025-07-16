'use client'

import { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth/context'

export default function WolfStudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="wolf-studio-layout">
        {children}
      </div>
    </AuthProvider>
  )
} 