// Retry mechanism for handling failed requests
// Implements exponential backoff with jitter to prevent thundering herd

import { logger } from '@/lib/services/logger'

interface RetryOptions {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
  jitter?: boolean
  retryCondition?: (error: Error) => boolean
}

interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
  totalDuration: number
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffFactor: 2,
  jitter: true,
  retryCondition: (error: Error) => {
    // Default: retry on server errors but not client errors
    const message = error.message.toLowerCase()
    return (
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504') ||
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('econnreset') ||
      message.includes('enotfound')
    )
  }
}

class RetryManager {
  // Retry a function with exponential backoff
  async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {},
    context?: string
  ): Promise<RetryResult<T>> {
    const opts = { ...defaultOptions, ...options }
    const startTime = Date.now()
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
      try {
        const result = await fn()
        
        // Log successful retry if it wasn't the first attempt
        if (attempt > 1) {
          logger.info('Retry successful', {
            context,
            attempt,
            totalDuration: Date.now() - startTime
          })
        }
        
        return {
          success: true,
          data: result,
          attempts: attempt,
          totalDuration: Date.now() - startTime
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        // Check if we should retry this error
        if (!opts.retryCondition(lastError)) {
          logger.info('Error not retryable', {
            context,
            error: lastError.message,
            attempt
          })
          break
        }
        
        // If this is the last attempt, don't delay
        if (attempt === opts.maxAttempts) {
          break
        }
        
        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, opts)
        
        logger.warn('Retry attempt failed, retrying...', {
          context,
          error: lastError.message,
          attempt,
          nextRetryIn: delay,
          maxAttempts: opts.maxAttempts
        })
        
        // Wait before retrying
        await this.sleep(delay)
      }
    }
    
    // All attempts failed
    logger.error('All retry attempts failed', lastError || undefined, {
      context,
      attempts: opts.maxAttempts,
      totalDuration: Date.now() - startTime
    })
    
    return {
      success: false,
      error: lastError || new Error('Unknown error'),
      attempts: opts.maxAttempts,
      totalDuration: Date.now() - startTime
    }
  }
  
  // Calculate delay with exponential backoff and jitter
  private calculateDelay(attempt: number, options: Required<RetryOptions>): number {
    const { initialDelay, maxDelay, backoffFactor, jitter } = options
    
    // Calculate base delay with exponential backoff
    const baseDelay = Math.min(
      initialDelay * Math.pow(backoffFactor, attempt - 1),
      maxDelay
    )
    
    if (!jitter) {
      return baseDelay
    }
    
    // Add jitter to prevent thundering herd
    const jitterAmount = baseDelay * 0.1 // 10% jitter
    const jitterOffset = (Math.random() - 0.5) * 2 * jitterAmount
    
    return Math.max(0, baseDelay + jitterOffset)
  }
  
  // Sleep utility
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  // Retry with circuit breaker pattern
  async retryWithCircuitBreaker<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {},
    context?: string
  ): Promise<T> {
    const result = await this.retry(fn, options, context)
    
    if (result.success) {
      return result.data!
    } else {
      throw result.error || new Error('Retry failed')
    }
  }
}

// Export singleton instance
export const retryManager = new RetryManager()

// Utility functions for common retry scenarios
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  context?: string
): Promise<T> {
  return retryManager.retryWithCircuitBreaker(
    apiCall,
    {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 5000,
      backoffFactor: 2,
      jitter: true
    },
    context
  )
}

export async function retryDatabaseQuery<T>(
  query: () => Promise<T>,
  context?: string
): Promise<T> {
  return retryManager.retryWithCircuitBreaker(
    query,
    {
      maxAttempts: 2,
      initialDelay: 500,
      maxDelay: 2000,
      backoffFactor: 2,
      jitter: true,
      retryCondition: (error: Error) => {
        const message = error.message.toLowerCase()
        return (
          message.includes('connection') ||
          message.includes('timeout') ||
          message.includes('network') ||
          message.includes('econnreset') ||
          message.includes('temporary') ||
          message.includes('503') ||
          message.includes('502')
        )
      }
    },
    context
  )
}

export async function retryWithFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
  context?: string
): Promise<T> {
  const result = await retryManager.retry(
    primaryFn,
    { maxAttempts: 2, initialDelay: 500 },
    context
  )
  
  if (result.success) {
    return result.data!
  } else {
    logger.info('Primary function failed, using fallback', {
      context,
      error: result.error?.message
    })
    return fallbackFn()
  }
} 