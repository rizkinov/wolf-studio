// Database service layer for Wolf Studio CMS
// This module provides CRUD operations for all database entities

import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
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

// Get the appropriate Supabase client based on environment
const getSupabaseClient = async () => {
  if (typeof window !== 'undefined') {
    // Browser environment
    return createClient()
  } else {
    // Server environment
    return await createServerClient()
  }
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
      const supabase = await getSupabaseClient()
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
      const supabase = await getSupabaseClient()
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
      const supabase = await getSupabaseClient()
      
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
      const supabase = await getSupabaseClient()
      
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
      const supabase = await getSupabaseClient()
      
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
      const supabase = await getSupabaseClient()
      
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
}

// Category Service
export class CategoryService {
  
  // Get all categories
  static async getCategories(): Promise<{ data: Category[]; error: string | null }> {
    try {
      const supabase = await getSupabaseClient()
      
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
      const supabase = await getSupabaseClient()
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
      const supabase = await getSupabaseClient()
      
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
      const supabase = await getSupabaseClient()
      
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
      const supabase = await getSupabaseClient()
      
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
      const supabase = await getSupabaseClient()
      
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
      const supabase = await getSupabaseClient()
      
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
      const supabase = await getSupabaseClient()
      
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
      const supabase = await getSupabaseClient()
      
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
      const supabase = await getSupabaseClient()
      
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