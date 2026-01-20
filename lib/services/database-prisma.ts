// Prisma-based Database Service for Wolf Studio CMS (Azure PostgreSQL)
// This module provides CRUD operations using Prisma instead of Supabase
// Compatible with Azure PostgreSQL and no-auth middleware

import { prisma } from '@/lib/prisma'
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
import { Prisma } from '@prisma/client'

// ============================================
// PROJECT SERVICE
// ============================================

export class ProjectService {

  // Get all projects with optional filtering, pagination, and sorting
  static async getProjects(
    filters?: ProjectFilters,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<{ data: ProjectWithCategoryAndImages[]; count: number; error: string | null }> {
    try {
      // Build where clause for filters
      const where: Prisma.ProjectWhereInput = {}

      if (filters) {
        if (filters.category_id) {
          where.categoryId = filters.category_id
        }
        if (filters.is_published !== undefined) {
          where.isPublished = filters.is_published
        }
        if (filters.featured !== undefined) {
          where.featured = filters.featured
        }
        if (filters.year) {
          where.year = filters.year
        }
        if (filters.search) {
          where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { subtitle: { contains: filters.search, mode: 'insensitive' } },
          ]
        }
      }

      // Build orderBy clause
      const orderBy: Prisma.ProjectOrderByWithRelationInput = sort
        ? { [sort.column]: sort.order }
        : { orderIndex: 'asc' }

      // Calculate pagination
      const page = pagination?.page || 1
      const limit = pagination?.limit || 10
      const skip = (page - 1) * limit

      // Execute query with count
      const [projects, count] = await Promise.all([
        prisma.project.findMany({
          where,
          include: {
            category: true,
            images: {
              orderBy: {
                displayOrder: 'asc',
              },
            },
          },
          orderBy,
          skip: pagination ? skip : undefined,
          take: pagination ? limit : undefined,
        }),
        prisma.project.count({ where }),
      ])

      // Transform to match expected type
      const data = projects as any as ProjectWithCategoryAndImages[]

      return { data, count, error: null }
    } catch (error: any) {
      console.error('Error fetching projects:', error)
      return { data: [], count: 0, error: error.message }
    }
  }

  // Get a single project by ID or slug
  static async getProject(
    identifier: string
  ): Promise<{ data: ProjectWithCategoryAndImages | null; error: string | null }> {
    try {
      // Try to find by ID first (UUID format), otherwise by slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)

      const project = await prisma.project.findFirst({
        where: isUUID ? { id: identifier } : { slug: identifier },
        include: {
          category: true,
          images: {
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      })

      if (!project) {
        return { data: null, error: 'Project not found' }
      }

      return { data: project as any as ProjectWithCategoryAndImages, error: null }
    } catch (error: any) {
      console.error('Error fetching project:', error)
      return { data: null, error: error.message }
    }
  }

  // Create a new project
  static async createProject(
    project: ProjectInsert
  ): Promise<{ data: Project | null; error: string | null }> {
    try {
      const newProject = await prisma.project.create({
        data: {
          title: project.title,
          subtitle: project.subtitle,
          slug: project.slug,
          bannerImageUrl: project.banner_image_url,
          orderIndex: project.order_index || 0,
          categoryId: project.category_id,
          publishedAt: project.published_at,
          isPublished: project.is_published || false,
          description: project.description as Prisma.InputJsonValue,
          year: project.year,
          size: project.size,
          location: project.location,
          scope: project.scope,
          legacyId: project.legacy_id,
          featured: project.featured || false,
        },
      })

      return { data: newProject as any as Project, error: null }
    } catch (error: any) {
      console.error('Error creating project:', error)
      return { data: null, error: error.message }
    }
  }

  // Update an existing project
  static async updateProject(
    id: string,
    updates: ProjectUpdate
  ): Promise<{ data: Project | null; error: string | null }> {
    try {
      const updateData: Prisma.ProjectUpdateInput = {}

      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.subtitle !== undefined) updateData.subtitle = updates.subtitle
      if (updates.slug !== undefined) updateData.slug = updates.slug
      if (updates.banner_image_url !== undefined) updateData.bannerImageUrl = updates.banner_image_url
      if (updates.order_index !== undefined) updateData.orderIndex = updates.order_index
      if (updates.category_id !== undefined) updateData.categoryId = updates.category_id
      if (updates.published_at !== undefined) updateData.publishedAt = updates.published_at
      if (updates.is_published !== undefined) updateData.isPublished = updates.is_published
      if (updates.description !== undefined) updateData.description = updates.description as Prisma.InputJsonValue
      if (updates.year !== undefined) updateData.year = updates.year
      if (updates.size !== undefined) updateData.size = updates.size
      if (updates.location !== undefined) updateData.location = updates.location
      if (updates.scope !== undefined) updateData.scope = updates.scope
      if (updates.featured !== undefined) updateData.featured = updates.featured

      const updatedProject = await prisma.project.update({
        where: { id },
        data: updateData,
      })

      return { data: updatedProject as any as Project, error: null }
    } catch (error: any) {
      console.error('Error updating project:', error)
      return { data: null, error: error.message }
    }
  }

  // Delete a project
  static async deleteProject(id: string): Promise<{ error: string | null }> {
    try {
      await prisma.project.delete({
        where: { id },
      })

      return { error: null }
    } catch (error: any) {
      console.error('Error deleting project:', error)
      return { error: error.message }
    }
  }

  // Reorder projects by updating order_index
  static async reorderProjects(
    updates: Array<{ id: string; order_index: number }>
  ): Promise<{ error: string | null }> {
    try {
      await prisma.$transaction(
        updates.map(({ id, order_index }) =>
          prisma.project.update({
            where: { id },
            data: { orderIndex: order_index },
          })
        )
      )

      return { error: null }
    } catch (error: any) {
      console.error('Error reordering projects:', error)
      return { error: error.message }
    }
  }

  // Duplicate a project
  static async duplicateProject(
    id: string
  ): Promise<{ data: Project | null; error: string | null }> {
    try {
      const original = await prisma.project.findUnique({
        where: { id },
        include: { images: true },
      })

      if (!original) {
        return { data: null, error: 'Project not found' }
      }

      // Create duplicate project
      const duplicate = await prisma.project.create({
        data: {
          title: `${original.title} (Copy)`,
          subtitle: original.subtitle,
          slug: `${original.slug}-copy-${Date.now()}`,
          bannerImageUrl: original.bannerImageUrl,
          orderIndex: original.orderIndex + 1,
          categoryId: original.categoryId,
          isPublished: false,
          description: original.description as Prisma.InputJsonValue,
          year: original.year,
          size: original.size,
          location: original.location,
          scope: original.scope,
          featured: false,
        },
      })

      // Duplicate images
      if (original.images.length > 0) {
        await prisma.projectImage.createMany({
          data: original.images.map((img) => ({
            projectId: duplicate.id,
            imageUrl: img.imageUrl,
            altText: img.altText,
            caption: img.caption,
            displayOrder: img.displayOrder,
            imageType: img.imageType,
            storagePath: img.storagePath,
            fileSize: img.fileSize,
            mimeType: img.mimeType,
            cropData: img.cropData as Prisma.InputJsonValue,
          })),
        })
      }

      return { data: duplicate as any as Project, error: null }
    } catch (error: any) {
      console.error('Error duplicating project:', error)
      return { data: null, error: error.message }
    }
  }

  // Bulk update projects
  static async bulkUpdateProjects(
    ids: string[],
    updates: Partial<ProjectUpdate>
  ): Promise<{ count: number; error: string | null }> {
    try {
      const updateData: Prisma.ProjectUpdateInput = {}

      if (updates.is_published !== undefined) updateData.isPublished = updates.is_published
      if (updates.featured !== undefined) updateData.featured = updates.featured
      if (updates.category_id !== undefined) updateData.categoryId = updates.category_id

      const result = await prisma.project.updateMany({
        where: { id: { in: ids } },
        data: updateData,
      })

      return { count: result.count, error: null }
    } catch (error: any) {
      console.error('Error bulk updating projects:', error)
      return { count: 0, error: error.message }
    }
  }

  // Get projects by IDs
  static async getProjectsByIds(
    ids: string[]
  ): Promise<{ data: ProjectWithCategoryAndImages[]; error: string | null }> {
    try {
      const projects = await prisma.project.findMany({
        where: { id: { in: ids } },
        include: {
          category: true,
          images: {
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      })

      return { data: projects as any as ProjectWithCategoryAndImages[], error: null }
    } catch (error: any) {
      console.error('Error fetching projects by IDs:', error)
      return { data: [], error: error.message }
    }
  }
}

// ============================================
// CATEGORY SERVICE
// ============================================

export class CategoryService {

  // Get all categories
  static async getCategories(): Promise<{ data: Category[]; error: string | null }> {
    try {
      const categories = await prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
      })

      return { data: categories as any as Category[], error: null }
    } catch (error: any) {
      console.error('Error fetching categories:', error)
      return { data: [], error: error.message }
    }
  }

  // Get a single category by ID or slug
  static async getCategory(
    identifier: string
  ): Promise<{ data: Category | null; error: string | null }> {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)

      const category = await prisma.category.findFirst({
        where: isUUID ? { id: identifier } : { slug: identifier },
      })

      if (!category) {
        return { data: null, error: 'Category not found' }
      }

      return { data: category as any as Category, error: null }
    } catch (error: any) {
      console.error('Error fetching category:', error)
      return { data: null, error: error.message }
    }
  }

  // Create a new category
  static async createCategory(
    category: CategoryInsert
  ): Promise<{ data: Category | null; error: string | null }> {
    try {
      const newCategory = await prisma.category.create({
        data: {
          name: category.name,
          slug: category.slug,
          description: category.description,
        },
      })

      return { data: newCategory as any as Category, error: null }
    } catch (error: any) {
      console.error('Error creating category:', error)
      return { data: null, error: error.message }
    }
  }

  // Update an existing category
  static async updateCategory(
    id: string,
    updates: CategoryUpdate
  ): Promise<{ data: Category | null; error: string | null }> {
    try {
      const updatedCategory = await prisma.category.update({
        where: { id },
        data: {
          name: updates.name,
          slug: updates.slug,
          description: updates.description,
        },
      })

      return { data: updatedCategory as any as Category, error: null }
    } catch (error: any) {
      console.error('Error updating category:', error)
      return { data: null, error: error.message }
    }
  }

  // Delete a category
  static async deleteCategory(id: string): Promise<{ error: string | null }> {
    try {
      await prisma.category.delete({
        where: { id },
      })

      return { error: null }
    } catch (error: any) {
      console.error('Error deleting category:', error)
      return { error: error.message }
    }
  }
}

// ============================================
// PROJECT IMAGE SERVICE
// ============================================

export class ProjectImageService {

  // Get all images for a project
  static async getProjectImages(
    projectId: string
  ): Promise<{ data: ProjectImage[]; error: string | null }> {
    try {
      const images = await prisma.projectImage.findMany({
        where: { projectId },
        orderBy: {
          displayOrder: 'asc',
        },
      })

      return { data: images as any as ProjectImage[], error: null }
    } catch (error: any) {
      console.error('Error fetching project images:', error)
      return { data: [], error: error.message }
    }
  }

  // Add an image to a project
  static async addProjectImage(
    image: ProjectImageInsert
  ): Promise<{ data: ProjectImage | null; error: string | null }> {
    try {
      const newImage = await prisma.projectImage.create({
        data: {
          projectId: image.project_id,
          imageUrl: image.image_url,
          altText: image.alt_text,
          caption: image.caption,
          displayOrder: image.display_order || 0,
          imageType: image.image_type || 'gallery',
          storagePath: image.storage_path,
          fileSize: image.file_size,
          mimeType: image.mime_type,
          cropData: image.crop_data as Prisma.InputJsonValue,
        },
      })

      return { data: newImage as any as ProjectImage, error: null }
    } catch (error: any) {
      console.error('Error adding project image:', error)
      return { data: null, error: error.message }
    }
  }

  // Update a project image
  static async updateProjectImage(
    id: string,
    updates: ProjectImageUpdate
  ): Promise<{ data: ProjectImage | null; error: string | null }> {
    try {
      const updateData: Prisma.ProjectImageUpdateInput = {}

      if (updates.image_url !== undefined) updateData.imageUrl = updates.image_url
      if (updates.alt_text !== undefined) updateData.altText = updates.alt_text
      if (updates.caption !== undefined) updateData.caption = updates.caption
      if (updates.display_order !== undefined) updateData.displayOrder = updates.display_order
      if (updates.image_type !== undefined) updateData.imageType = updates.image_type
      if (updates.storage_path !== undefined) updateData.storagePath = updates.storage_path
      if (updates.file_size !== undefined) updateData.fileSize = updates.file_size
      if (updates.mime_type !== undefined) updateData.mimeType = updates.mime_type
      if (updates.crop_data !== undefined) updateData.cropData = updates.crop_data as Prisma.InputJsonValue

      const updatedImage = await prisma.projectImage.update({
        where: { id },
        data: updateData,
      })

      return { data: updatedImage as any as ProjectImage, error: null }
    } catch (error: any) {
      console.error('Error updating project image:', error)
      return { data: null, error: error.message }
    }
  }

  // Delete a project image
  static async deleteProjectImage(id: string): Promise<{ error: string | null }> {
    try {
      await prisma.projectImage.delete({
        where: { id },
      })

      return { error: null }
    } catch (error: any) {
      console.error('Error deleting project image:', error)
      return { error: error.message }
    }
  }

  // Reorder project images
  static async reorderProjectImages(
    updates: Array<{ id: string; display_order: number }>
  ): Promise<{ error: string | null }> {
    try {
      await prisma.$transaction(
        updates.map(({ id, display_order }) =>
          prisma.projectImage.update({
            where: { id },
            data: { displayOrder: display_order },
          })
        )
      )

      return { error: null }
    } catch (error: any) {
      console.error('Error reordering project images:', error)
      return { error: error.message }
    }
  }
}

// Export all services
export const db = {
  projects: ProjectService,
  categories: CategoryService,
  images: ProjectImageService,
}

export default db
