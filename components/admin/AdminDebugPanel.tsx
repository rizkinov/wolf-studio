'use client'

import React from 'react'
import { useAuth } from '@/lib/auth/context'
import { usePermissions } from '@/lib/hooks/usePermissions'

export function AdminDebugPanel() {
  const { user, isAuthenticated, loading } = useAuth()
  const { userRole, loading: permLoading, error: permError } = usePermissions()
  const isAdmin = userRole === 'admin'

  if (loading || permLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-100 border border-gray-300 rounded-lg p-3 text-xs z-50">
        <div>Auth: Loading...</div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-100 border border-gray-300 rounded-lg p-3 text-xs z-50">
      <div className="font-bold text-gray-800 mb-1">Debug Panel</div>
      <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
      <div>User Role: {userRole || 'None'}</div>
      <div>Admin: {isAdmin ? '✅' : '❌'}</div>
      <div>User: {user?.email || 'None'}</div>
      <div>Show PM: {(isAuthenticated && isAdmin) ? '✅' : '❌'}</div>
      {permError && <div className="text-red-600">Error: {permError}</div>}
    </div>
  )
} 