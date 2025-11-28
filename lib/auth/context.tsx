'use client'

import { createContext, useContext } from 'react'
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'
import { SessionProvider } from 'next-auth/react'

// Re-export SessionProvider for wrapping the app
export { SessionProvider }

interface AuthContextType {
  user: any | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const loading = status === 'loading'
  const user = session?.user || null

  const signIn = async () => {
    await nextAuthSignIn('azure-ad')
  }

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/' })
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // If used outside AuthProvider but inside SessionProvider, we can try to construct it
    // But ideally it should be used within AuthProvider
    // For backward compatibility with existing code, we might want to throw or return a default
    // Let's stick to the pattern
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}