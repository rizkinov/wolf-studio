import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import type { UserRole } from '@/lib/types/database'

interface UsePermissionsReturn {
  hasPermission: (resource: string, action: string) => boolean
  userRole: UserRole | null
  loading: boolean
  error: string | null
}

export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuth()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [permissions, setPermissions] = useState<Map<string, boolean>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setUserRole(null)
      setPermissions(new Map())
      setLoading(false)
      return
    }

    loadUserPermissions()
  }, [user])

  const loadUserPermissions = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      // Load user profile and permissions via API route
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // User is not authenticated, this is expected for public pages
          setUserRole(null)
          setPermissions(new Map())
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { data: profile, error: profileError } = await response.json()
      
      if (profileError) {
        setError(profileError)
        return
      }

      if (profile) {
        setUserRole(profile.role)
        
        // Create permission map from permissions
        const permMap = new Map<string, boolean>()
        if (profile.permissions) {
          profile.permissions.forEach((perm: any) => {
            permMap.set(`${perm.resource_type}:${perm.permission_type}`, true)
          })
        }
        setPermissions(permMap)
      }
    } catch (err) {
      console.error('Error loading user permissions:', err)
      setError('Failed to load permissions')
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user || !userRole) return false

    // Admin has all permissions
    if (userRole === 'admin') return true

    // Check explicit permissions first
    const permissionKey = `${resource}:${action}`
    if (permissions.has(permissionKey)) {
      return permissions.get(permissionKey) || false
    }

    // Default role-based permissions
    switch (userRole) {
      case 'editor':
        // Editors can read/create/update projects and categories
        return (
          (resource === 'projects' && ['read', 'create', 'update'].includes(action)) ||
          (resource === 'categories' && ['read', 'create', 'update'].includes(action)) ||
          (resource === 'analytics' && action === 'read')
        )
      case 'viewer':
        // Viewers can only read
        return action === 'read'
      default:
        return false
    }
  }

  return {
    hasPermission,
    userRole,
    loading,
    error
  }
}

// Convenience hooks for specific permissions
export function useCanManageUsers(): boolean {
  const { hasPermission } = usePermissions()
  return hasPermission('users', 'read')
}

export function useCanCreateUsers(): boolean {
  const { hasPermission } = usePermissions()
  return hasPermission('users', 'create')
}

export function useCanEditUsers(): boolean {
  const { hasPermission } = usePermissions()
  return hasPermission('users', 'update')
}

export function useCanDeleteUsers(): boolean {
  const { hasPermission } = usePermissions()
  return hasPermission('users', 'delete')
}

export function useCanManageProjects(): boolean {
  const { hasPermission } = usePermissions()
  return hasPermission('projects', 'update')
}

export function useCanPublishProjects(): boolean {
  const { hasPermission } = usePermissions()
  return hasPermission('projects', 'publish')
}

export function useIsAdmin(): boolean {
  const { userRole } = usePermissions()
  return userRole === 'admin'
}

export function useIsEditor(): boolean {
  const { userRole } = usePermissions()
  return userRole === 'editor' || userRole === 'admin'
} 