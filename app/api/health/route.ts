// Comprehensive health check endpoint
import { NextRequest, NextResponse } from 'next/server'
import { performanceMonitor } from '@/lib/services/performance-monitor'
import { logger } from '@/lib/services/logger'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Check database connectivity
    const supabase = await createClient()
    const dbHealthCheck = await checkDatabaseHealth(supabase)
    
    // Check system performance
    const performanceHealth = performanceMonitor.getHealthStatus()
    
    // Check memory usage
    const memoryUsage = process.memoryUsage()
    const memoryHealthCheck = checkMemoryHealth(memoryUsage)
    
    // Check system uptime
    const systemUptime = process.uptime()
    
    // Get performance summary
    const performanceSummary = performanceMonitor.getPerformanceSummary()
    
    // Overall health status
    const isHealthy = 
      dbHealthCheck.status === 'healthy' &&
      performanceHealth.status === 'healthy' &&
      memoryHealthCheck.status === 'healthy'
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: systemUptime,
      responseTime: Date.now() - startTime,
      checks: {
        database: dbHealthCheck,
        performance: performanceHealth,
        memory: memoryHealthCheck
      },
      metrics: {
        requests: performanceSummary.requestCount,
        errors: performanceSummary.errorCount,
        errorRate: performanceSummary.errorRate,
        uptime: performanceSummary.uptime
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV
      }
    }
    
    // Log health check
    logger.logHealthCheck('system', isHealthy ? 'healthy' : 'unhealthy', healthData)
    
    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })
    
  } catch (error) {
    const errorData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    }
    
    logger.error('Health check failed', error as Error)
    
    return NextResponse.json(errorData, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })
  }
}

async function checkDatabaseHealth(supabase: any) {
  const startTime = Date.now()
  
  try {
    // Simple query to check database connectivity
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      throw error
    }
    
    const responseTime = Date.now() - startTime
    
    return {
      status: 'healthy' as const,
      responseTime,
      details: {
        connected: true,
        query: 'SELECT count FROM users LIMIT 1'
      }
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return {
      status: 'unhealthy' as const,
      responseTime,
      details: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown database error'
      }
    }
  }
}

function checkMemoryHealth(memoryUsage: NodeJS.MemoryUsage) {
  const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
  const isHealthy = memoryUsagePercent < 80 // 80% threshold
  
  return {
    status: isHealthy ? 'healthy' as const : 'unhealthy' as const,
    details: {
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
      rss: memoryUsage.rss,
      usagePercent: memoryUsagePercent
    }
  }
}

// Lightweight health check for load balancers
export async function HEAD() {
  try {
    const health = performanceMonitor.getHealthStatus()
    
    return new Response(null, {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    return new Response(null, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
} 