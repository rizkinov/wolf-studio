// Request throttling utility to prevent 500 errors from rapid clicking
// This prevents race conditions and duplicate requests

import { withRetry } from './error-handler'

interface RequestCache {
  [key: string]: {
    promise: Promise<any>
    timestamp: number
  }
}

class RequestThrottler {
  private cache: RequestCache = {}
  private readonly defaultTtl = 1000 // 1 second cache by default
  private readonly maxConcurrentRequests = 5
  private activeRequests = 0

  // Throttle requests by key to prevent duplicates
  async throttle<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = this.defaultTtl
  ): Promise<T> {
    const now = Date.now()
    const cached = this.cache[key]

    // Return cached promise if it's still valid
    if (cached && (now - cached.timestamp) < ttl) {
      return cached.promise
    }

    // Check if we're at max concurrent requests
    if (this.activeRequests >= this.maxConcurrentRequests) {
      throw new Error('Too many concurrent requests. Please try again in a moment.')
    }

    // Create new request with retry logic
    const promise = this.executeWithRetry(requestFn)
    
    // Cache the promise
    this.cache[key] = {
      promise,
      timestamp: now
    }

    // Clean up cache after TTL
    setTimeout(() => {
      delete this.cache[key]
    }, ttl)

    return promise
  }

  private async executeWithRetry<T>(requestFn: () => Promise<T>): Promise<T> {
    this.activeRequests++
    
    try {
      return await withRetry(requestFn, {
        maxRetries: 2,
        retryDelay: 500,
        exponentialBackoff: true
      })
    } finally {
      this.activeRequests--
    }
  }

  // Clear all cached requests
  clearCache(): void {
    this.cache = {}
  }

  // Get cache stats
  getStats(): { cacheSize: number; activeRequests: number } {
    return {
      cacheSize: Object.keys(this.cache).length,
      activeRequests: this.activeRequests
    }
  }
}

// Export singleton instance
export const requestThrottler = new RequestThrottler()

// Debounce utility for UI interactions
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout | undefined

  return ((...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

// Note: React hooks are in a separate file to avoid server-side import issues 