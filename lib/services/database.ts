// Database service layer for Wolf Studio CMS
// This module provides CRUD operations for all database entities

import { createClient } from '@/lib/supabase/client'
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