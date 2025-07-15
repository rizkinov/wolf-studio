// Enterprise Structured Logging Service for Wolf Studio
// Provides comprehensive logging with request tracing, error monitoring, and audit trails

import { NextRequest } from 'next/server'

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  AUDIT = 'audit',
  SECURITY = 'security',
  PERFORMANCE = 'performance'
}

// Log categories
export enum LogCategory {
  AUTH = 'auth',
  API = 'api',
  DATABASE = 'database',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  USER_ACTION = 'user_action',
  SYSTEM = 'system',
  ERROR = 'error',
  AUDIT = 'audit',
  MIDDLEWARE = 'middleware'
}

// Structured log entry interface
export interface LogEntry {
  timestamp: string
  level: LogLevel
  category: LogCategory
  message: string
  correlationId?: string
  userId?: string
  sessionId?: string
  userAgent?: string
  ipAddress?: string
  requestId?: string
  url?: string
  method?: string
  statusCode?: number
  duration?: number
  metadata?: Record<string, any>
  stack?: string
  error?: Error
}

// Performance metrics interface
export interface PerformanceMetrics {
  duration: number
  memoryUsage?: NodeJS.MemoryUsage
  cpuUsage?: NodeJS.CpuUsage
  responseSize?: number
  queryCount?: number
  cacheHits?: number
  cacheMisses?: number
}

// Security event interface
export interface SecurityEvent {
  eventType: 'login' | 'logout' | 'failed_login' | 'rate_limit' | 'unauthorized' | 'suspicious_activity'
  userId?: string
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// Audit event interface
export interface AuditEvent {
  action: string
  resource: string
  resourceId?: string
  userId?: string
  oldValue?: any
  newValue?: any
  metadata?: Record<string, any>
}

class Logger {
  private static instance: Logger
  private correlationId: string | null = null
  private requestContext: Record<string, any> = {}

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  // Generate correlation ID for request tracing
  public generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  }

  // Set request context
  public setRequestContext(context: Record<string, any>): void {
    this.requestContext = context
  }

  // Set correlation ID
  public setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId
  }

  // Get request context from headers
  private getRequestContext(): Record<string, any> {
    try {
      // For server-side logging, we'll use the request context set by middleware
      return {
        userAgent: this.requestContext.userAgent || 'unknown',
        ipAddress: this.requestContext.ipAddress || 'unknown',
        correlationId: this.correlationId || this.generateCorrelationId()
      }
    } catch (error) {
      return {
        userAgent: 'unknown',
        ipAddress: 'unknown',
        correlationId: this.correlationId || this.generateCorrelationId()
      }
    }
  }

  // Create base log entry
  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    metadata?: Record<string, any>
  ): LogEntry {
    const context = this.getRequestContext()
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      correlationId: context.correlationId,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      ...this.requestContext,
      metadata
    }
  }

  // Format log entry for output
  private formatLogEntry(entry: LogEntry): string {
    const baseInfo = {
      timestamp: entry.timestamp,
      level: entry.level.toUpperCase(),
      category: entry.category,
      message: entry.message,
      correlationId: entry.correlationId
    }

    const contextInfo = {
      userId: entry.userId,
      sessionId: entry.sessionId,
      url: entry.url,
      method: entry.method,
      statusCode: entry.statusCode,
      duration: entry.duration,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent
    }

    // Remove undefined values
    const filteredContext = Object.fromEntries(
      Object.entries(contextInfo).filter(([_, value]) => value !== undefined)
    )

    const logData = {
      ...baseInfo,
      ...filteredContext,
      metadata: entry.metadata,
      stack: entry.stack
    }

    return JSON.stringify(logData, null, 2)
  }

  // Output log entry
  private outputLog(entry: LogEntry): void {
    const formattedLog = this.formatLogEntry(entry)
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(`🔴 [${entry.level.toUpperCase()}]`, formattedLog)
        break
      case LogLevel.WARN:
        console.warn(`🟡 [${entry.level.toUpperCase()}]`, formattedLog)
        break
      case LogLevel.SECURITY:
        console.error(`🚨 [${entry.level.toUpperCase()}]`, formattedLog)
        break
      case LogLevel.AUDIT:
        console.info(`📋 [${entry.level.toUpperCase()}]`, formattedLog)
        break
      case LogLevel.PERFORMANCE:
        console.info(`⚡ [${entry.level.toUpperCase()}]`, formattedLog)
        break
      case LogLevel.DEBUG:
        if (process.env.NODE_ENV === 'development') {
          console.debug(`🐛 [${entry.level.toUpperCase()}]`, formattedLog)
        }
        break
      default:
        console.log(`ℹ️ [${entry.level.toUpperCase()}]`, formattedLog)
    }

    // In production, send to external logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogger(entry)
    }
  }

  // Send to external logging service (placeholder)
  private sendToExternalLogger(entry: LogEntry): void {
    // TODO: Implement external logging service integration
    // Examples: Sentry, LogRocket, DataDog, etc.
  }

  // Core logging methods
  public error(message: string, error?: Error, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.ERROR, LogCategory.ERROR, message, metadata)
    if (error) {
      entry.error = error
      entry.stack = error.stack
    }
    this.outputLog(entry)
  }

  public warn(message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.WARN, LogCategory.SYSTEM, message, metadata)
    this.outputLog(entry)
  }

  public info(message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.SYSTEM, message, metadata)
    this.outputLog(entry)
  }

  public debug(message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, LogCategory.SYSTEM, message, metadata)
    this.outputLog(entry)
  }

  // Specialized logging methods
  public logAuth(message: string, userId?: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.AUTH, message, metadata)
    entry.userId = userId
    this.outputLog(entry)
  }

  public logAPI(
    message: string,
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.API, message, metadata)
    entry.method = method
    entry.url = url
    entry.statusCode = statusCode
    entry.duration = duration
    this.outputLog(entry)
  }

  public logDatabase(message: string, query?: string, duration?: number, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.DATABASE, message, metadata)
    if (query) entry.metadata = { ...entry.metadata, query }
    if (duration) entry.duration = duration
    this.outputLog(entry)
  }

  public logSecurity(event: SecurityEvent): void {
    const entry = this.createLogEntry(LogLevel.SECURITY, LogCategory.SECURITY, 
      `Security event: ${event.eventType}`, event.details)
    entry.userId = event.userId
    entry.ipAddress = event.ipAddress || entry.ipAddress
    entry.userAgent = event.userAgent || entry.userAgent
    entry.metadata = { ...entry.metadata, severity: event.severity }
    this.outputLog(entry)
  }

  public logPerformance(message: string, metrics: PerformanceMetrics, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.PERFORMANCE, LogCategory.PERFORMANCE, message, {
      ...metadata,
      ...metrics
    })
    entry.duration = metrics.duration
    this.outputLog(entry)
  }

  public logUserAction(
    action: string,
    userId: string,
    resource?: string,
    metadata?: Record<string, any>
  ): void {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.USER_ACTION, 
      `User action: ${action}`, metadata)
    entry.userId = userId
    if (resource) entry.metadata = { ...entry.metadata, resource }
    this.outputLog(entry)
  }

  public logAudit(auditEvent: AuditEvent): void {
    const entry = this.createLogEntry(LogLevel.AUDIT, LogCategory.AUDIT, 
      `Audit: ${auditEvent.action} on ${auditEvent.resource}`, auditEvent.metadata)
    entry.userId = auditEvent.userId
    entry.metadata = {
      ...entry.metadata,
      resource: auditEvent.resource,
      resourceId: auditEvent.resourceId,
      oldValue: auditEvent.oldValue,
      newValue: auditEvent.newValue
    }
    this.outputLog(entry)
  }

  // Request tracing utilities
  public startRequestTrace(req: NextRequest): string {
    const correlationId = this.generateCorrelationId()
    this.setCorrelationId(correlationId)
    this.setRequestContext({
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('user-agent') || 'unknown',
      ipAddress: req.headers.get('x-forwarded-for') || 
                req.headers.get('x-real-ip') || 'unknown'
    })
    
    this.logAPI('Request started', req.method, req.url, 0, 0, {
      correlationId,
      headers: Object.fromEntries(req.headers.entries())
    })
    
    return correlationId
  }

  public endRequestTrace(statusCode: number, duration: number, metadata?: Record<string, any>): void {
    this.logAPI('Request completed', 
      this.requestContext.method || 'unknown',
      this.requestContext.url || 'unknown',
      statusCode,
      duration,
      metadata
    )
  }

  // Error reporting
  public reportError(error: Error, context?: Record<string, any>): void {
    this.error(`Unhandled error: ${error.message}`, error, context)
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorTracker(error, context)
    }
  }

  private sendToErrorTracker(error: Error, context?: Record<string, any>): void {
    // TODO: Implement error tracking service integration
    // Examples: Sentry, Bugsnag, Rollbar, etc.
  }

  // Health check logging
  public logHealthCheck(service: string, status: 'healthy' | 'unhealthy', details?: Record<string, any>): void {
    const level = status === 'healthy' ? LogLevel.INFO : LogLevel.ERROR
    const entry = this.createLogEntry(level, LogCategory.SYSTEM, 
      `Health check: ${service} is ${status}`, details)
    this.outputLog(entry)
  }

  // Middleware logging
  public logMiddleware(message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.MIDDLEWARE, message, metadata)
    this.outputLog(entry)
  }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Utility functions for common logging patterns
export function withLogging<T>(
  operation: () => Promise<T>,
  operationName: string,
  metadata?: Record<string, any>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now()
    logger.info(`Starting ${operationName}`, metadata)
    
    try {
      const result = await operation()
      const duration = Date.now() - startTime
      logger.info(`Completed ${operationName}`, { ...metadata, duration })
      resolve(result)
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(`Failed ${operationName}`, error as Error, { ...metadata, duration })
      reject(error)
    }
  })
}

export function logExecutionTime(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value
  descriptor.value = async function (...args: any[]) {
    const startTime = Date.now()
    const result = await method.apply(this, args)
    const duration = Date.now() - startTime
    logger.logPerformance(`Method ${propertyName} executed`, { duration }, { args })
    return result
  }
}

// Request correlation middleware helper
export function createRequestLogger(req: NextRequest) {
  const correlationId = logger.startRequestTrace(req)
  
  return {
    correlationId,
    log: (message: string, metadata?: Record<string, any>) => {
      logger.info(message, { ...metadata, correlationId })
    },
    error: (message: string, error?: Error, metadata?: Record<string, any>) => {
      logger.error(message, error, { ...metadata, correlationId })
    },
    end: (statusCode: number, metadata?: Record<string, any>) => {
      logger.endRequestTrace(statusCode, Date.now(), metadata)
    }
  }
} 