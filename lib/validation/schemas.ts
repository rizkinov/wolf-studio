// Comprehensive Validation Schemas for Wolf Studio CMS
// This file provides Zod schemas for all major data structures

import { z } from 'zod'

// Common validation patterns
const uuidSchema = z.string().uuid('Invalid UUID format')
const emailSchema = z.string().email('Invalid email format')
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')

const urlSchema = z.string().url('Invalid URL format')
const slugSchema = z.string()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be less than 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens')

// File validation
const imageFileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().min(1, 'File size must be greater than 0').max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  type: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp)$/, 'Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed'),
})

// User validation schemas
export const UserRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  role: z.enum(['admin', 'editor', 'viewer'], {
    message: 'Role must be admin, editor, or viewer'
  }).optional().default('viewer'),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

export const UserLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
})

export const UserUpdateSchema = z.object({
  id: uuidSchema,
  email: emailSchema.optional(),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes')
    .optional(),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .optional(),
  role: z.enum(['admin', 'editor', 'viewer']).optional(),
  isActive: z.boolean().optional(),
  lastLoginAt: z.string().datetime().optional(),
})

export const PasswordResetSchema = z.object({
  email: emailSchema,
})

export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword']
})

// Project validation schemas
export const ProjectImageSchema = z.object({
  id: uuidSchema.optional(),
  url: urlSchema,
  alt: z.string()
    .min(1, 'Alt text is required')
    .max(255, 'Alt text must be less than 255 characters'),
  caption: z.string()
    .max(500, 'Caption must be less than 500 characters')
    .optional(),
  imageType: z.enum(['banner', 'gallery'], {
    message: 'Image type must be banner or gallery'
  }),
  displayOrder: z.number().int().min(0, 'Display order must be a non-negative integer').optional(),
  fileSize: z.number().int().min(1, 'File size must be greater than 0').optional(),
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp)$/, 'Invalid MIME type').optional(),
})

export const ProjectCreateSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  shortDescription: z.string()
    .max(500, 'Short description must be less than 500 characters')
    .optional(),
  slug: slugSchema.optional(),
  categoryId: uuidSchema,
  content: z.string()
    .max(10000, 'Content must be less than 10000 characters')
    .optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  publishedAt: z.string().datetime().optional(),
  images: z.array(ProjectImageSchema).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export const ProjectUpdateSchema = ProjectCreateSchema.partial().extend({
  id: uuidSchema,
})

export const ProjectQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  search: z.string().max(100, 'Search query must be less than 100 characters').optional(),
  category: z.string().optional(),
  isPublished: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  sortBy: z.enum(['title', 'created_at', 'updated_at', 'published_at'], {
    message: 'Sort by must be title, created_at, updated_at, or published_at'
  }).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Category validation schemas
export const CategoryCreateSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  slug: slugSchema.optional(),
  parentId: uuidSchema.optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0, 'Sort order must be non-negative').default(0),
  metadata: z.record(z.string(), z.any()).optional(),
})

export const CategoryUpdateSchema = CategoryCreateSchema.partial().extend({
  id: uuidSchema,
})

export const CategoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  search: z.string().max(100, 'Search query must be less than 100 characters').optional(),
  parentId: uuidSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'created_at', 'updated_at', 'sort_order']).default('sort_order'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

// Image upload validation schemas
export const ImageUploadSchema = z.object({
  file: imageFileSchema,
  projectId: uuidSchema.optional(),
  imageType: z.enum(['banner', 'gallery', 'profile', 'general']).default('general'),
  alt: z.string()
    .min(1, 'Alt text is required')
    .max(255, 'Alt text must be less than 255 characters'),
  caption: z.string()
    .max(500, 'Caption must be less than 500 characters')
    .optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export const ImageUpdateSchema = z.object({
  id: uuidSchema,
  alt: z.string()
    .min(1, 'Alt text is required')
    .max(255, 'Alt text must be less than 255 characters')
    .optional(),
  caption: z.string()
    .max(500, 'Caption must be less than 500 characters')
    .optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  displayOrder: z.number().int().min(0, 'Display order must be non-negative').optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

// System configuration validation schemas
export const SystemSettingsSchema = z.object({
  siteName: z.string()
    .min(1, 'Site name is required')
    .max(100, 'Site name must be less than 100 characters'),
  siteDescription: z.string()
    .max(500, 'Site description must be less than 500 characters')
    .optional(),
  siteUrl: urlSchema.optional(),
  adminEmail: emailSchema,
  maintenanceMode: z.boolean().default(false),
  allowRegistration: z.boolean().default(false),
  maxFileSize: z.number().int().min(1, 'Max file size must be at least 1 byte').max(100 * 1024 * 1024, 'Max file size cannot exceed 100MB').default(10 * 1024 * 1024),
  allowedFileTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  enableAnalytics: z.boolean().default(true),
  enableBackups: z.boolean().default(true),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
  timezone: z.string().default('UTC'),
  theme: z.enum(['wolf-studio', 'cbre']).default('wolf-studio'),
  features: z.object({
    userManagement: z.boolean().default(true),
    projectManagement: z.boolean().default(true),
    analytics: z.boolean().default(true),
    fileManagement: z.boolean().default(true),
    notifications: z.boolean().default(true),
  }).default({
    userManagement: true,
    projectManagement: true,
    analytics: true,
    fileManagement: true,
    notifications: true,
  }),
})

// API request validation schemas
export const ApiRequestSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.any().optional(),
  query: z.record(z.string(), z.string()).optional(),
  params: z.record(z.string(), z.string()).optional(),
})

// Environment validation schema
export const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  NEXTAUTH_URL: z.string().url('Invalid NextAuth URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Wolf Studio'),
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL').optional(),
  NEXT_PUBLIC_DEBUG: z.coerce.boolean().default(false),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.coerce.boolean().default(true),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url('Invalid Sentry DSN').optional(),
  DATABASE_URL: z.string().url('Invalid database URL').optional(),
  REDIS_URL: z.string().url('Invalid Redis URL').optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().int().min(1).default(900), // 15 minutes
})

// Rate limiting validation
export const RateLimitSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  limit: z.number().int().min(1, 'Limit must be at least 1').default(100),
  window: z.number().int().min(1, 'Window must be at least 1 second').default(900), // 15 minutes
  skipSuccessful: z.boolean().default(false),
  skipFailedRequests: z.boolean().default(false),
})

// Webhook validation schemas
export const WebhookSchema = z.object({
  url: urlSchema,
  secret: z.string().min(16, 'Webhook secret must be at least 16 characters'),
  events: z.array(z.string()).min(1, 'At least one event must be specified'),
  isActive: z.boolean().default(true),
  retryCount: z.number().int().min(0).max(10).default(3),
  timeout: z.number().int().min(1000).max(30000).default(10000), // 10 seconds
})

// Content Security Policy validation
export const CSPDirectiveSchema = z.object({
  'default-src': z.array(z.string()).default(["'self'"]),
  'script-src': z.array(z.string()).default(["'self'", "'unsafe-inline'"]),
  'style-src': z.array(z.string()).default(["'self'", "'unsafe-inline'"]),
  'img-src': z.array(z.string()).default(["'self'", 'data:', 'https:']),
  'font-src': z.array(z.string()).default(["'self'", 'data:']),
  'connect-src': z.array(z.string()).default(["'self'"]),
  'media-src': z.array(z.string()).default(["'self'"]),
  'object-src': z.array(z.string()).default(["'none'"]),
  'base-uri': z.array(z.string()).default(["'self'"]),
  'form-action': z.array(z.string()).default(["'self'"]),
  'frame-ancestors': z.array(z.string()).default(["'none'"]),
  'upgrade-insecure-requests': z.boolean().default(true),
})

// Export type inference helpers
export type UserRegistration = z.infer<typeof UserRegistrationSchema>
export type UserLogin = z.infer<typeof UserLoginSchema>
export type UserUpdate = z.infer<typeof UserUpdateSchema>
export type PasswordReset = z.infer<typeof PasswordResetSchema>
export type PasswordChange = z.infer<typeof PasswordChangeSchema>
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>
export type ProjectQuery = z.infer<typeof ProjectQuerySchema>
export type ProjectImage = z.infer<typeof ProjectImageSchema>
export type CategoryCreate = z.infer<typeof CategoryCreateSchema>
export type CategoryUpdate = z.infer<typeof CategoryUpdateSchema>
export type CategoryQuery = z.infer<typeof CategoryQuerySchema>
export type ImageUpload = z.infer<typeof ImageUploadSchema>
export type ImageUpdate = z.infer<typeof ImageUpdateSchema>
export type SystemSettings = z.infer<typeof SystemSettingsSchema>
export type ApiRequest = z.infer<typeof ApiRequestSchema>
export type Environment = z.infer<typeof EnvironmentSchema>
export type RateLimit = z.infer<typeof RateLimitSchema>
export type Webhook = z.infer<typeof WebhookSchema>
export type CSPDirective = z.infer<typeof CSPDirectiveSchema>

// Validation helper functions
export function validateEnvironment() {
  try {
    return EnvironmentSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    process.exit(1)
  }
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

export function validateAndSanitizeInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`)
  }
  
  // Sanitize string fields
  const sanitized = JSON.parse(JSON.stringify(result.data), (key, value) => {
    if (typeof value === 'string') {
      return sanitizeHtml(value.trim())
    }
    return value
  })
  
  return sanitized
} 