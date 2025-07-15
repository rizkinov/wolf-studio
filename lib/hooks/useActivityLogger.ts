import React from 'react'
import { useAuth } from '@/lib/auth/context'
import { ActivityLogService } from '@/lib/services/database'
import { ActivityType, ActivityLogDetails, ActivityLogMetadata } from '@/lib/types/database'

interface ActivityLoggerOptions {
  enabled?: boolean
  includeMetadata?: boolean
}

interface UseActivityLoggerReturn {
  logActivity: (
    activityType: ActivityType,
    resourceType?: string,
    resourceId?: string,
    resourceTitle?: string,
    details?: ActivityLogDetails
  ) => Promise<void>
  logProjectActivity: (
    action: 'created' | 'updated' | 'deleted' | 'published' | 'unpublished',
    projectId: string,
    projectTitle: string,
    details?: ActivityLogDetails
  ) => Promise<void>
  logCategoryActivity: (
    action: 'created' | 'updated' | 'deleted',
    categoryId: string,
    categoryName: string,
    details?: ActivityLogDetails
  ) => Promise<void>
  logUserActivity: (
    action: 'created' | 'updated' | 'deleted' | 'role_changed',
    userId: string,
    userName: string,
    details?: ActivityLogDetails
  ) => Promise<void>
  logImageActivity: (
    action: 'uploaded' | 'deleted',
    imageUrl: string,
    projectTitle?: string,
    details?: ActivityLogDetails
  ) => Promise<void>
  logLogin: () => Promise<void>
  logLogout: () => Promise<void>
}

export function useActivityLogger(options: ActivityLoggerOptions = {}): UseActivityLoggerReturn {
  const { user } = useAuth()
  const { enabled = true, includeMetadata = true } = options

  const getMetadata = (): ActivityLogMetadata | undefined => {
    if (!includeMetadata) return undefined

    return {
      timestamp: new Date().toISOString(),
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
    }
  }

  const logActivity = async (
    activityType: ActivityType,
    resourceType?: string,
    resourceId?: string,
    resourceTitle?: string,
    details?: ActivityLogDetails
  ): Promise<void> => {
    if (!enabled || !user?.id) {
      return
    }

    try {
      await ActivityLogService.logActivity(
        user.id,
        activityType,
        resourceType,
        resourceId,
        resourceTitle,
        details,
        getMetadata()
      )
    } catch (error) {
      // Silent fail for logging - we don't want to break the main flow
      console.warn('Failed to log activity:', error)
    }
  }

  const logProjectActivity = async (
    action: 'created' | 'updated' | 'deleted' | 'published' | 'unpublished',
    projectId: string,
    projectTitle: string,
    details?: ActivityLogDetails
  ): Promise<void> => {
    const activityType: ActivityType = `project_${action}` as ActivityType
    await logActivity(activityType, 'project', projectId, projectTitle, details)
  }

  const logCategoryActivity = async (
    action: 'created' | 'updated' | 'deleted',
    categoryId: string,
    categoryName: string,
    details?: ActivityLogDetails
  ): Promise<void> => {
    const activityType: ActivityType = `category_${action}` as ActivityType
    await logActivity(activityType, 'category', categoryId, categoryName, details)
  }

  const logUserActivity = async (
    action: 'created' | 'updated' | 'deleted' | 'role_changed',
    userId: string,
    userName: string,
    details?: ActivityLogDetails
  ): Promise<void> => {
    const activityType: ActivityType = `user_${action}` as ActivityType
    await logActivity(activityType, 'user', userId, userName, details)
  }

  const logImageActivity = async (
    action: 'uploaded' | 'deleted',
    imageUrl: string,
    projectTitle?: string,
    details?: ActivityLogDetails
  ): Promise<void> => {
    const activityType: ActivityType = `image_${action}` as ActivityType
    await logActivity(activityType, 'image', imageUrl, projectTitle, details)
  }

  const logLogin = async (): Promise<void> => {
    await logActivity('login')
  }

  const logLogout = async (): Promise<void> => {
    await logActivity('logout')
  }

  return {
    logActivity,
    logProjectActivity,
    logCategoryActivity,
    logUserActivity,
    logImageActivity,
    logLogin,
    logLogout,
  }
}

interface ActivityLoggerHigherOrderComponentProps {
  enabled?: boolean
  includeMetadata?: boolean
}

export function withActivityLogger<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  options: ActivityLoggerHigherOrderComponentProps = {}
) {
  return function WithActivityLoggerComponent(props: T) {
    const { logActivity } = useActivityLogger(options)

    const handleActivityLog = async (details?: ActivityLogDetails) => {
      await logActivity('user_updated', undefined, undefined, undefined, details)
    }

    return React.createElement(WrappedComponent, { ...props, onActivity: handleActivityLog })
  }
}

// Hook for tracking user interactions with valid ActivityType values
export function useUserInteractionLogger() {
  const { logActivity } = useActivityLogger()

  const logUserUpdate = async (userId: string, userTitle: string, details?: ActivityLogDetails) => {
    await logActivity('user_updated', 'user', userId, userTitle, {
      ...details,
      action_context: 'interaction',
    })
  }

  const logProjectUpdate = async (projectId: string, projectTitle: string, details?: ActivityLogDetails) => {
    await logActivity('project_updated', 'project', projectId, projectTitle, details)
  }

  const logImageUpload = async (imageUrl: string, projectTitle?: string, details?: ActivityLogDetails) => {
    await logActivity('image_uploaded', 'image', imageUrl, projectTitle, {
      ...details,
      action_context: 'upload',
    })
  }

  return {
    logUserUpdate,
    logProjectUpdate,
    logImageUpload,
  }
} 