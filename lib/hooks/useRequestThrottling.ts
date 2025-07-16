'use client'

import { useState } from 'react'
import { requestThrottler } from '@/lib/utils/request-throttling'

// Hook for React components to prevent rapid clicks
export function useRequestThrottling() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const throttledRequest = async <T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl?: number
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await requestThrottler.throttle(key, requestFn, ttl)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { throttledRequest, loading, error }
} 