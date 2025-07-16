// Connection warming utility to prevent cold start issues
// This pre-initializes database connections and caches them

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/services/logger'

interface ConnectionHealth {
  isHealthy: boolean
  lastChecked: number
  responseTime: number
  error?: string
}

class ConnectionWarmer {
  private healthCache: Map<string, ConnectionHealth> = new Map()
  private warmupPromise: Promise<void> | null = null
  private readonly cacheTimeout = 5 * 60 * 1000 // 5 minutes

  // Warm up database connections
  async warmupConnections(): Promise<void> {
    // Prevent multiple simultaneous warmups
    if (this.warmupPromise) {
      return this.warmupPromise
    }

    this.warmupPromise = this.performWarmup()
    
    try {
      await this.warmupPromise
    } finally {
      this.warmupPromise = null
    }
  }

  private async performWarmup(): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Warm up database connection
      await this.warmupDatabase()
      
      // Log successful warmup
      logger.info('Connection warmup completed', {
        duration: Date.now() - startTime,
        connections: ['database']
      })
    } catch (error) {
      logger.error('Connection warmup failed', error as Error)
      // Don't throw - let the application continue
    }
  }

  private async warmupDatabase(): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Skip database warmup if we're not in a request context
      // This prevents the cookies context error during build/startup
      if (typeof window !== 'undefined') {
        throw new Error('Database warmup can only run on server side')
      }
      
      let supabase
      try {
        supabase = await createClient()
      } catch (error) {
        // If createClient fails (e.g., cookies context issue), skip warmup
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        if (errorMsg.includes('cookies') || errorMsg.includes('request scope')) {
          throw new Error('Database warmup skipped - not in request context')
        }
        throw error
      }
      
      // Perform a simple query to warm up the connection
      const { data, error } = await supabase
        .from('projects')
        .select('count')
        .limit(1)
      
      if (error) {
        throw new Error(`Database warmup failed: ${error.message}`)
      }
      
      const responseTime = Date.now() - startTime
      
      // Cache the health status
      this.healthCache.set('database', {
        isHealthy: true,
        lastChecked: Date.now(),
        responseTime,
      })
      
      logger.info('Database connection warmed up', { responseTime })
    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Cache the error status
      this.healthCache.set('database', {
        isHealthy: false,
        lastChecked: Date.now(),
        responseTime,
        error: errorMessage
      })
      
      throw error
    }
  }

  // Get connection health status
  getConnectionHealth(connectionType: string): ConnectionHealth | null {
    const health = this.healthCache.get(connectionType)
    
    if (!health) {
      return null
    }
    
    // Check if cached health is still valid
    if (Date.now() - health.lastChecked > this.cacheTimeout) {
      this.healthCache.delete(connectionType)
      return null
    }
    
    return health
  }

  // Check if connections are healthy
  areConnectionsHealthy(): boolean {
    const dbHealth = this.getConnectionHealth('database')
    return dbHealth?.isHealthy ?? false
  }

  // Get warmup status
  isWarmingUp(): boolean {
    return this.warmupPromise !== null
  }

  // Force refresh connection health
  async refreshConnectionHealth(): Promise<void> {
    this.healthCache.clear()
    await this.warmupConnections()
  }
}

// Export singleton instance
export const connectionWarmer = new ConnectionWarmer()

// Utility function to ensure connections are warmed up
export async function ensureConnectionsWarmed(): Promise<void> {
  // Check if we have recent health data
  if (!connectionWarmer.areConnectionsHealthy() && !connectionWarmer.isWarmingUp()) {
    await connectionWarmer.warmupConnections()
  }
}

// Note: Auto-warmup removed to prevent cookies context issues
// Connections will be warmed up during actual requests instead 