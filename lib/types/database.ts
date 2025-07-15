// Database types for Wolf Studio CMS
// These interfaces define the structure of database tables and their relationships

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category
        Insert: CategoryInsert
        Update: CategoryUpdate
      }
      projects: {
        Row: Project
        Insert: ProjectInsert
        Update: ProjectUpdate
      }
      project_images: {
        Row: ProjectImage
        Insert: ProjectImageInsert
        Update: ProjectImageUpdate
      }
      user_profiles: {
        Row: UserProfile
        Insert: UserProfileInsert
        Update: UserProfileUpdate
      }
      activity_logs: {
        Row: ActivityLog
        Insert: ActivityLogInsert
        Update: ActivityLogUpdate
      }
      user_sessions: {
        Row: UserSession
        Insert: UserSessionInsert
        Update: UserSessionUpdate
      }
      user_permissions: {
        Row: UserPermission
        Insert: UserPermissionInsert
        Update: UserPermissionUpdate
      }
    }
    Views: {
      user_activity_summary: {
        Row: UserActivitySummary
      }
    }
    Enums: {
      user_role: 'admin' | 'editor' | 'viewer'
      activity_type: 
        | 'project_created' | 'project_updated' | 'project_deleted' | 'project_published' | 'project_unpublished'
        | 'category_created' | 'category_updated' | 'category_deleted'
        | 'image_uploaded' | 'image_deleted'
        | 'user_created' | 'user_updated' | 'user_deleted' | 'user_role_changed'
        | 'login' | 'logout'
    }
  }
}

// User management types
export type UserRole = 'admin' | 'editor' | 'viewer'
export type ActivityType = 
  | 'project_created' | 'project_updated' | 'project_deleted' | 'project_published' | 'project_unpublished'
  | 'category_created' | 'category_updated' | 'category_deleted'
  | 'image_uploaded' | 'image_deleted'
  | 'user_created' | 'user_updated' | 'user_deleted' | 'user_role_changed'
  | 'login' | 'logout'

// User Profile types
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  department: string | null
  phone: string | null
  bio: string | null
  last_login_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface UserProfileInsert {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  role?: UserRole
  department?: string | null
  phone?: string | null
  bio?: string | null
  last_login_at?: string | null
  is_active?: boolean
  created_at?: string
  updated_at?: string
  created_by?: string | null
}

export interface UserProfileUpdate {
  email?: string
  full_name?: string | null
  avatar_url?: string | null
  role?: UserRole
  department?: string | null
  phone?: string | null
  bio?: string | null
  last_login_at?: string | null
  is_active?: boolean
  updated_at?: string
}

// Activity Log types
export interface ActivityLog {
  id: string
  user_id: string | null
  activity_type: ActivityType
  resource_type: string | null
  resource_id: string | null
  resource_title: string | null
  details: ActivityLogDetails | null
  metadata: ActivityLogMetadata | null
  created_at: string
}

export interface ActivityLogInsert {
  id?: string
  user_id?: string | null
  activity_type: ActivityType
  resource_type?: string | null
  resource_id?: string | null
  resource_title?: string | null
  details?: ActivityLogDetails | null
  metadata?: ActivityLogMetadata | null
  created_at?: string
}

export interface ActivityLogUpdate {
  user_id?: string | null
  activity_type?: ActivityType
  resource_type?: string | null
  resource_id?: string | null
  resource_title?: string | null
  details?: ActivityLogDetails | null
  metadata?: ActivityLogMetadata | null
}

// Activity Log specific types
export interface ActivityLogDetails {
  previous_value?: string | number | boolean | null
  new_value?: string | number | boolean | null
  field_name?: string
  action_context?: string
  error_message?: string
  duration_ms?: number
  file_size?: number
  file_type?: string
  changes?: Record<string, string | number | boolean | null>
  [key: string]: string | number | boolean | null | Record<string, string | number | boolean | null> | undefined
}

export interface ActivityLogMetadata {
  timestamp?: string
  user_agent?: string
  url?: string
  referrer?: string
  ip_address?: string
  session_id?: string
  device_type?: string
  browser_version?: string
  [key: string]: string | undefined
}

// User Session types
export interface UserSession {
  id: string
  user_id: string
  session_token: string
  ip_address: string | null
  user_agent: string | null
  is_active: boolean
  last_activity: string
  expires_at: string
  created_at: string
}

export interface UserSessionInsert {
  id?: string
  user_id: string
  session_token: string
  ip_address?: string | null
  user_agent?: string | null
  is_active?: boolean
  last_activity?: string
  expires_at: string
  created_at?: string
}

export interface UserSessionUpdate {
  session_token?: string
  ip_address?: string | null
  user_agent?: string | null
  is_active?: boolean
  last_activity?: string
  expires_at?: string
}

// User Permission types
export interface UserPermission {
  id: string
  user_id: string
  resource_type: string
  permission_type: string
  granted_by: string | null
  granted_at: string
}

export interface UserPermissionInsert {
  id?: string
  user_id: string
  resource_type: string
  permission_type: string
  granted_by?: string | null
  granted_at?: string
}

export interface UserPermissionUpdate {
  resource_type?: string
  permission_type?: string
  granted_by?: string | null
  granted_at?: string
}

// User Activity Summary View
export interface UserActivitySummary {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  last_login_at: string | null
  is_active: boolean
  total_activities: number
  activities_last_7_days: number
  activities_last_30_days: number
  last_activity_at: string | null
}

// Permission system types
export interface Permission {
  resource: string
  action: string
}

export interface RolePermissions {
  admin: Permission[]
  editor: Permission[]
  viewer: Permission[]
}

// Category types
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface CategoryInsert {
  id?: string
  name: string
  slug: string
  description?: string | null
  created_at?: string
  updated_at?: string
}

export interface CategoryUpdate {
  id?: string
  name?: string
  slug?: string
  description?: string | null
  updated_at?: string
}

// Project types
export interface Project {
  id: string
  title: string
  subtitle: string | null
  slug: string
  banner_image_url: string | null
  order_index: number
  category_id: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  is_published: boolean
  description: ProjectDescription | null
  year: number | null
  size: string | null
  location: string | null
  scope: string | null
  legacy_id: string | null
  featured: boolean
}

export interface ProjectInsert {
  id?: string
  title: string
  subtitle?: string | null
  slug: string
  banner_image_url?: string | null
  order_index?: number
  category_id?: string | null
  published_at?: string | null
  created_at?: string
  updated_at?: string
  is_published?: boolean
  description?: ProjectDescription | null
  year?: number | null
  size?: string | null
  location?: string | null
  scope?: string | null
  legacy_id?: string | null
  featured?: boolean
}

export interface ProjectUpdate {
  id?: string
  title?: string
  subtitle?: string | null
  slug?: string
  banner_image_url?: string | null
  order_index?: number
  category_id?: string | null
  published_at?: string | null
  updated_at?: string
  is_published?: boolean
  description?: ProjectDescription | null
  year?: number | null
  size?: string | null
  location?: string | null
  scope?: string | null
  legacy_id?: string | null
  featured?: boolean
}

// Project description structure (stored as JSONB)
export interface ProjectDescription {
  content: string // Rich text content
  format: 'html' | 'markdown' | 'text'
  meta?: {
    [key: string]: string | number | boolean | null
  }
}

// Project image types
export interface ProjectImage {
  id: string
  project_id: string
  image_url: string
  alt_text: string | null
  caption: string | null
  display_order: number
  image_type: 'banner' | 'gallery'
  created_at: string
  updated_at: string
}

export interface ProjectImageInsert {
  id?: string
  project_id: string
  image_url: string
  alt_text?: string | null
  caption?: string | null
  display_order?: number
  image_type?: 'banner' | 'gallery'
  created_at?: string
  updated_at?: string
}

export interface ProjectImageUpdate {
  id?: string
  project_id?: string
  image_url?: string
  alt_text?: string | null
  caption?: string | null
  display_order?: number
  image_type?: 'banner' | 'gallery'
  updated_at?: string
}

// Extended types with relationships
export interface ProjectWithCategory extends Project {
  category: Category | null
}

export interface ProjectWithImages extends Project {
  images: ProjectImage[]
}

export interface ProjectWithCategoryAndImages extends Project {
  category: Category | null
  images: ProjectImage[]
}

export interface UserProfileWithPermissions extends UserProfile {
  permissions: UserPermission[]
}

export interface ActivityLogWithUser extends ActivityLog {
  user: UserProfile | null
}

// API response types
export interface ProjectsResponse {
  data: ProjectWithCategoryAndImages[]
  count: number
  error: string | null
}

export interface CategoriesResponse {
  data: Category[]
  count: number
  error: string | null
}

export interface UsersResponse {
  data: UserProfile[]
  count: number
  error: string | null
}

export interface ActivityLogsResponse {
  data: ActivityLogWithUser[]
  count: number
  error: string | null
}

// Filter and pagination types
export interface ProjectFilters {
  category_id?: string
  is_published?: boolean
  search?: string
  year?: number
  featured?: boolean
}

export interface UserFilters {
  role?: UserRole
  is_active?: boolean
  search?: string
  department?: string
}

export interface ActivityLogFilters {
  user_id?: string
  activity_type?: ActivityType
  resource_type?: string
  date_from?: string
  date_to?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface SortParams {
  column: string
  order: 'asc' | 'desc'
}

// Form types for admin interface
export interface ProjectFormData {
  title: string
  subtitle?: string
  slug: string
  category_id?: string
  is_published: boolean
  featured: boolean
  year?: number
  size?: string
  location?: string
  scope?: string
  description?: ProjectDescription
  banner_image?: File | null
  gallery_images?: File[]
}

export interface CategoryFormData {
  name: string
  slug: string
  description?: string
}

export interface UserFormData {
  email: string
  full_name?: string
  role: UserRole
  department?: string
  phone?: string
  bio?: string
  is_active: boolean
}

export interface UserProfileFormData {
  full_name?: string
  department?: string
  phone?: string
  bio?: string
  avatar_url?: string
} 