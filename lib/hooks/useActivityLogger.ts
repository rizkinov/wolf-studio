import React from 'react'
import { useAuth } from '@/lib/auth/context'
import { ActivityLogService } from '@/lib/services/database'
import type { ActivityType } from '@/lib/types/database'

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
    details?: Record<string, any>
  ) => Promise<void>
  logProjectActivity: (
    action: 'created' | 'updated' | 'deleted' | 'published' | 'unpublished',
    projectId: string,
    projectTitle: string,
    details?: Record<string, any>
  ) => Promise<void>
  logCategoryActivity: (
    action: 'created' | 'updated' | 'deleted',
    categoryId: string,
    categoryName: string,
    details?: Record<string, any>
  ) => Promise<void>
  logUserActivity: (
    action: 'created' | 'updated' | 'deleted' | 'role_changed',
    userId: string,
    userName: string,
    details?: Record<string, any>
  ) => Promise<void>
  logImageActivity: (
    action: 'uploaded' | 'deleted',
    imageUrl: string,
    projectTitle?: string,
    details?: Record<string, any>
  ) => Promise<void>
  logLogin: () => Promise<void>
  logLogout: () => Promise<void>
}

export function useActivityLogger(options: ActivityLoggerOptions = {}): UseActivityLoggerReturn {
  const { user } = useAuth()
  const { enabled = true, includeMetadata = true } = options

  const getMetadata = (): Record<string, any> | undefined => {
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
    details?: Record<string, any>
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
    details?: Record<string, any>
  ): Promise<void> => {
    const activityType: ActivityType = `project_${action}` as ActivityType
    await logActivity(activityType, 'project', projectId, projectTitle, details)
  }

  const logCategoryActivity = async (
    action: 'created' | 'updated' | 'deleted',
    categoryId: string,
    categoryName: string,
    details?: Record<string, any>
  ): Promise<void> => {
    const activityType: ActivityType = `category_${action}` as ActivityType
    await logActivity(activityType, 'category', categoryId, categoryName, details)
  }

  const logUserActivity = async (
    action: 'created' | 'updated' | 'deleted' | 'role_changed',
    userId: string,
    userName: string,
    details?: Record<string, any>
  ): Promise<void> => {
    const activityType: ActivityType = `user_${action}` as ActivityType
    await logActivity(activityType, 'user', userId, userName, details)
  }

  const logImageActivity = async (
    action: 'uploaded' | 'deleted',
    imageUrl: string,
    projectTitle?: string,
    details?: Record<string, any>
  ): Promise<void> => {
    const activityType: ActivityType = `image_${action}` as ActivityType
    await logActivity(
      activityType, 
      'image', 
      undefined, 
      projectTitle ? `Image for ${projectTitle}` : 'Image',
      { image_url: imageUrl, ...details }
    )
  }

  const logLogin = async (): Promise<void> => {
    await logActivity('login', 'system', user?.id, 'User Login')
  }

  const logLogout = async (): Promise<void> => {
    await logActivity('logout', 'system', user?.id, 'User Logout')
  }

  return {
    logActivity,
    logProjectActivity,
    logCategoryActivity,
    logUserActivity,
    logImageActivity,
    logLogin,
    logLogout
  }
}

// Higher-order component for automatic activity logging
export function withActivityLogging<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T & { onActivity?: (details?: Record<string, any>) => Promise<void> }>,
  defaultActivityType: ActivityType,
  getResourceInfo?: (props: T) => { resourceType?: string; resourceId?: string; resourceTitle?: string }
) {
  return function ActivityLoggedComponent(props: T) {
    const { logActivity } = useActivityLogger()

    const handleActivityLog = async (details?: Record<string, any>) => {
      if (getResourceInfo) {
        const { resourceType, resourceId, resourceTitle } = getResourceInfo(props)
        await logActivity(defaultActivityType, resourceType, resourceId, resourceTitle, details)
      } else {
        await logActivity(defaultActivityType, undefined, undefined, undefined, details)
      }
    }

    // Pass the logging function to the wrapped component
    return React.createElement(WrappedComponent, { ...props, onActivity: handleActivityLog })
  }
}

// Custom hook for form activity logging
export function useFormActivityLogger(formType: string) {
  const { logActivity } = useActivityLogger()

  const logFormSubmit = async (
    action: 'created' | 'updated' | 'deleted',
    resourceId: string,
    resourceTitle: string,
    formData?: Record<string, any>
  ) => {
    await logActivity(
      `${formType}_${action}` as ActivityType,
      formType,
      resourceId,
      resourceTitle,
      { form_data: formData }
    )
  }

  const logFormError = async (
    error: string,
    formData?: Record<string, any>
  ) => {
    await logActivity(
      `${formType}_error` as ActivityType,
      formType,
      undefined,
      'Form Error',
      { error, form_data: formData }
    )
  }

  const logFormValidation = async (
    validationErrors: Record<string, string>,
    formData?: Record<string, any>
  ) => {
    await logActivity(
      `${formType}_validation_error` as ActivityType,
      formType,
      undefined,
      'Form Validation Error',
      { validation_errors: validationErrors, form_data: formData }
    )
  }

  return {
    logFormSubmit,
    logFormError,
    logFormValidation
  }
} 