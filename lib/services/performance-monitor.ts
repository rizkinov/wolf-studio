// Enterprise Performance Monitoring Service for Wolf Studio
// Provides comprehensive performance monitoring with metrics collection and APM integration

import { logger } from './logger'

// Performance metrics interfaces
export interface WebVitalsMetrics {
  name: string
  value: number
  id: string
  delta: number
  rating: 'good' | 'needs-improvement' | 'poor'
  navigationType: string
}

export interface APIPerformanceMetrics {
  endpoint: string
  method: string
  statusCode: number
  duration: number
  responseSize: number
  timestamp: Date
  userId?: string
  userAgent?: string
  ipAddress?: string
}

export interface DatabasePerformanceMetrics {
  query: string
  duration: number
  rows: number
  cached: boolean
  timestamp: Date
}

export interface SystemPerformanceMetrics {
  memoryUsage: NodeJS.MemoryUsage
  cpuUsage: NodeJS.CpuUsage
  uptime: number
  timestamp: Date
}

export interface PerformanceThresholds {
  apiResponseTime: number
  databaseQueryTime: number
  memoryUsagePercentage: number
  cpuUsagePercentage: number
  errorRate: number
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, any[]> = new Map()
  private thresholds: PerformanceThresholds
  private startTime: number = Date.now()
  private requestCount: number = 0
  private errorCount: number = 0

  private constructor() {
    this.thresholds = {
      apiResponseTime: 1000, // 1 second
      databaseQueryTime: 500, // 500ms
      memoryUsagePercentage: 80, // 80%
      cpuUsagePercentage: 70, // 70%
      errorRate: 0.05 // 5%
    }
    
    // Start system monitoring
    this.startSystemMonitoring()
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Set custom thresholds
  public setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds }
  }

  // Track API performance
  public trackAPIRequest(metrics: APIPerformanceMetrics): void {
    // Store metrics
    if (!this.metrics.has('api')) {
      this.metrics.set('api', [])
    }
    this.metrics.get('api')!.push(metrics)
    
    // Update counters
    this.requestCount++
    if (metrics.statusCode >= 400) {
      this.errorCount++
    }
    
    // Log performance
    logger.logPerformance(
      `API ${metrics.method} ${metrics.endpoint}`,
      {
        duration: metrics.duration,
        responseSize: metrics.responseSize
      },
      {
        statusCode: metrics.statusCode,
        userId: metrics.userId,
        userAgent: metrics.userAgent,
        ipAddress: metrics.ipAddress
      }
    )
    
    // Check thresholds
    if (metrics.duration > this.thresholds.apiResponseTime) {
      logger.warn(`API response time exceeded threshold`, {
        endpoint: metrics.endpoint,
        duration: metrics.duration,
        threshold: this.thresholds.apiResponseTime
      })
    }
    
    // Send to APM service
    this.sendToAPMService('api', metrics)
  }

  // Track database performance
  public trackDatabaseQuery(metrics: DatabasePerformanceMetrics): void {
    // Store metrics
    if (!this.metrics.has('database')) {
      this.metrics.set('database', [])
    }
    this.metrics.get('database')!.push(metrics)
    
    // Log performance
    logger.logDatabase(
      `Database query executed`,
      metrics.query,
      metrics.duration,
      {
        rows: metrics.rows,
        cached: metrics.cached
      }
    )
    
    // Check thresholds
    if (metrics.duration > this.thresholds.databaseQueryTime) {
      logger.warn(`Database query time exceeded threshold`, {
        query: metrics.query.substring(0, 100) + '...',
        duration: metrics.duration,
        threshold: this.thresholds.databaseQueryTime
      })
    }
    
    // Send to APM service
    this.sendToAPMService('database', metrics)
  }

  // Track Web Vitals
  public trackWebVitals(metrics: WebVitalsMetrics): void {
    // Store metrics
    if (!this.metrics.has('webVitals')) {
      this.metrics.set('webVitals', [])
    }
    this.metrics.get('webVitals')!.push(metrics)
    
    // Log performance
    logger.logPerformance(
      `Web Vital: ${metrics.name}`,
      {
        duration: metrics.value
      },
      {
        id: metrics.id,
        delta: metrics.delta,
        rating: metrics.rating,
        navigationType: metrics.navigationType
      }
    )
    
    // Check if performance is poor
    if (metrics.rating === 'poor') {
      logger.warn(`Poor Web Vital performance detected`, {
        name: metrics.name,
        value: metrics.value,
        rating: metrics.rating
      })
    }
    
    // Send to APM service
    this.sendToAPMService('webVitals', metrics)
  }

  // Track system performance
  public trackSystemMetrics(): SystemPerformanceMetrics {
    const metrics: SystemPerformanceMetrics = {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
      timestamp: new Date()
    }
    
    // Store metrics
    if (!this.metrics.has('system')) {
      this.metrics.set('system', [])
    }
    this.metrics.get('system')!.push(metrics)
    
    // Calculate memory usage percentage
    const memoryUsagePercent = (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100
    
    // Log performance
    logger.logPerformance(
      `System metrics collected`,
      {
        duration: 0,
        memoryUsage: metrics.memoryUsage,
        cpuUsage: metrics.cpuUsage
      },
      {
        uptime: metrics.uptime,
        memoryUsagePercent
      }
    )
    
    // Check thresholds
    if (memoryUsagePercent > this.thresholds.memoryUsagePercentage) {
      logger.warn(`Memory usage exceeded threshold`, {
        current: memoryUsagePercent,
        threshold: this.thresholds.memoryUsagePercentage
      })
    }
    
    // Send to APM service
    this.sendToAPMService('system', metrics)
    
    return metrics
  }

  // Get performance summary
  public getPerformanceSummary(): Record<string, any> {
    const errorRate = this.requestCount > 0 ? this.errorCount / this.requestCount : 0
    const uptime = Date.now() - this.startTime
    
    return {
      uptime,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate,
      metrics: {
        api: this.metrics.get('api')?.length || 0,
        database: this.metrics.get('database')?.length || 0,
        webVitals: this.metrics.get('webVitals')?.length || 0,
        system: this.metrics.get('system')?.length || 0
      },
      thresholds: this.thresholds
    }
  }

  // Get metrics by type
  public getMetrics(type: string, limit: number = 100): any[] {
    const metrics = this.metrics.get(type) || []
    return metrics.slice(-limit)
  }

  // Start system monitoring
  private startSystemMonitoring(): void {
    // Track system metrics every 30 seconds
    setInterval(() => {
      this.trackSystemMetrics()
    }, 30000)
    
    // Clean up old metrics every 5 minutes
    setInterval(() => {
      this.cleanupOldMetrics()
    }, 300000)
  }

  // Clean up old metrics (keep last 1000 entries per type)
  private cleanupOldMetrics(): void {
    const maxEntries = 1000
    
    for (const [type, metrics] of this.metrics.entries()) {
      if (metrics.length > maxEntries) {
        this.metrics.set(type, metrics.slice(-maxEntries))
      }
    }
  }

  // Send metrics to APM service
  private sendToAPMService(type: string, metrics: any): void {
    // In production, send to APM service like Sentry, DataDog, New Relic, etc.
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement APM service integration
      this.sendToSentry(type, metrics)
      this.sendToDataDog(type, metrics)
      this.sendToNewRelic(type, metrics)
    }
  }

  // Sentry integration
  private sendToSentry(type: string, metrics: any): void {
    // TODO: Implement Sentry performance monitoring
    // Example: Sentry.addBreadcrumb({ category: 'performance', message: type, data: metrics })
  }

  // DataDog integration
  private sendToDataDog(type: string, metrics: any): void {
    // TODO: Implement DataDog metrics
    // Example: datadog.increment('wolf_studio.performance', 1, [`type:${type}`])
  }

  // New Relic integration
  private sendToNewRelic(type: string, metrics: any): void {
    // TODO: Implement New Relic custom metrics
    // Example: newrelic.recordMetric('Custom/Performance', metrics.duration)
  }

  // Health check
  public getHealthStatus(): { status: 'healthy' | 'unhealthy'; details: Record<string, any> } {
    const summary = this.getPerformanceSummary()
    const currentErrorRate = summary.errorRate
    const systemMetrics = this.trackSystemMetrics()
    
    const memoryUsagePercent = (systemMetrics.memoryUsage.heapUsed / systemMetrics.memoryUsage.heapTotal) * 100
    
    const isHealthy = 
      currentErrorRate < this.thresholds.errorRate &&
      memoryUsagePercent < this.thresholds.memoryUsagePercentage
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      details: {
        errorRate: currentErrorRate,
        memoryUsagePercent,
        uptime: summary.uptime,
        requestCount: summary.requestCount,
        thresholds: this.thresholds
      }
    }
  }

  // Performance alerts
  public checkPerformanceAlerts(): void {
    const health = this.getHealthStatus()
    
    if (health.status === 'unhealthy') {
      logger.error('Performance alert: System is unhealthy', undefined, health.details)
    }
    
    // Check error rate
    if (health.details.errorRate > this.thresholds.errorRate) {
      logger.warn('Performance alert: High error rate detected', {
        currentRate: health.details.errorRate,
        threshold: this.thresholds.errorRate
      })
    }
    
    // Check memory usage
    if (health.details.memoryUsagePercent > this.thresholds.memoryUsagePercentage) {
      logger.warn('Performance alert: High memory usage detected', {
        currentUsage: health.details.memoryUsagePercent,
        threshold: this.thresholds.memoryUsagePercentage
      })
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Utility functions for performance tracking
export function trackAPICall<T>(
  operation: () => Promise<T>,
  endpoint: string,
  method: string,
  userId?: string,
  userAgent?: string,
  ipAddress?: string
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now()
    
    try {
      const result = await operation()
      const duration = Date.now() - startTime
      
      // Estimate response size (rough approximation)
      const responseSize = JSON.stringify(result).length
      
      performanceMonitor.trackAPIRequest({
        endpoint,
        method,
        statusCode: 200,
        duration,
        responseSize,
        timestamp: new Date(),
        userId,
        userAgent,
        ipAddress
      })
      
      resolve(result)
    } catch (error) {
      const duration = Date.now() - startTime
      
      performanceMonitor.trackAPIRequest({
        endpoint,
        method,
        statusCode: 500,
        duration,
        responseSize: 0,
        timestamp: new Date(),
        userId,
        userAgent,
        ipAddress
      })
      
      reject(error)
    }
  })
}

export function trackDatabaseCall<T>(
  operation: () => Promise<T>,
  query: string
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now()
    
    try {
      const result = await operation()
      const duration = Date.now() - startTime
      
      // Estimate row count
      const rows = Array.isArray(result) ? result.length : 1
      
      performanceMonitor.trackDatabaseQuery({
        query,
        duration,
        rows,
        cached: false,
        timestamp: new Date()
      })
      
      resolve(result)
    } catch (error) {
      const duration = Date.now() - startTime
      
      performanceMonitor.trackDatabaseQuery({
        query,
        duration,
        rows: 0,
        cached: false,
        timestamp: new Date()
      })
      
      reject(error)
    }
  })
}

// Performance decorators
export function trackPerformance(endpoint: string, method: string = 'GET') {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      return trackAPICall(
        () => originalMethod.apply(this, args),
        endpoint,
        method
      )
    }
    
    return descriptor
  }
}

export function trackDBPerformance(query: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      return trackDatabaseCall(
        () => originalMethod.apply(this, args),
        query
      )
    }
    
    return descriptor
  }
}

// Web Vitals client-side tracking helper
export const webVitalsTracker = {
  track: (name: string, value: number, id: string, delta: number, rating: 'good' | 'needs-improvement' | 'poor') => {
    // This will be called from client-side code
    fetch('/api/metrics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        value,
        id,
        delta,
        rating,
        navigationType: 'unknown'
      })
    }).catch(error => {
      console.error('Failed to send Web Vitals:', error)
    })
  }
} 