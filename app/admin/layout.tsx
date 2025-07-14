import { AuthProvider } from '@/lib/auth/context'
import { CBREToaster } from '@/components/cbre-toast'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {children}
      <CBREToaster />
    </AuthProvider>
  )
} 