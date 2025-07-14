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
    }
  }
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

// Filter and pagination types
export interface ProjectFilters {
  category_id?: string
  is_published?: boolean
  search?: string
  year?: number
  featured?: boolean
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