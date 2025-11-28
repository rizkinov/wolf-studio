'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { CBRECard } from '@/components/cbre/cbre-card'
import { CBREButton } from '@/components/cbre/cbre-button'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Trigger NextAuth sign-in flow for Azure AD
      // This will redirect the user to Microsoft's login page
      await signIn()
    } catch (err) {
      console.error(err)
      setError('Failed to initiate login')
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-lighter-grey flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-financier text-cbre-green mb-2">
            Admin Login
          </h1>
          <p className="text-dark-grey font-calibre">
            Sign in to access the Wolf Studio CMS
          </p>
        </div>

        <CBRECard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Authentication is managed via Microsoft Azure AD. Click below to sign in with your corporate account.
              </p>
            </div>


            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <CBREButton
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Redirecting...' : 'Sign In with Microsoft'}
            </CBREButton>
          </form>
        </CBRECard>

        <div className="text-center mt-4 text-sm text-dark-grey">
          <p>Wolf Studio Admin Dashboard</p>
        </div>
      </div>
    </div>
  )
} 