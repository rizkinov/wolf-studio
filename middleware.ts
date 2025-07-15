// Simplified Middleware for Vercel Edge Runtime
import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

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
  const { pathname } = request.nextUrl
  
  try {
    // Simple rate limiting for API routes
    if (pathname.startsWith('/api/')) {
      const isRateLimited = simpleRateLimit(request, 200, 15 * 60 * 1000) // 200 requests per 15 minutes
      if (isRateLimited) {
        return new NextResponse(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }
    
    // Handle authentication for admin routes
    if (pathname.startsWith('/admin')) {
      try {
        const response = await updateSession(request)
        
        // If updateSession returns a redirect, respect it
        if (response.status === 302 || response.status === 307) {
          return response
        }
        
        // Add security headers to the response
        return addSecurityHeaders(response)
      } catch (error) {
        console.error('Authentication error:', error)
        const loginUrl = new URL('/admin/login', request.url)
        return NextResponse.redirect(loginUrl)
      }
    }
    
    // Handle API routes
    if (pathname.startsWith('/api/')) {
      let response = NextResponse.next()
      
      // Add security headers to API responses
      response = addSecurityHeaders(response)
      
      // Add basic CORS headers
      const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || '*'
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: response.headers })
      }
      
      return response
    }
    
    // Handle public routes
    let response = NextResponse.next()
    
    // Add security headers to all responses
    response = addSecurityHeaders(response)
    
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Return a basic response on any error
    return NextResponse.next()
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