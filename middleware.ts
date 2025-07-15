// Enhanced Enterprise Security Middleware
import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { securityMiddleware, addSecurityHeaders } from '@/lib/middleware/security'
import { validateAndGetEnvConfig } from '@/lib/utils/env-validation'

// Validate environment variables on startup
validateAndGetEnvConfig()

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Apply security middleware first
  const securityResponse = await securityMiddleware(request)
  if (securityResponse.status !== 200) {
    return securityResponse
  }
  
  // Handle authentication for protected routes
  if (pathname.startsWith('/admin')) {
    try {
      // Use the updateSession function for authentication
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
    
    // Add CORS headers for API routes
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    response.headers.set('Access-Control-Max-Age', '86400')
    
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