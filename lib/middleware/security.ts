// Enterprise Security Middleware for Wolf Studio CMS
// This file provides comprehensive security middleware for Next.js

import { NextRequest, NextResponse } from 'next/server'
import { RateLimitSchema } from '@/lib/validation/schemas'
import { createAppError } from '@/lib/utils/error-handler'
import { ErrorCode } from '@/lib/types/errors'

// Rate limiting store (in production, use Redis or similar)
class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>()
  
  async increment(key: string, limit: number, windowMs: number): Promise<{ count: number; resetTime: number; isLimited: boolean }> {
    const now = Date.now()
    const current = this.store.get(key)
    
    if (!current || now > current.resetTime) {
      const resetTime = now + windowMs
      this.store.set(key, { count: 1, resetTime })
      return { count: 1, resetTime, isLimited: false }
    }
    
    const newCount = current.count + 1
    this.store.set(key, { count: newCount, resetTime: current.resetTime })
    
    return {
      count: newCount,
      resetTime: current.resetTime,
      isLimited: newCount > limit
    }
  }
  
  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const current = this.store.get(key)
    if (!current || Date.now() > current.resetTime) {
      return null
    }
    return current
  }
  
  async reset(key: string): Promise<void> {
    this.store.delete(key)
  }
  
  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

const rateLimitStore = new RateLimitStore()

// Clean up expired rate limit entries every 5 minutes
setInterval(() => {
  rateLimitStore.cleanup()
}, 5 * 60 * 1000)

// Security Headers Configuration
export const securityHeaders = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
  
  // Strict transport security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https: wss:",
    "media-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
}

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number
  max: number
  message?: string
  standardHeaders?: boolean
  legacyHeaders?: boolean
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
}

export const defaultRateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req: NextRequest) => {
    return req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  }
}

// Rate limiting middleware
export async function rateLimit(
  req: NextRequest,
  config: Partial<RateLimitConfig> = {}
): Promise<NextResponse | null> {
  const finalConfig = { ...defaultRateLimitConfig, ...config }
  const key = finalConfig.keyGenerator!(req)
  
  try {
    const result = await rateLimitStore.increment(key, finalConfig.max, finalConfig.windowMs)
    
    if (result.isLimited) {
      const response = NextResponse.json(
        {
          error: {
            code: ErrorCode.RATE_LIMIT_EXCEEDED,
            message: finalConfig.message,
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
          }
        },
        { status: 429 }
      )
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', finalConfig.max.toString())
      response.headers.set('X-RateLimit-Remaining', '0')
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
      response.headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString())
      
      return response
    }
    
    // Add rate limit headers for successful requests
    if (finalConfig.standardHeaders) {
      const remaining = Math.max(0, finalConfig.max - result.count)
      // Headers will be added in the main middleware
    }
    
    return null // No rate limit exceeded
  } catch (error) {
    console.error('Rate limiting error:', error)
    return null // Allow request on error
  }
}

// IP whitelist/blacklist
const ipWhitelist = new Set<string>([
  '127.0.0.1',
  '::1',
  // Add trusted IPs here
])

const ipBlacklist = new Set<string>([
  // Add blocked IPs here
])

export function checkIpAccess(req: NextRequest): boolean {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
  
  if (!ip) return true // Allow if IP cannot be determined
  
  // Check blacklist first
  if (ipBlacklist.has(ip)) {
    return false
  }
  
  // If whitelist is not empty, check whitelist
  if (ipWhitelist.size > 0 && !ipWhitelist.has(ip)) {
    return false
  }
  
  return true
}

// Request validation middleware
export function validateRequest(req: NextRequest): NextResponse | null {
  // Check request method
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
  if (!allowedMethods.includes(req.method)) {
    return NextResponse.json(
      { error: { code: ErrorCode.INVALID_INPUT, message: 'Method not allowed' } },
      { status: 405 }
    )
  }
  
  // Check request size (prevent large payloads)
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    return NextResponse.json(
      { error: { code: ErrorCode.FILE_TOO_LARGE, message: 'Request payload too large' } },
      { status: 413 }
    )
  }
  
  // Check for suspicious patterns in URL
  const url = req.nextUrl.pathname
  const suspiciousPatterns = [
    /\.\./,  // Path traversal
    /\0/,    // Null bytes
    /<script/i,  // XSS attempts
    /javascript:/i,  // JavaScript protocol
    /vbscript:/i,   // VBScript protocol
    /data:/i,       // Data URLs in path
    /\/\//,         // Double slashes
  ]
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      return NextResponse.json(
        { error: { code: ErrorCode.INVALID_INPUT, message: 'Suspicious request pattern detected' } },
        { status: 400 }
      )
    }
  }
  
  return null // Request is valid
}

// CSRF protection
export function generateCsrfToken(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64')
}

export function validateCsrfToken(token: string, sessionToken: string): boolean {
  // Simple CSRF validation - in production, use a more robust implementation
  return token === sessionToken
}

// Content-Type validation
export function validateContentType(req: NextRequest): NextResponse | null {
  const contentType = req.headers.get('content-type')
  
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    if (!contentType) {
      return NextResponse.json(
        { error: { code: ErrorCode.INVALID_INPUT, message: 'Content-Type header is required' } },
        { status: 400 }
      )
    }
    
    const allowedTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
      'text/plain'
    ]
    
    const isAllowed = allowedTypes.some(type => contentType.includes(type))
    if (!isAllowed) {
      return NextResponse.json(
        { error: { code: ErrorCode.INVALID_INPUT, message: 'Unsupported content type' } },
        { status: 415 }
      )
    }
  }
  
  return null
}

// Security headers middleware
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Add cache control for sensitive endpoints
  if (response.url.includes('/api/admin/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }
  
  // Remove server information
  response.headers.delete('server')
  response.headers.delete('x-powered-by')
  
  return response
}

// Main security middleware
export async function securityMiddleware(req: NextRequest): Promise<NextResponse> {
  // Check IP access
  if (!checkIpAccess(req)) {
    return NextResponse.json(
      { error: { code: ErrorCode.FORBIDDEN, message: 'IP address blocked' } },
      { status: 403 }
    )
  }
  
  // Validate request
  const validationError = validateRequest(req)
  if (validationError) {
    return addSecurityHeaders(validationError)
  }
  
  // Validate content type
  const contentTypeError = validateContentType(req)
  if (contentTypeError) {
    return addSecurityHeaders(contentTypeError)
  }
  
  // Apply rate limiting
  const rateLimitError = await rateLimit(req)
  if (rateLimitError) {
    return addSecurityHeaders(rateLimitError)
  }
  
  // Continue with the request
  return NextResponse.next()
}

// Utility functions for specific endpoints
export function createApiRateLimit(config: Partial<RateLimitConfig> = {}) {
  return async (req: NextRequest) => {
    const apiConfig = {
      ...defaultRateLimitConfig,
      max: 1000, // Higher limit for API endpoints
      windowMs: 60 * 60 * 1000, // 1 hour
      ...config
    }
    
    return rateLimit(req, apiConfig)
  }
}

export function createAuthRateLimit(config: Partial<RateLimitConfig> = {}) {
  return async (req: NextRequest) => {
    const authConfig = {
      ...defaultRateLimitConfig,
      max: 5, // Stricter limit for auth endpoints
      windowMs: 15 * 60 * 1000, // 15 minutes
      ...config
    }
    
    return rateLimit(req, authConfig)
  }
}

export function createAdminRateLimit(config: Partial<RateLimitConfig> = {}) {
  return async (req: NextRequest) => {
    const adminConfig = {
      ...defaultRateLimitConfig,
      max: 200, // Moderate limit for admin endpoints
      windowMs: 15 * 60 * 1000, // 15 minutes
      ...config
    }
    
    return rateLimit(req, adminConfig)
  }
}

// Security logging
export function logSecurityEvent(event: string, details: Record<string, any>, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details,
    userAgent: details.userAgent || 'unknown',
    ip: details.ip || 'unknown',
    url: details.url || 'unknown',
  }
  
  switch (severity) {
    case 'low':
      console.info('🔵 [SECURITY-LOW]', logData)
      break
    case 'medium':
      console.warn('🟡 [SECURITY-MEDIUM]', logData)
      break
    case 'high':
      console.error('🔴 [SECURITY-HIGH]', logData)
      break
    case 'critical':
      console.error('🚨 [SECURITY-CRITICAL]', logData)
      // In production, send to security monitoring service
      break
  }
}

// Request sanitization
export function sanitizeRequestData(data: any): any {
  if (typeof data === 'string') {
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim()
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeRequestData)
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeRequestData(value)
    }
    return sanitized
  }
  
  return data
}

// Environment-specific security configuration
export function getSecurityConfig() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    isDevelopment,
    isProduction,
    enableStrictHeaders: isProduction,
    enableRateLimit: !isDevelopment,
    enableIpFiltering: isProduction,
    enableRequestLogging: true,
    enableCsrfProtection: isProduction,
    maxRequestSize: isDevelopment ? 50 * 1024 * 1024 : 10 * 1024 * 1024, // 50MB dev, 10MB prod
    sessionTimeout: isDevelopment ? 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000, // 24h dev, 8h prod
  }
} 