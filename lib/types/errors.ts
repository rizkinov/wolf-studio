// Standardized Error Types for Wolf Studio CMS
// This file provides consistent error handling patterns across the application

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Database Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD = 'DUPLICATE_RECORD',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  
  // File & Upload Errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  
  // Network & API Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Business Logic Errors
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',
  
  // System Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  
  // Generic
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorContext {
  userId?: string
  sessionId?: string
  requestId?: string
  timestamp: string
  userAgent?: string
  ipAddress?: string
  endpoint?: string
  method?: string
  parameters?: Record<string, any>
  stackTrace?: string
  additionalInfo?: Record<string, any>
}

export interface AppError {
  code: ErrorCode
  message: string
  severity: ErrorSeverity
  context?: ErrorContext
  cause?: Error | AppError
  retryable: boolean
  userMessage?: string
  technicalDetails?: string
  suggestions?: string[]
}

export interface ValidationError {
  field: string
  message: string
  value?: any
  constraint?: string
}

export interface ApiErrorResponse {
  error: {
    code: ErrorCode
    message: string
    userMessage?: string
    details?: ValidationError[]
    suggestions?: string[]
    requestId?: string
    timestamp: string
  }
  success: false
}

export interface ApiSuccessResponse<T = any> {
  data: T
  message?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
  success: true
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

// Error code to HTTP status mapping
export const ERROR_HTTP_STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.SESSION_EXPIRED]: 401,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCode.INVALID_FORMAT]: 400,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.RECORD_NOT_FOUND]: 404,
  [ErrorCode.DUPLICATE_RECORD]: 409,
  [ErrorCode.CONSTRAINT_VIOLATION]: 409,
  [ErrorCode.FILE_TOO_LARGE]: 413,
  [ErrorCode.INVALID_FILE_TYPE]: 400,
  [ErrorCode.UPLOAD_FAILED]: 500,
  [ErrorCode.FILE_NOT_FOUND]: 404,
  [ErrorCode.NETWORK_ERROR]: 500,
  [ErrorCode.API_ERROR]: 500,
  [ErrorCode.TIMEOUT]: 408,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.BUSINESS_RULE_VIOLATION]: 400,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.RESOURCE_LOCKED]: 423,
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.CONFIGURATION_ERROR]: 500,
  [ErrorCode.UNKNOWN_ERROR]: 500
}

// User-friendly error messages
export const USER_ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: 'Please log in to access this resource.',
  [ErrorCode.FORBIDDEN]: 'You don\'t have permission to perform this action.',
  [ErrorCode.INVALID_TOKEN]: 'Your session has expired. Please log in again.',
  [ErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCode.VALIDATION_ERROR]: 'Please check the form and correct any errors.',
  [ErrorCode.INVALID_INPUT]: 'The information you entered is not valid.',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields.',
  [ErrorCode.INVALID_FORMAT]: 'Please enter information in the correct format.',
  [ErrorCode.DATABASE_ERROR]: 'We\'re experiencing technical difficulties. Please try again later.',
  [ErrorCode.RECORD_NOT_FOUND]: 'The requested item could not be found.',
  [ErrorCode.DUPLICATE_RECORD]: 'This item already exists.',
  [ErrorCode.CONSTRAINT_VIOLATION]: 'This operation cannot be completed due to existing dependencies.',
  [ErrorCode.FILE_TOO_LARGE]: 'The file is too large. Please choose a smaller file.',
  [ErrorCode.INVALID_FILE_TYPE]: 'This file type is not supported.',
  [ErrorCode.UPLOAD_FAILED]: 'File upload failed. Please try again.',
  [ErrorCode.FILE_NOT_FOUND]: 'The requested file could not be found.',
  [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
  [ErrorCode.API_ERROR]: 'Service is temporarily unavailable. Please try again later.',
  [ErrorCode.TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment and try again.',
  [ErrorCode.BUSINESS_RULE_VIOLATION]: 'This operation violates business rules.',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'You don\'t have sufficient permissions for this action.',
  [ErrorCode.RESOURCE_LOCKED]: 'This resource is currently locked by another user.',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred. Please try again later.',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
  [ErrorCode.CONFIGURATION_ERROR]: 'System configuration error. Please contact support.',
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again later.'
}

// Error recovery suggestions
export const ERROR_SUGGESTIONS: Record<ErrorCode, string[]> = {
  [ErrorCode.UNAUTHORIZED]: [
    'Click "Login" to sign in to your account',
    'Contact your administrator if you need access'
  ],
  [ErrorCode.FORBIDDEN]: [
    'Contact your administrator to request permission',
    'Check if you\'re using the correct account'
  ],
  [ErrorCode.INVALID_TOKEN]: [
    'Refresh the page and try again',
    'Log out and log back in'
  ],
  [ErrorCode.SESSION_EXPIRED]: [
    'Refresh the page and try again',
    'Log out and log back in'
  ],
  [ErrorCode.VALIDATION_ERROR]: [
    'Check all required fields are filled',
    'Ensure data is in the correct format'
  ],
  [ErrorCode.INVALID_INPUT]: [
    'Double-check your input',
    'Try using a different format'
  ],
  [ErrorCode.MISSING_REQUIRED_FIELD]: [
    'Look for fields marked with *',
    'Complete all required information'
  ],
  [ErrorCode.INVALID_FORMAT]: [
    'Check the format requirements',
    'Use the example format provided'
  ],
  [ErrorCode.DATABASE_ERROR]: [
    'Wait a moment and try again',
    'Contact support if the problem persists'
  ],
  [ErrorCode.RECORD_NOT_FOUND]: [
    'Check the URL or ID',
    'The item may have been deleted'
  ],
  [ErrorCode.DUPLICATE_RECORD]: [
    'Use a different name or identifier',
    'Check if the item already exists'
  ],
  [ErrorCode.CONSTRAINT_VIOLATION]: [
    'Remove related items first',
    'Check for dependencies'
  ],
  [ErrorCode.FILE_TOO_LARGE]: [
    'Compress the file or use a smaller one',
    'Split large files into smaller parts'
  ],
  [ErrorCode.INVALID_FILE_TYPE]: [
    'Use a supported file format',
    'Check the allowed file types'
  ],
  [ErrorCode.UPLOAD_FAILED]: [
    'Check your internet connection',
    'Try a smaller file'
  ],
  [ErrorCode.FILE_NOT_FOUND]: [
    'Check the file path',
    'The file may have been moved or deleted'
  ],
  [ErrorCode.NETWORK_ERROR]: [
    'Check your internet connection',
    'Try again in a few moments'
  ],
  [ErrorCode.API_ERROR]: [
    'Wait a moment and try again',
    'Check your internet connection'
  ],
  [ErrorCode.TIMEOUT]: [
    'Check your internet connection',
    'Try again with a faster connection'
  ],
  [ErrorCode.RATE_LIMIT_EXCEEDED]: [
    'Wait a few minutes before trying again',
    'Reduce the frequency of requests'
  ],
  [ErrorCode.BUSINESS_RULE_VIOLATION]: [
    'Review the business rules',
    'Contact support for clarification'
  ],
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: [
    'Contact your administrator',
    'Check if you\'re using the correct account'
  ],
  [ErrorCode.RESOURCE_LOCKED]: [
    'Wait for the other user to finish',
    'Try again later'
  ],
  [ErrorCode.INTERNAL_SERVER_ERROR]: [
    'Wait a moment and try again',
    'Contact support if the problem persists'
  ],
  [ErrorCode.SERVICE_UNAVAILABLE]: [
    'Check the system status page',
    'Try again later'
  ],
  [ErrorCode.CONFIGURATION_ERROR]: [
    'Contact system administrator',
    'Check system documentation'
  ],
  [ErrorCode.UNKNOWN_ERROR]: [
    'Try refreshing the page',
    'Contact support if the problem persists'
  ]
} 