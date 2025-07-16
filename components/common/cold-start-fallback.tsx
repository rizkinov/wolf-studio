'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, RefreshCw, Clock } from 'lucide-react'

interface ColdStartFallbackProps {
  error?: Error
  reset?: () => void
  context?: string
  showRetryButton?: boolean
  retryDelay?: number
}

export function ColdStartFallback({ 
  error, 
  reset, 
  context = 'content', 
  showRetryButton = true,
  retryDelay = 3000
}: ColdStartFallbackProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const isColdStartError = error?.message?.includes('500') || 
                          error?.message?.includes('timeout') ||
                          error?.message?.includes('network') ||
                          error?.message?.includes('connection')

  const handleRetry = async () => {
    if (isRetrying) return
    
    setIsRetrying(true)
    setCountdown(0)
    
    try {
      // Wait a moment before retrying
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (reset) {
        reset()
      } else {
        // Fallback: reload the page
        window.location.reload()
      }
    } catch (err) {
      console.error('Retry failed:', err)
      setIsRetrying(false)
    }
  }

  useEffect(() => {
    if (isColdStartError && retryDelay > 0) {
      setCountdown(Math.ceil(retryDelay / 1000))
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            // Auto-retry after countdown
            handleRetry()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isColdStartError, retryDelay, handleRetry])

  if (isColdStartError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center max-w-md">
          <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Just a moment...
          </h2>
          <p className="text-gray-600 mb-4">
            We&apos;re warming up the servers for you. This usually takes just a few seconds on first visit.
          </p>
          
          {countdown > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
              <span className="text-sm text-gray-500">
                Auto-retrying in {countdown}s...
              </span>
            </div>
          )}
          
          {showRetryButton && (
            <button
              onClick={handleRetry}
              disabled={isRetrying || countdown > 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </>
              )}
            </button>
          )}
          
          <p className="text-xs text-gray-500 mt-4">
            This delay only happens on first visit. Subsequent visits will be instant.
          </p>
        </div>
      </div>
    )
  }

  // Generic error fallback
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-red-50 rounded-lg border border-red-200">
      <div className="text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-800 mb-2">
          Something went wrong
        </h2>
        <p className="text-red-600 mb-4">
          There was an error loading the {context}. Please try again.
        </p>
        
        {error && (
          <details className="text-left mb-4">
            <summary className="cursor-pointer text-sm text-red-700 hover:text-red-800">
              Error details
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
        
        {showRetryButton && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Try Again
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// Hook for handling cold start errors in components
export function useColdStartHandler() {
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const handleError = (error: Error) => {
    setError(error)
  }

  const retry = () => {
    setError(null)
    setRetryCount(prev => prev + 1)
  }

  const reset = () => {
    setError(null)
    setRetryCount(0)
  }

  return {
    error,
    retryCount,
    handleError,
    retry,
    reset
  }
} 