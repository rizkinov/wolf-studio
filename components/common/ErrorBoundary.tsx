'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { ErrorCode, ErrorSeverity } from '@/lib/types/errors'
import { logError, createAppError } from '@/lib/utils/error-handler'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  retryCount: number
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showErrorDetails?: boolean
  maxRetries?: number
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, showErrorDetails = false } = this.props
    
    // Create structured error
    const appError = createAppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      error.message,
      {
        severity: ErrorSeverity.HIGH,
        cause: error,
                 technicalDetails: showErrorDetails ? (errorInfo.componentStack || undefined) : undefined,
        context: {
          timestamp: new Date().toISOString(),
          additionalInfo: {
            componentStack: errorInfo.componentStack,
            errorBoundary: true
          }
        }
      }
    )

    // Log the error
    logError(appError, {
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack
    })

    // Update state
    this.setState({ errorInfo })

    // Call custom error handler
    onError?.(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props
    const { hasError } = this.state

    if (hasError && resetOnPropsChange) {
      if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, index) => key !== prevProps.resetKeys?.[index]
        )
        if (hasResetKeyChanged) {
          this.resetErrorBoundary()
        }
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    })
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props
    const { retryCount } = this.state

    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }))
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    const { children, fallback, showErrorDetails = false, maxRetries = 3 } = this.props
    const { hasError, error, errorInfo, errorId, retryCount } = this.state

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      const canRetry = retryCount < maxRetries
      const errorMessage = error?.message || 'An unexpected error occurred'

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  We&apos;re sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Error ID:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{errorId}</code>
                </p>
                
                {showErrorDetails && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-700 hover:text-gray-900">
                      Technical Details
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded border text-xs font-mono">
                      <div className="mb-2">
                        <strong>Error:</strong> {errorMessage}
                      </div>
                      {errorInfo && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="mt-1 overflow-x-auto">{errorInfo.componentStack}</pre>
                        </div>
                      )}
                      {error?.stack && (
                        <div className="mt-2">
                          <strong>Stack Trace:</strong>
                          <pre className="mt-1 overflow-x-auto">{error.stack}</pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                {retryCount > 0 && (
                  <p className="text-sm text-orange-600">
                    Retry attempt {retryCount} of {maxRetries}
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {canRetry && (
                  <Button onClick={this.handleRetry} variant="default" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                <Button onClick={this.handleReload} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button onClick={this.handleGoHome} variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
                
                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    onClick={() => window.open('https://github.com/issues/new', '_blank')}
                    variant="outline" 
                    size="sm"
                  >
                    <Bug className="h-4 w-4 mr-2" />
                    Report Bug
                  </Button>
                )}
              </div>

              <div className="text-xs text-gray-500 pt-2 border-t">
                <p>
                  If this problem persists, please contact support with the error ID above.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    setError(error)
    
    // Log the error
    const appError = createAppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      error.message,
      {
        severity: ErrorSeverity.MEDIUM,
        cause: error,
        technicalDetails: error.stack
      }
    )
    
    logError(appError, { useErrorHandler: true })
  }, [])

  // Throw error to trigger error boundary
  if (error) {
    throw error
  }

  return { handleError, resetError }
}

// Higher-order component wrapper
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Specialized error boundaries for different contexts
export function AdminErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      showErrorDetails={process.env.NODE_ENV === 'development'}
      maxRetries={2}
      onError={(error, errorInfo) => {
        // Admin-specific error handling
        console.error('Admin panel error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function ApiErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      showErrorDetails={false}
      maxRetries={3}
      onError={(error, errorInfo) => {
        // API-specific error handling
        console.error('API error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function PublicErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      showErrorDetails={false}
      maxRetries={1}
      onError={(error, errorInfo) => {
        // Public-facing error handling
        console.error('Public site error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
} 