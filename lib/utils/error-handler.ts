// Error Handling Utilities for Wolf Studio CMS
// This file provides utilities for creating, handling, and logging errors consistently

import { NextRequest, NextResponse } from 'next/server'
// Simple UUID generator function
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
import { 
  AppError, 
  ErrorCode, 
  ErrorSeverity, 
  ErrorContext, 
  ApiErrorResponse, 
  ApiSuccessResponse, 
  ValidationError,
  ERROR_HTTP_STATUS_MAP,
  USER_ERROR_MESSAGES,
  ERROR_SUGGESTIONS
} from '@/lib/types/errors'

/**
 * Creates a standardized AppError
 */
export function createAppError(
  code: ErrorCode,
  message: string,
  options: {
    severity?: ErrorSeverity
    context?: Partial<ErrorContext>
    cause?: Error | AppError
    retryable?: boolean
    userMessage?: string
    technicalDetails?: string
    suggestions?: string[]
  } = {}
): AppError {
  const {
    severity = ErrorSeverity.MEDIUM,
    context = {},
    cause,
    retryable = false,
    userMessage = USER_ERROR_MESSAGES[code],
    technicalDetails,
    suggestions = ERROR_SUGGESTIONS[code]
  } = options

  const fullContext: ErrorContext = {
    timestamp: new Date().toISOString(),
    requestId: generateUUID(),
    ...context
  }

  return {
    code,
    message,
    severity,
    context: fullContext,
    cause,
    retryable,
    userMessage,
    technicalDetails,
    suggestions
  }
}

/**
 * Creates context from NextRequest
 */
export function createErrorContext(
  request?: NextRequest,
  additionalInfo?: Record<string, any>
): Partial<ErrorContext> {
  if (!request) {
    return {
      timestamp: new Date().toISOString(),
      requestId: generateUUID(),
      additionalInfo
    }
  }

  return {
    timestamp: new Date().toISOString(),
    requestId: generateUUID(),
    userAgent: request.headers.get('user-agent') || undefined,
    ipAddress: request.headers.get('x-forwarded-for') || undefined,
    endpoint: request.url,
    method: request.method,
    additionalInfo
  }
}

/**
 * Logs an error with appropriate severity
 */
export function logError(error: AppError | Error, context?: Record<string, any>) {
  const isAppError = error instanceof Object && 'code' in error
  const errorData = {
    timestamp: new Date().toISOString(),
    error: isAppError ? error : {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context,
    severity: isAppError ? error.severity : ErrorSeverity.MEDIUM
  }

  // Log based on severity
  if (isAppError) {
    switch (error.severity) {
      case ErrorSeverity.LOW:
        console.info('🔵 [LOW]', errorData)
        break
      case ErrorSeverity.MEDIUM:
        console.warn('🟡 [MEDIUM]', errorData)
        break
      case ErrorSeverity.HIGH:
        console.error('🔴 [HIGH]', errorData)
        break
      case ErrorSeverity.CRITICAL:
        console.error('🚨 [CRITICAL]', errorData)
        // In production, you might want to send critical errors to monitoring service
        break
    }
  } else {
    console.error('❌ [ERROR]', errorData)
  }
}

/**
 * Converts various error types to AppError
 */
export function normalizeError(error: unknown, defaultCode: ErrorCode = ErrorCode.UNKNOWN_ERROR): AppError {
  if (error instanceof Object && 'code' in error && typeof error.code === 'string') {
    return error as AppError
  }

  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('not found')) {
      return createAppError(ErrorCode.RECORD_NOT_FOUND, error.message, {
        cause: error,
        severity: ErrorSeverity.LOW
      })
    }
    
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      return createAppError(ErrorCode.DUPLICATE_RECORD, error.message, {
        cause: error,
        severity: ErrorSeverity.LOW
      })
    }
    
    if (error.message.includes('unauthorized') || error.message.includes('forbidden')) {
      return createAppError(ErrorCode.UNAUTHORIZED, error.message, {
        cause: error,
        severity: ErrorSeverity.MEDIUM
      })
    }

    if (error.message.includes('timeout')) {
      return createAppError(ErrorCode.TIMEOUT, error.message, {
        cause: error,
        severity: ErrorSeverity.MEDIUM,
        retryable: true
      })
    }

    return createAppError(defaultCode, error.message, {
      cause: error,
      technicalDetails: error.stack
    })
  }

  if (typeof error === 'string') {
    return createAppError(defaultCode, error)
  }

  return createAppError(defaultCode, 'An unknown error occurred', {
    technicalDetails: String(error)
  })
}

/**
 * Creates a standardized API error response
 */
export function createApiErrorResponse(
  error: AppError | Error | unknown,
  request?: NextRequest
): NextResponse<ApiErrorResponse> {
  const appError = normalizeError(error)
  const context = createErrorContext(request)
  
  // Update error context with request info
  if (appError.context) {
    appError.context = { ...appError.context, ...context }
  }

  // Log the error
  logError(appError, context)

  const response: ApiErrorResponse = {
    error: {
      code: appError.code,
      message: appError.message,
      userMessage: appError.userMessage,
      suggestions: appError.suggestions,
      requestId: appError.context?.requestId,
      timestamp: appError.context?.timestamp || new Date().toISOString()
    },
    success: false
  }

  const statusCode = ERROR_HTTP_STATUS_MAP[appError.code] || 500

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Creates a standardized API success response
 */
export function createApiSuccessResponse<T>(
  data: T,
  options: {
    message?: string
    meta?: {
      total?: number
      page?: number
      limit?: number
      hasMore?: boolean
    }
  } = {}
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    data,
    success: true,
    ...options
  }

  return NextResponse.json(response)
}

/**
 * Validation error helper
 */
export function createValidationError(
  errors: ValidationError[]
): AppError {
  return createAppError(ErrorCode.VALIDATION_ERROR, 'Validation failed', {
    severity: ErrorSeverity.LOW,
    userMessage: 'Please check the form and correct any errors.',
    technicalDetails: JSON.stringify(errors, null, 2)
  })
}

/**
 * Database error helper
 */
export function createDatabaseError(
  operation: string,
  cause: Error
): AppError {
  return createAppError(ErrorCode.DATABASE_ERROR, `Database operation failed: ${operation}`, {
    severity: ErrorSeverity.HIGH,
    cause,
    retryable: true,
    technicalDetails: cause.stack
  })
}

/**
 * File upload error helper
 */
export function createFileUploadError(
  reason: string,
  cause?: Error
): AppError {
  let code = ErrorCode.UPLOAD_FAILED
  
  if (reason.includes('size') || reason.includes('large')) {
    code = ErrorCode.FILE_TOO_LARGE
  } else if (reason.includes('type') || reason.includes('format')) {
    code = ErrorCode.INVALID_FILE_TYPE
  }

  return createAppError(code, reason, {
    severity: ErrorSeverity.LOW,
    cause,
    retryable: code === ErrorCode.UPLOAD_FAILED
  })
}

/**
 * Authorization error helper
 */
export function createAuthError(
  reason: string = 'Access denied'
): AppError {
  return createAppError(ErrorCode.UNAUTHORIZED, reason, {
    severity: ErrorSeverity.MEDIUM,
    retryable: false
  })
}

/**
 * Rate limit error helper
 */
export function createRateLimitError(
  retryAfter?: number
): AppError {
  return createAppError(ErrorCode.RATE_LIMIT_EXCEEDED, 'Rate limit exceeded', {
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    technicalDetails: retryAfter ? `Retry after ${retryAfter} seconds` : undefined
  })
}

/**
 * Network error helper
 */
export function createNetworkError(
  operation: string,
  cause?: Error
): AppError {
  return createAppError(ErrorCode.NETWORK_ERROR, `Network error during ${operation}`, {
    severity: ErrorSeverity.MEDIUM,
    cause,
    retryable: true
  })
}

/**
 * Business rule violation error helper
 */
export function createBusinessRuleError(
  rule: string,
  details?: string
): AppError {
  return createAppError(ErrorCode.BUSINESS_RULE_VIOLATION, `Business rule violation: ${rule}`, {
    severity: ErrorSeverity.LOW,
    technicalDetails: details,
    retryable: false
  })
}

/**
 * Retry mechanism for retryable errors
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number
    retryDelay?: number
    exponentialBackoff?: boolean
    retryableErrorCodes?: ErrorCode[]
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    retryableErrorCodes = [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT,
      ErrorCode.DATABASE_ERROR,
      ErrorCode.API_ERROR,
      ErrorCode.UPLOAD_FAILED
    ]
  } = options

  let lastError: AppError | Error | unknown
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      const appError = normalizeError(error)
      
      // Check if error is retryable
      if (!appError.retryable && !retryableErrorCodes.includes(appError.code)) {
        throw error
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        throw error
      }
      
      // Calculate delay
      const delay = exponentialBackoff 
        ? retryDelay * Math.pow(2, attempt)
        : retryDelay
      
      // Log retry attempt
      console.warn(`Retry attempt ${attempt + 1}/${maxRetries} for operation, waiting ${delay}ms`, {
        error: appError,
        attempt: attempt + 1,
        maxRetries,
        delay
      })
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
} 