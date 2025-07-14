// Database service layer for Wolf Studio CMS
// This module provides CRUD operations for all database entities

import { createClient } from '@/lib/supabase/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type {
  Project,
  ProjectInsert,
  ProjectUpdate,
  ProjectWithCategoryAndImages,
  Category,
  CategoryInsert,
  CategoryUpdate,
  ProjectImage,
  ProjectImageInsert,
  ProjectImageUpdate,
  ProjectFilters,
  PaginationParams,
  SortParams,
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
  UserProfileWithPermissions,
  ActivityLog,
  ActivityLogInsert,
  ActivityLogWithUser,
  UserSession,
  UserSessionInsert,
  UserSessionUpdate,
  UserPermission,
  UserPermissionInsert,
  UserPermissionUpdate,
  ActivityLogFilters,
  UserFilters,
  UserRole,
  ActivityType,
  UserActivitySummary,
} from '@/lib/types/database'

// Get the client-side Supabase client
const getSupabaseClient = () => {
  return createClient()
}

// Project Service
export class ProjectService {
  
  // Get all projects with optional filtering, pagination, and sorting
  static async getProjects(
    filters?: ProjectFilters,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<{ data: ProjectWithCategoryAndImages[]; count: number; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('projects')
        .select(`
          *,
          category:categories(*),
          images:project_images(*)
        `)

      // Apply filters
      if (filters) {
        if (filters.category_id) {
          query = query.eq('category_id', filters.category_id)
        }
        if (filters.is_published !== undefined) {
          query = query.eq('is_published', filters.is_published)
        }
        if (filters.featured !== undefined) {
          query = query.eq('featured', filters.featured)
        }
        if (filters.year) {
          query = query.eq('year', filters.year)
        }
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,subtitle.ilike.%${filters.search}%`)
        }
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.column, { ascending: sort.order === 'asc' })
      } else {
        query = query.order('order_index', { ascending: true })
      }

      // Apply pagination
      if (pagination) {
        const { page = 1, limit = 10 } = pagination
        const offset = (page - 1) * limit
        query = query.range(offset, offset + limit - 1)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching projects:', error)
        return { data: [], count: 0, error: error.message }
      }

      return { data: data || [], count: count || 0, error: null }
    } catch (error) {
      console.error('Error in getProjects:', error)
      return { data: [], count: 0, error: 'Failed to fetch projects' }
    }
  }

  // Get a single project by ID or slug
  static async getProject(
    identifier: string,
    bySlug = false
  ): Promise<{ data: ProjectWithCategoryAndImages | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      const column = bySlug ? 'slug' : 'id'
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          category:categories(*),
          images:project_images(*)
        `)
        .eq(column, identifier)
        .single()

      if (error) {
        console.error('Error fetching project:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in getProject:', error)
      return { data: null, error: 'Failed to fetch project' }
    }
  }

  // Create a new project
  static async createProject(
    projectData: ProjectInsert
  ): Promise<{ data: Project | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single()

      if (error) {
        console.error('Error creating project:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in createProject:', error)
      return { data: null, error: 'Failed to create project' }
    }
  }

  // Update an existing project
  static async updateProject(
    id: string,
    updates: ProjectUpdate
  ): Promise<{ data: Project | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating project:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in updateProject:', error)
      return { data: null, error: 'Failed to update project' }
    }
  }

  // Delete a project
  static async deleteProject(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting project:', error)
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error in deleteProject:', error)
      return { error: 'Failed to delete project' }
    }
  }

  // Reorder projects
  static async reorderProjects(
    projectOrders: { id: string; order_index: number }[]
  ): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const updates = projectOrders.map(({ id, order_index }) => 
        supabase.from('projects').update({ order_index }).eq('id', id)
      )

      const results = await Promise.all(updates)
      
      for (const { error } of results) {
        if (error) {
          console.error('Error reordering projects:', error)
          return { error: error.message }
        }
      }

      return { error: null }
    } catch (error) {
      console.error('Error in reorderProjects:', error)
      return { error: 'Failed to reorder projects' }
    }
  }

  // Duplicate project
  static async duplicateProject(
    projectId: string,
    newTitle?: string
  ): Promise<{ data: Project | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      // Get the original project
      const { data: originalProject, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (fetchError || !originalProject) {
        return { data: null, error: 'Project not found' }
      }

      // Create new project data
      const duplicateTitle = newTitle || `${originalProject.title} (Copy)`
      const duplicateSlug = `${originalProject.slug}-copy-${Date.now()}`
      
      // Get the highest order_index to place the duplicate at the end
      const { data: maxOrder } = await supabase
        .from('projects')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1)
        .single()

      const nextOrderIndex = (maxOrder?.order_index || 0) + 1

      const duplicateData: ProjectInsert = {
        title: duplicateTitle,
        subtitle: originalProject.subtitle,
        slug: duplicateSlug,
        banner_image_url: originalProject.banner_image_url,
        category_id: originalProject.category_id,
        description: originalProject.description,
        year: originalProject.year,
        size: originalProject.size,
        location: originalProject.location,
        scope: originalProject.scope,
        is_published: false, // Duplicates should be drafts by default
        featured: false,
        order_index: nextOrderIndex,
        legacy_id: null // Reset legacy_id for duplicates
      }

      const { data: newProject, error: insertError } = await supabase
        .from('projects')
        .insert(duplicateData)
        .select()
        .single()

      if (insertError) {
        console.error('Error duplicating project:', insertError)
        return { data: null, error: insertError.message }
      }

      return { data: newProject, error: null }
    } catch (error) {
      console.error('Error in duplicateProject:', error)
      return { data: null, error: 'Failed to duplicate project' }
    }
  }

  // Bulk update projects
  static async bulkUpdateProjects(
    projectIds: string[],
    updates: Partial<ProjectUpdate>
  ): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .in('id', projectIds)

      if (error) {
        console.error('Error bulk updating projects:', error)
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error in bulkUpdateProjects:', error)
      return { error: 'Failed to bulk update projects' }
    }
  }

  // Get projects by IDs
  static async getProjectsByIds(
    projectIds: string[]
  ): Promise<{ data: ProjectWithCategoryAndImages[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          category:categories(*),
          images:project_images(*)
        `)
        .in('id', projectIds)
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Error fetching projects by IDs:', error)
        return { data: [], error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error in getProjectsByIds:', error)
      return { data: [], error: 'Failed to fetch projects' }
    }
  }
}

// Analytics Service
export class AnalyticsService {
  
  // Get overall dashboard statistics
  static async getDashboardStats(): Promise<{ 
    data: {
      totalProjects: number
      publishedProjects: number
      draftProjects: number
      featuredProjects: number
      totalCategories: number
      recentProjects: number
      projectsByCategory: { category: string; count: number }[]
      projectsByYear: { year: number; count: number }[]
    } | null
    error: string | null 
  }> {
    try {
      const supabase = getSupabaseClient()
      
      // Get total projects
      const { count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
      
      // Get published projects
      const { count: publishedProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
      
      // Get draft projects
      const { count: draftProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', false)
      
      // Get featured projects
      const { count: featuredProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('featured', true)
      
      // Get total categories
      const { count: totalCategories } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
      
      // Get recent projects (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { count: recentProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())
      
      // Get projects by category
      const { data: categoryData } = await supabase
        .from('projects')
        .select(`
          category_id,
          category:categories(name)
        `)
        .not('category_id', 'is', null)
      
      const projectsByCategory = categoryData?.reduce((acc: { category: string; count: number }[], project) => {
        const categoryName = (project.category as unknown as { name: string } | null)?.name || 'Uncategorized'
        const existing = acc.find(item => item.category === categoryName)
        if (existing) {
          existing.count++
        } else {
          acc.push({ category: categoryName, count: 1 })
        }
        return acc
      }, []) || []
      
      // Get projects by year
      const { data: yearData } = await supabase
        .from('projects')
        .select('year')
        .not('year', 'is', null)
      
      const projectsByYear = yearData?.reduce((acc: { year: number; count: number }[], project) => {
        const year = project.year
        if (year) {
          const existing = acc.find(item => item.year === year)
          if (existing) {
            existing.count++
          } else {
            acc.push({ year, count: 1 })
          }
        }
        return acc
      }, []).sort((a, b) => a.year - b.year) || []
      
      return {
        data: {
          totalProjects: totalProjects || 0,
          publishedProjects: publishedProjects || 0,
          draftProjects: draftProjects || 0,
          featuredProjects: featuredProjects || 0,
          totalCategories: totalCategories || 0,
          recentProjects: recentProjects || 0,
          projectsByCategory,
          projectsByYear
        },
        error: null
      }
    } catch (error) {
      console.error('Error in getDashboardStats:', error)
      return { data: null, error: 'Failed to get dashboard statistics' }
    }
  }
  
  // Get project performance metrics
  static async getProjectPerformance(): Promise<{
    data: {
      id: string
      title: string
      slug: string
      is_published: boolean
      featured: boolean
      category: string | null
      created_at: string
      updated_at: string
      views: number
      engagement: number
    }[] | null
    error: string | null
  }> {
    try {
      const supabase = getSupabaseClient()
      
      // Get projects with category info
      const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          slug,
          is_published,
          featured,
          created_at,
          updated_at,
          category:categories(name)
        `)
        .order('updated_at', { ascending: false })
        .limit(1000)
      
      if (projectError) {
        console.error('Error fetching projects:', projectError)
        return { data: null, error: projectError.message }
      }
      
      // Get all analytics data
      const { data: analytics, error: analyticsError } = await supabase
        .from('project_analytics')
        .select('project_id, total_views, unique_visitors, average_time_on_page')
      
      if (analyticsError) {
        console.error('Error fetching analytics:', analyticsError)
        return { data: null, error: analyticsError.message }
      }
      
      // Create analytics lookup map
      const analyticsMap = new Map()
      analytics?.forEach(item => {
        analyticsMap.set(item.project_id, item)
      })
      
      // Combine projects with analytics data
      const performanceData = projects?.map(project => {
        const projectAnalytics = analyticsMap.get(project.id) || {
          total_views: 0,
          unique_visitors: 0,
          average_time_on_page: 0
        }
        
        // Calculate engagement score based on views and time on page
        const engagement = projectAnalytics.total_views > 0 
          ? Math.min(100, Math.round(
              (projectAnalytics.unique_visitors / Math.max(projectAnalytics.total_views, 1)) * 100 +
              (projectAnalytics.average_time_on_page / 60) * 10 // Time in minutes as engagement factor
            ))
          : 0
        
        return {
          ...project,
          category: (project.category as unknown as { name: string } | null)?.name || null,
          views: projectAnalytics.total_views || 0,
          engagement: engagement
        }
      }) || []
      
      return { data: performanceData, error: null }
    } catch (error) {
      console.error('Error in getProjectPerformance:', error)
      return { data: null, error: 'Failed to get project performance' }
    }
  }
  
  // Get category usage statistics
  static async getCategoryStats(): Promise<{
    data: {
      id: string
      name: string
      slug: string
      projectCount: number
      publishedCount: number
      draftCount: number
      featuredCount: number
      averageViews?: number
      recentActivity: string
    }[] | null
    error: string | null
  }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data: categories, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (categoryError) {
        console.error('Error fetching categories:', categoryError)
        return { data: null, error: categoryError.message }
      }
      
      const categoryStats = await Promise.all(categories?.map(async (category) => {
        // Get total projects in category
        const { count: projectCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
        
        // Get published projects in category
        const { count: publishedCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('is_published', true)
        
        // Get draft projects in category
        const { count: draftCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('is_published', false)
        
        // Get featured projects in category
        const { count: featuredCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('featured', true)
        
        // Get most recent project in category
        const { data: recentProject } = await supabase
          .from('projects')
          .select('created_at')
          .eq('category_id', category.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        const recentActivity = recentProject 
          ? new Date(recentProject.created_at).toLocaleDateString()
          : 'No projects'
        
        // Get average views for projects in this category
        const { data: categoryAnalytics } = await supabase
          .from('project_analytics')
          .select('total_views')
          .in('project_id', 
            await supabase
              .from('projects')
              .select('id')
              .eq('category_id', category.id)
              .then(({ data }) => data?.map(p => p.id) || [])
          )
        
        const averageViews = categoryAnalytics && categoryAnalytics.length > 0
          ? Math.round(categoryAnalytics.reduce((sum, p) => sum + (p.total_views || 0), 0) / categoryAnalytics.length)
          : 0
        
        return {
          ...category,
          projectCount: projectCount || 0,
          publishedCount: publishedCount || 0,
          draftCount: draftCount || 0,
          featuredCount: featuredCount || 0,
          averageViews,
          recentActivity
        }
      }) || [])
      
      return { data: categoryStats, error: null }
    } catch (error) {
      console.error('Error in getCategoryStats:', error)
      return { data: null, error: 'Failed to get category statistics' }
    }
  }
  
  // Export analytics data
  static async exportData(format: 'csv' | 'json' = 'csv'): Promise<{
    data: string | null
    error: string | null
  }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          subtitle,
          slug,
          is_published,
          featured,
          year,
          size,
          location,
          scope,
          created_at,
          updated_at,
          category:categories(name)
        `)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching data for export:', error)
        return { data: null, error: error.message }
      }
      
      const exportData = projects?.map(project => ({
        ...project,
        category: (project.category as unknown as { name: string } | null)?.name || 'Uncategorized',
        views: Math.floor(Math.random() * 5000) + 100, // Mock data
        engagement: Math.floor(Math.random() * 80) + 20 // Mock data
      })) || []
      
      if (format === 'json') {
        return { data: JSON.stringify(exportData, null, 2), error: null }
      }
      
      // CSV format
      if (exportData.length === 0) {
        return { data: 'No data to export', error: null }
      }
      
      const headers = Object.keys(exportData[0]).join(',')
      const rows = exportData.map(item => 
        Object.values(item).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      )
      
      const csv = [headers, ...rows].join('\n')
      return { data: csv, error: null }
    } catch (error) {
      console.error('Error in exportData:', error)
      return { data: null, error: 'Failed to export data' }
    }
  }
}

// Category Service
export class CategoryService {
  
  // Get all categories
  static async getCategories(): Promise<{ data: Category[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching categories:', error)
        return { data: [], error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error in getCategories:', error)
      return { data: [], error: 'Failed to fetch categories' }
    }
  }

  // Get a single category by ID or slug
  static async getCategory(
    identifier: string,
    bySlug = false
  ): Promise<{ data: Category | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      const column = bySlug ? 'slug' : 'id'
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq(column, identifier)
        .single()

      if (error) {
        console.error('Error fetching category:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in getCategory:', error)
      return { data: null, error: 'Failed to fetch category' }
    }
  }

  // Create a new category
  static async createCategory(
    categoryData: CategoryInsert
  ): Promise<{ data: Category | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single()

      if (error) {
        console.error('Error creating category:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in createCategory:', error)
      return { data: null, error: 'Failed to create category' }
    }
  }

  // Update an existing category
  static async updateCategory(
    id: string,
    updates: CategoryUpdate
  ): Promise<{ data: Category | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating category:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in updateCategory:', error)
      return { data: null, error: 'Failed to update category' }
    }
  }

  // Delete a category
  static async deleteCategory(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting category:', error)
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error in deleteCategory:', error)
      return { error: 'Failed to delete category' }
    }
  }
}

// Project Image Service
export class ProjectImageService {
  
  // Get images for a project
  static async getProjectImages(
    projectId: string
  ): Promise<{ data: ProjectImage[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('project_images')
        .select('*')
        .eq('project_id', projectId)
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Error fetching project images:', error)
        return { data: [], error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error in getProjectImages:', error)
      return { data: [], error: 'Failed to fetch project images' }
    }
  }

  // Add an image to a project
  static async addProjectImage(
    imageData: ProjectImageInsert
  ): Promise<{ data: ProjectImage | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('project_images')
        .insert(imageData)
        .select()
        .single()

      if (error) {
        console.error('Error adding project image:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in addProjectImage:', error)
      return { data: null, error: 'Failed to add project image' }
    }
  }

  // Update a project image
  static async updateProjectImage(
    id: string,
    updates: ProjectImageUpdate
  ): Promise<{ data: ProjectImage | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('project_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating project image:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in updateProjectImage:', error)
      return { data: null, error: 'Failed to update project image' }
    }
  }

  // Delete a project image
  static async deleteProjectImage(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('project_images')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting project image:', error)
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error in deleteProjectImage:', error)
      return { error: 'Failed to delete project image' }
    }
  }

  // Reorder project images
  static async reorderProjectImages(
    imageOrders: { id: string; display_order: number }[]
  ): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const updates = imageOrders.map(({ id, display_order }) => 
        supabase.from('project_images').update({ display_order }).eq('id', id)
      )

      const results = await Promise.all(updates)
      
      for (const { error } of results) {
        if (error) {
          console.error('Error reordering project images:', error)
          return { error: error.message }
        }
      }

      return { error: null }
    } catch (error) {
      console.error('Error in reorderProjectImages:', error)
      return { error: 'Failed to reorder project images' }
    }
  }
}

// User Profile Service
export class UserService {
  
  // Get all users with optional filtering and pagination
  static async getUsers(
    filters?: UserFilters,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<{ data: UserProfile[]; count: number; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      // Create admin client to bypass RLS policies
      const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      
      let query = adminSupabase
        .from('user_profiles')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters) {
        if (filters.role) {
          query = query.eq('role', filters.role)
        }
        if (filters.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active)
        }
        if (filters.search) {
          query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
        }
        if (filters.department) {
          query = query.eq('department', filters.department)
        }
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.column, { ascending: sort.order === 'asc' })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // Apply pagination
      if (pagination) {
        const offset = pagination.offset ?? (pagination.page ? (pagination.page - 1) * (pagination.limit ?? 10) : 0)
        const limit = pagination.limit ?? 10
        query = query.range(offset, offset + limit - 1)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching users:', error)
        return { data: [], count: 0, error: error.message }
      }

      return { data: data || [], count: count || 0, error: null }
    } catch (error) {
      console.error('Error in getUsers:', error)
      return { data: [], count: 0, error: 'Failed to fetch users' }
    }
  }

  // Get a single user profile by ID
  static async getUserProfile(userId: string): Promise<{ data: UserProfileWithPermissions | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      // Create admin client to bypass RLS policies
      const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      
      const { data: profile, error: profileError } = await adminSupabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        return { data: null, error: profileError.message }
      }

      const { data: permissions, error: permissionsError } = await adminSupabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)

      if (permissionsError) {
        console.error('Error fetching user permissions:', permissionsError)
        return { data: null, error: permissionsError.message }
      }

      const userWithPermissions: UserProfileWithPermissions = {
        ...profile,
        permissions: permissions || []
      }

      return { data: userWithPermissions, error: null }
    } catch (error) {
      console.error('Error in getUserProfile:', error)
      return { data: null, error: 'Failed to fetch user profile' }
    }
  }

  // Update user profile
  static async updateUserProfile(
    userId: string,
    updates: UserProfileUpdate
  ): Promise<{ data: UserProfile | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in updateUserProfile:', error)
      return { data: null, error: 'Failed to update user profile' }
    }
  }

  // Create new user profile (admin only)
  static async createUserProfile(
    profileData: UserProfileInsert
  ): Promise<{ data: UserProfile | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in createUserProfile:', error)
      return { data: null, error: 'Failed to create user profile' }
    }
  }

  // Deactivate user (soft delete)
  static async deactivateUser(userId: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) {
        console.error('Error deactivating user:', error)
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error in deactivateUser:', error)
      return { error: 'Failed to deactivate user' }
    }
  }

  // Get user activity summary
  static async getUserActivitySummary(): Promise<{ data: UserActivitySummary[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      // Create admin client to bypass RLS policies
      const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      
      // First try to use the view if it exists
      const { data: viewData, error: viewError } = await adminSupabase
        .from('user_activity_summary')
        .select('*')
        .order('last_activity_at', { ascending: false, nullsFirst: false })

      // If view exists and works, return the data
      if (!viewError && viewData) {
        return { data: viewData, error: null }
      }

      // If view doesn't exist, build the query manually
      console.log('user_activity_summary view not found, building query manually...')
      
      // Get all users first
      const { data: users, error: usersError } = await adminSupabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) {
        console.error('Error fetching users:', usersError)
        return { data: [], error: usersError.message }
      }

      // Get activity logs for all users
      const { data: activities, error: activitiesError } = await adminSupabase
        .from('activity_logs')
        .select('user_id, created_at')
        .order('created_at', { ascending: false })

      if (activitiesError) {
        console.log('activity_logs table not found, proceeding with zero activities')
        // If activity_logs doesn't exist, return users with zero activities
        const summaryData = users.map(user => ({
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          last_login_at: user.last_login_at,
          is_active: user.is_active,
          total_activities: 0,
          activities_last_7_days: 0,
          activities_last_30_days: 0,
          last_activity_at: null
        }))
        return { data: summaryData, error: null }
      }

      // Build activity summary manually
      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const summaryData = users.map(user => {
        const userActivities = activities.filter(activity => activity.user_id === user.id)
        
        const totalActivities = userActivities.length
        const activitiesLast7Days = userActivities.filter(activity => 
          new Date(activity.created_at) > sevenDaysAgo
        ).length
        const activitiesLast30Days = userActivities.filter(activity => 
          new Date(activity.created_at) > thirtyDaysAgo
        ).length
        
        const lastActivity = userActivities.length > 0 ? userActivities[0].created_at : null

        return {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          last_login_at: user.last_login_at,
          is_active: user.is_active,
          total_activities: totalActivities,
          activities_last_7_days: activitiesLast7Days,
          activities_last_30_days: activitiesLast30Days,
          last_activity_at: lastActivity
        }
      })

      return { data: summaryData, error: null }
    } catch (error) {
      console.error('Error in getUserActivitySummary:', error)
      return { data: [], error: 'Failed to fetch user activity summary' }
    }
  }
}

// Activity Log Service
export class ActivityLogService {
  
  // Get activity logs with filtering and pagination
  static async getActivityLogs(
    filters?: ActivityLogFilters,
    pagination?: PaginationParams
  ): Promise<{ data: ActivityLogWithUser[]; count: number; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          user:user_profiles(id, email, full_name, role)
        `, { count: 'exact' })

      // Apply filters
      if (filters) {
        if (filters.user_id) {
          query = query.eq('user_id', filters.user_id)
        }
        if (filters.activity_type) {
          query = query.eq('activity_type', filters.activity_type)
        }
        if (filters.resource_type) {
          query = query.eq('resource_type', filters.resource_type)
        }
        if (filters.date_from) {
          query = query.gte('created_at', filters.date_from)
        }
        if (filters.date_to) {
          query = query.lte('created_at', filters.date_to)
        }
      }

      // Apply sorting
      query = query.order('created_at', { ascending: false })

      // Apply pagination
      if (pagination) {
        const offset = pagination.offset ?? (pagination.page ? (pagination.page - 1) * (pagination.limit ?? 10) : 0)
        const limit = pagination.limit ?? 50
        query = query.range(offset, offset + limit - 1)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching activity logs:', error)
        return { 
          data: [], 
          count: 0, 
          error: error.message || error.details || 'Failed to fetch activity logs from database' 
        }
      }

      return { data: data || [], count: count || 0, error: null }
    } catch (error) {
      console.error('Error in getActivityLogs:', error)
      return { 
        data: [], 
        count: 0, 
        error: error instanceof Error ? error.message : 'Failed to fetch activity logs' 
      }
    }
  }

  // Log an activity (called via database function)
  static async logActivity(
    userId: string,
    activityType: ActivityType,
    resourceType?: string,
    resourceId?: string,
    resourceTitle?: string,
    details?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<{ data: string | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase.rpc('log_activity', {
        p_user_id: userId,
        p_activity_type: activityType,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_resource_title: resourceTitle,
        p_details: details,
        p_metadata: metadata
      })

      if (error) {
        console.error('Error logging activity:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in logActivity:', error)
      return { data: null, error: 'Failed to log activity' }
    }
  }

  // Clean up old activity logs
  static async cleanupOldLogs(): Promise<{ data: number | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase.rpc('cleanup_old_activity_logs')

      if (error) {
        console.error('Error cleaning up old logs:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in cleanupOldLogs:', error)
      return { data: null, error: 'Failed to cleanup old logs' }
    }
  }
}

// Permission Service
export class PermissionService {
  
  // Check if user has permission
  static async hasPermission(
    userId: string,
    resourceType: string,
    permissionType: string
  ): Promise<{ data: boolean; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase.rpc('has_permission', {
        p_user_id: userId,
        p_resource_type: resourceType,
        p_permission_type: permissionType
      })

      if (error) {
        console.error('Error checking permission:', error)
        return { data: false, error: error.message }
      }

      return { data: data || false, error: null }
    } catch (error) {
      console.error('Error in hasPermission:', error)
      return { data: false, error: 'Failed to check permission' }
    }
  }

  // Grant permission to user
  static async grantPermission(
    userId: string,
    resourceType: string,
    permissionType: string,
    grantedBy: string
  ): Promise<{ data: UserPermission | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const permissionData: UserPermissionInsert = {
        user_id: userId,
        resource_type: resourceType,
        permission_type: permissionType,
        granted_by: grantedBy
      }

      const { data, error } = await supabase
        .from('user_permissions')
        .insert(permissionData)
        .select()
        .single()

      if (error) {
        console.error('Error granting permission:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in grantPermission:', error)
      return { data: null, error: 'Failed to grant permission' }
    }
  }

  // Revoke permission from user
  static async revokePermission(
    userId: string,
    resourceType: string,
    permissionType: string
  ): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('resource_type', resourceType)
        .eq('permission_type', permissionType)

      if (error) {
        console.error('Error revoking permission:', error)
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error in revokePermission:', error)
      return { error: 'Failed to revoke permission' }
    }
  }

  // Get user permissions
  static async getUserPermissions(userId: string): Promise<{ data: UserPermission[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching user permissions:', error)
        return { data: [], error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error in getUserPermissions:', error)
      return { data: [], error: 'Failed to fetch user permissions' }
    }
  }

  // Update user role and sync permissions
  static async updateUserRole(
    userId: string,
    newRole: UserRole,
    updatedBy: string
  ): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      // Update user role
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating user role:', updateError)
        return { error: updateError.message }
      }

      // Log the role change
      await ActivityLogService.logActivity(
        updatedBy,
        'user_role_changed',
        'user',
        userId,
        'User Role Update',
        { new_role: newRole },
        { updated_by: updatedBy }
      )

      return { error: null }
    } catch (error) {
      console.error('Error in updateUserRole:', error)
      return { error: 'Failed to update user role' }
    }
  }
}

// Session Service
export class SessionService {
  
  // Get user sessions
  static async getUserSessions(userId: string): Promise<{ data: UserSession[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity', { ascending: false })

      if (error) {
        console.error('Error fetching user sessions:', error)
        return { data: [], error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error in getUserSessions:', error)
      return { data: [], error: 'Failed to fetch user sessions' }
    }
  }

  // Create new session
  static async createSession(sessionData: UserSessionInsert): Promise<{ data: UserSession | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('user_sessions')
        .insert(sessionData)
        .select()
        .single()

      if (error) {
        console.error('Error creating session:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in createSession:', error)
      return { data: null, error: 'Failed to create session' }
    }
  }

  // Revoke session
  static async revokeSession(sessionId: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId)

      if (error) {
        console.error('Error revoking session:', error)
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error in revokeSession:', error)
      return { error: 'Failed to revoke session' }
    }
  }

  // Cleanup expired sessions
  static async cleanupExpiredSessions(): Promise<{ data: number | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase.rpc('cleanup_expired_sessions')

      if (error) {
        console.error('Error cleaning up expired sessions:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in cleanupExpiredSessions:', error)
      return { data: null, error: 'Failed to cleanup expired sessions' }
    }
  }
} 