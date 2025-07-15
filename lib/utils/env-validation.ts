// Environment Variable Validation and Security Configuration
// This file validates required environment variables and provides secure defaults

import { EnvironmentSchema } from '@/lib/validation/schemas'

export interface EnvConfig {
  supabase: {
    url: string
    anonKey: string
    serviceRoleKey: string
  }
  app: {
    name: string
    url?: string
    debug: boolean
    enableAnalytics: boolean
  }
  auth: {
    url: string
    secret: string
  }
  security: {
    rateLimitMax: number
    rateLimitWindow: number
    sessionTimeout: number
    maxRequestSize: number
  }
  external: {
    sentryDsn?: string
    databaseUrl?: string
    redisUrl?: string
  }
  smtp: {
    host?: string
    port?: number
    user?: string
    password?: string
  }
}

let envConfig: EnvConfig | null = null

export function validateAndGetEnvConfig(): EnvConfig {
  if (envConfig) {
    return envConfig
  }

  try {
    const env = EnvironmentSchema.parse(process.env)
    
    envConfig = {
      supabase: {
        url: env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
      },
      app: {
        name: env.NEXT_PUBLIC_APP_NAME,
        url: env.NEXT_PUBLIC_APP_URL,
        debug: env.NEXT_PUBLIC_DEBUG,
        enableAnalytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
      },
      auth: {
        url: env.NEXTAUTH_URL,
        secret: env.NEXTAUTH_SECRET,
      },
      security: {
        rateLimitMax: env.RATE_LIMIT_MAX,
        rateLimitWindow: env.RATE_LIMIT_WINDOW,
        sessionTimeout: env.NODE_ENV === 'development' ? 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000,
        maxRequestSize: env.NODE_ENV === 'development' ? 50 * 1024 * 1024 : 10 * 1024 * 1024,
      },
      external: {
        sentryDsn: env.NEXT_PUBLIC_SENTRY_DSN,
        databaseUrl: env.DATABASE_URL,
        redisUrl: env.REDIS_URL,
      },
      smtp: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        user: env.SMTP_USER,
        password: env.SMTP_PASSWORD,
      },
    }
    
    return envConfig
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    
    // Log specific validation errors for debugging
    if (error instanceof Error) {
      console.error('Environment validation error details:', error.message)
    }
    
    // In production, exit the process
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
    
    // In development, return minimal config to allow development
    console.warn('⚠️  Using minimal development configuration')
    return {
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://localhost:3000',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dev-key',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'dev-service-key',
      },
      app: {
        name: 'Wolf Studio (Dev)',
        url: 'http://localhost:3000',
        debug: true,
        enableAnalytics: false,
      },
      auth: {
        url: 'http://localhost:3000',
        secret: 'dev-secret-key-min-32-chars-long',
      },
      security: {
        rateLimitMax: 1000,
        rateLimitWindow: 900,
        sessionTimeout: 24 * 60 * 60 * 1000,
        maxRequestSize: 50 * 1024 * 1024,
      },
      external: {},
      smtp: {},
    }
  }
}

export function getEnvConfig(): EnvConfig {
  if (!envConfig) {
    throw new Error('Environment configuration not initialized. Call validateAndGetEnvConfig() first.')
  }
  return envConfig
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isTest(): boolean {
  return process.env.NODE_ENV === 'test'
}

// Environment-specific security configuration
export function getSecurityLevel(): 'development' | 'staging' | 'production' {
  const env = process.env.NODE_ENV
  
  if (env === 'production') {
    return 'production'
  }
  
  if (env === 'test' || process.env.VERCEL_ENV === 'preview') {
    return 'staging'
  }
  
  return 'development'
}

export function getSecurityConfig() {
  const level = getSecurityLevel()
  
  const configs = {
    development: {
      enableStrictHeaders: false,
      enableRateLimit: false,
      enableIpFiltering: false,
      enableRequestLogging: true,
      enableCsrfProtection: false,
      enableContentSecurityPolicy: false,
      allowedOrigins: ['http://localhost:3000', 'http://localhost:3001'],
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      maxRequestSize: 50 * 1024 * 1024, // 50MB
      rateLimitMax: 1000,
      rateLimitWindow: 60 * 60 * 1000, // 1 hour
    },
    staging: {
      enableStrictHeaders: true,
      enableRateLimit: true,
      enableIpFiltering: false,
      enableRequestLogging: true,
      enableCsrfProtection: true,
      enableContentSecurityPolicy: true,
      allowedOrigins: ['https://wolf-studio-staging.vercel.app'],
      sessionTimeout: 12 * 60 * 60 * 1000, // 12 hours
      maxRequestSize: 25 * 1024 * 1024, // 25MB
      rateLimitMax: 200,
      rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    },
    production: {
      enableStrictHeaders: true,
      enableRateLimit: true,
      enableIpFiltering: true,
      enableRequestLogging: true,
      enableCsrfProtection: true,
      enableContentSecurityPolicy: true,
      allowedOrigins: ['https://wolf-studio.vercel.app'],
      sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
      maxRequestSize: 10 * 1024 * 1024, // 10MB
      rateLimitMax: 100,
      rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    },
  }
  
  return configs[level]
}

// Validate critical environment variables
export function validateCriticalEnvVars(): boolean {
  const critical = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
  ]
  
  const missing = critical.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('❌ Missing critical environment variables:', missing)
    return false
  }
  
  return true
}

// Log environment configuration (without sensitive data)
export function logEnvStatus() {
  const level = getSecurityLevel()
  const config = getSecurityConfig()
  
  console.log(`🔧 Environment: ${level.toUpperCase()}`)
  console.log(`🛡️  Security config:`)
  console.log(`   - Rate limiting: ${config.enableRateLimit ? '✅' : '❌'}`)
  console.log(`   - Strict headers: ${config.enableStrictHeaders ? '✅' : '❌'}`)
  console.log(`   - CSRF protection: ${config.enableCsrfProtection ? '✅' : '❌'}`)
  console.log(`   - IP filtering: ${config.enableIpFiltering ? '✅' : '❌'}`)
  console.log(`   - Request logging: ${config.enableRequestLogging ? '✅' : '❌'}`)
  console.log(`   - Max request size: ${(config.maxRequestSize / 1024 / 1024).toFixed(1)}MB`)
  console.log(`   - Session timeout: ${(config.sessionTimeout / 1000 / 60 / 60).toFixed(1)}h`)
  console.log(`   - Rate limit: ${config.rateLimitMax} req/${(config.rateLimitWindow / 1000 / 60).toFixed(0)}min`)
}

// Initialize environment validation on module load
if (typeof window === 'undefined') {
  validateAndGetEnvConfig()
  logEnvStatus()
} 