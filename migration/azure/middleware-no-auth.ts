// Simplified Middleware - Authentication DISABLED for Testing
// Replace the contents of /middleware.ts with this file to disable login
import { NextRequest, NextResponse } from 'next/server'

// Simple security headers
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  try {
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    response.headers.delete('server')
    response.headers.delete('x-powered-by')
    return response
  } catch (error) {
    return response
  }
}

// Simple rate limiting using in-memory store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function simpleRateLimit(req: NextRequest, max: number = 200, windowMs: number = 15 * 60 * 1000): boolean {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    const current = rateLimitStore.get(ip)
    
    if (!current || now > current.resetTime) {
      rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
      return false
    }
    
    const newCount = current.count + 1
    rateLimitStore.set(ip, { count: newCount, resetTime: current.resetTime })
    
    return newCount > max
  } catch (error) {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  try {
    const correlationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Rate limiting for API routes
    if (pathname.startsWith('/api/')) {
      const isRateLimited = simpleRateLimit(request, 200, 15 * 60 * 1000)
      if (isRateLimited) {
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
    
    // ===========================================
    // AUTHENTICATION DISABLED FOR TESTING
    // All /admin routes are accessible without login
    // ===========================================
    
    // Handle API routes
    if (pathname.startsWith('/api/')) {
      let response = NextResponse.next()
      response = addSecurityHeaders(response)
      response.headers.set('X-Correlation-ID', correlationId)
      
      // Add basic CORS headers
      try {
        const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || '*'
        response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      } catch (error) {
        // Continue without CORS headers if setting fails
      }
      
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: response.headers })
      }
      
      return response
    }
    
    // Handle all other routes (including /admin)
    let response = NextResponse.next()
    response = addSecurityHeaders(response)
    response.headers.set('X-Correlation-ID', correlationId)
    
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    const response = NextResponse.next()
    response.headers.set('X-Correlation-ID', `error-${Date.now()}`)
    return addSecurityHeaders(response)
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|images|logos|scraped-images|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}

