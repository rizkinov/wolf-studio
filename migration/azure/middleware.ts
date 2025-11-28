import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

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

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Handle authentication for admin routes
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn && !pathname.startsWith('/admin/login')) {
      const loginUrl = new URL('/admin/login', req.url) // Redirect to our custom login page
      return NextResponse.redirect(loginUrl)
    }
  }

  // Handle API routes
  if (pathname.startsWith('/api/admin/')) {
    if (!isLoggedIn) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  let response = NextResponse.next()
  response = addSecurityHeaders(response)
  return response
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|images|logos|scraped-images|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}