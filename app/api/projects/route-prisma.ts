// Public Projects API - Prisma version for Azure PostgreSQL
// This is the Prisma-based replacement for the Supabase version
// To activate: rename this file to route.ts and rename old route.ts to route-supabase.ts

import { NextRequest, NextResponse } from 'next/server'
import { ProjectService } from '@/lib/services/database-prisma'
import { requestThrottler } from '@/lib/utils/request-throttling'
import { ensureConnectionsWarmed } from '@/lib/utils/connection-warming'
import { retryDatabaseQuery } from '@/lib/utils/retry-mechanism'
import type { ProjectFilters, PaginationParams, SortParams } from '@/lib/types/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Ensure connections are warmed up (if still relevant for Prisma)
    await ensureConnectionsWarmed()

    // Create a cache key based on search parameters
    const cacheKey = `projects-${searchParams.toString()}`

    // Use request throttling with retry mechanism
    const result = await requestThrottler.throttle(
      cacheKey,
      async () => {
        return await retryDatabaseQuery(
          async () => {
            return await fetchProjects(searchParams)
          },
          'projects-api-fetch'
        )
      },
      5000 // Cache for 5 seconds
    )

    return NextResponse.json({ data: result || [] })
  } catch (error) {
    console.error('Error in projects API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch projects'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

async function fetchProjects(searchParams: URLSearchParams) {
  const published = searchParams.get('published')
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')

  // Build filters
  const filters: ProjectFilters = {}

  if (published === 'true') {
    filters.is_published = true
  }

  if (category) {
    filters.category_id = category
  }

  if (featured === 'true') {
    filters.featured = true
  }

  // Build pagination
  let pagination: PaginationParams | undefined
  if (limit) {
    const limitNum = parseInt(limit)
    const page = offset ? Math.floor(parseInt(offset) / limitNum) + 1 : 1
    pagination = {
      page,
      limit: limitNum,
    }
  }

  // Build sort params
  const sort: SortParams = {
    column: 'order_index',
    order: 'asc',
  }

  // Fetch projects using Prisma service
  const { data, error } = await ProjectService.getProjects(filters, pagination, sort)

  if (error) {
    console.error('Error fetching projects:', error)
    throw new Error('Failed to fetch projects from database')
  }

  // Transform for frontend (add camelCase aliases for compatibility)
  return (data || []).map((project: any) => ({
    ...project,
    bannerImage: project.bannerImageUrl,
    order: project.orderIndex,
    // Keep snake_case fields for backwards compatibility
    banner_image_url: project.bannerImageUrl,
    order_index: project.orderIndex,
    is_published: project.isPublished,
    category_id: project.categoryId,
    published_at: project.publishedAt,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
    legacy_id: project.legacyId,
  }))
}
