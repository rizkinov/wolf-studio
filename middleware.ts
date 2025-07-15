// Enhanced Middleware with Structured Logging and Performance Monitoring
import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { logger } from '@/lib/services/logger'
import { performanceMonitor } from '@/lib/services/performance-monitor'

// Simple security headers
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// Add security headers to response
function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Remove server information
  response.headers.delete('server')
  response.headers.delete('x-powered-by')
  
  return response
}

// Simple rate limiting using in-memory store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function simpleRateLimit(req: NextRequest, max: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const now = Date.now()
  const current = rateLimitStore.get(ip)
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
    return false // Not rate limited
  }
  
  const newCount = current.count + 1
  rateLimitStore.set(ip, { count: newCount, resetTime: current.resetTime })
  
  return newCount > max // Return true if rate limited
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const { pathname } = request.nextUrl
  
  try {
    // Set up request context for logging
    const correlationId = logger.generateCorrelationId()
    logger.setCorrelationId(correlationId)
    logger.setRequestContext({
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent') || 'unknown',
      ipAddress: request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 'unknown',
      correlationId
    })
    
    // Log incoming request
    logger.logMiddleware('Request received', {
      method: request.method,
      url: request.url,
      correlationId,
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })
    
    // Simple rate limiting for API routes
    if (pathname.startsWith('/api/')) {
      const isRateLimited = simpleRateLimit(request, 200, 15 * 60 * 1000) // 200 requests per 15 minutes
      if (isRateLimited) {
        const duration = Date.now() - startTime
        
        // Log rate limit exceeded
        logger.logSecurity({
          eventType: 'rate_limit',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          details: {
            endpoint: pathname,
            method: request.method
          },
          severity: 'medium'
        })
        
        // Track API performance (failed due to rate limit)
        performanceMonitor.trackAPIRequest({
          endpoint: pathname,
          method: request.method,
          statusCode: 429,
          duration,
          responseSize: 0,
          timestamp: new Date(),
          userAgent: request.headers.get('user-agent') || 'unknown',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        })
        
        return new NextResponse(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          { 
            status: 429, 
            headers: { 
              'Content-Type': 'application/json',
              'X-Correlation-ID': correlationId
            } 
          }
        )
      }
    }
    
    // Handle authentication for admin routes
    if (pathname.startsWith('/admin')) {
      try {
        logger.logAuth('Admin route access attempt', undefined, {
          path: pathname,
          method: request.method
        })
        
        const response = await updateSession(request)
        
        // If updateSession returns a redirect, respect it
        if (response.status === 302 || response.status === 307) {
          logger.logAuth('Admin route redirected to login', undefined, {
            path: pathname,
            redirectTo: response.headers.get('location')
          })
          
          const finalResponse = addSecurityHeaders(response)
          finalResponse.headers.set('X-Correlation-ID', correlationId)
          return finalResponse
        }
        
        logger.logAuth('Admin route access granted', undefined, {
          path: pathname,
          method: request.method
        })
        
        // Add security headers and correlation ID to the response
        const finalResponse = addSecurityHeaders(response)
        finalResponse.headers.set('X-Correlation-ID', correlationId)
        
        // Track performance
        const duration = Date.now() - startTime
        performanceMonitor.trackAPIRequest({
          endpoint: pathname,
          method: request.method,
          statusCode: response.status,
          duration,
          responseSize: 0,
          timestamp: new Date(),
          userAgent: request.headers.get('user-agent') || 'unknown',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        })
        
        return finalResponse
      } catch (error) {
        logger.error('Authentication error in middleware', error as Error, {
          path: pathname,
          method: request.method
        })
        
        const loginUrl = new URL('/admin/login', request.url)
        const response = NextResponse.redirect(loginUrl)
        response.headers.set('X-Correlation-ID', correlationId)
        return addSecurityHeaders(response)
      }
    }
    
    // Handle API routes
    if (pathname.startsWith('/api/')) {
      let response = NextResponse.next()
      
      // Add security headers to API responses
      response = addSecurityHeaders(response)
      response.headers.set('X-Correlation-ID', correlationId)
      
      // Add basic CORS headers
      const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || '*'
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        const duration = Date.now() - startTime
        logger.logAPI('CORS preflight request', request.method, request.url, 200, duration)
        
        performanceMonitor.trackAPIRequest({
          endpoint: pathname,
          method: request.method,
          statusCode: 200,
          duration,
          responseSize: 0,
          timestamp: new Date(),
          userAgent: request.headers.get('user-agent') || 'unknown',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        })
        
        return new Response(null, { status: 200, headers: response.headers })
      }
      
      // Log API request completion
      const duration = Date.now() - startTime
      logger.logAPI('API request processed', request.method, request.url, 200, duration)
      
      // Track API performance
      performanceMonitor.trackAPIRequest({
        endpoint: pathname,
        method: request.method,
        statusCode: 200,
        duration,
        responseSize: 0,
        timestamp: new Date(),
        userAgent: request.headers.get('user-agent') || 'unknown',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      })
      
      return response
    }
    
    // Handle public routes
    let response = NextResponse.next()
    
    // Add security headers to all responses
    response = addSecurityHeaders(response)
    response.headers.set('X-Correlation-ID', correlationId)
    
    // Log public route access
    const duration = Date.now() - startTime
    logger.logMiddleware('Public route processed', {
      path: pathname,
      method: request.method,
      duration
    })
    
    // Track performance for public routes
    performanceMonitor.trackAPIRequest({
      endpoint: pathname,
      method: request.method,
      statusCode: 200,
      duration,
      responseSize: 0,
      timestamp: new Date(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    })
    
    return response
  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Middleware error', error as Error, {
      path: pathname,
      method: request.method,
      duration
    })
    
    // Track error in performance monitor
    performanceMonitor.trackAPIRequest({
      endpoint: pathname,
      method: request.method,
      statusCode: 500,
      duration,
      responseSize: 0,
      timestamp: new Date(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    })
    
    // Return a basic response on any error
    const response = NextResponse.next()
    response.headers.set('X-Correlation-ID', logger.generateCorrelationId())
    return addSecurityHeaders(response)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - images, logos, and other static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|public|images|logos|scraped-images|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
} 