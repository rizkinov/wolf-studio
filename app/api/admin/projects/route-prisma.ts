// Admin Projects API - Prisma version for Azure PostgreSQL
// This is the Prisma-based replacement for the Supabase version
// Works with no-auth middleware (authentication bypassed for Azure testing)
// To activate: rename this file to route.ts and rename old route.ts to route-supabase.ts

import { NextRequest, NextResponse } from 'next/server'
import { ProjectService } from '@/lib/services/database-prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get single project by ID
    const projectId = searchParams.get('id')
    if (projectId) {
      const { data, error } = await ProjectService.getProject(projectId)

      if (error) {
        console.error('Error fetching project:', error)
        return NextResponse.json({ error }, { status: 500 })
      }

      if (!data) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

      return NextResponse.json({ data })
    }

    // Get all projects (no filters for admin view)
    const { data, error } = await ProjectService.getProjects(
      undefined, // No filters
      undefined, // No pagination
      { column: 'order_index', order: 'asc' } // Default sort
    )

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in projects GET:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'create': {
        const { data: newProject, error: createError } = await ProjectService.createProject(data)

        if (createError) {
          console.error('Error creating project:', createError)
          return NextResponse.json({ error: createError }, { status: 500 })
        }

        return NextResponse.json({ data: newProject })
      }

      case 'update': {
        const { id, ...updateData } = data
        if (!id) {
          return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
        }

        const { data: updatedProject, error: updateError } = await ProjectService.updateProject(
          id,
          updateData
        )

        if (updateError) {
          console.error('Error updating project:', updateError)
          return NextResponse.json({ error: updateError }, { status: 500 })
        }

        return NextResponse.json({ data: updatedProject })
      }

      case 'delete': {
        if (!data.id) {
          return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
        }

        const { error: deleteError } = await ProjectService.deleteProject(data.id)

        if (deleteError) {
          console.error('Error deleting project:', deleteError)
          return NextResponse.json({ error: deleteError }, { status: 500 })
        }

        return NextResponse.json({ success: true })
      }

      case 'reorder': {
        if (!data.updates || !Array.isArray(data.updates)) {
          return NextResponse.json({ error: 'Updates array is required' }, { status: 400 })
        }

        const { error: reorderError } = await ProjectService.reorderProjects(data.updates)

        if (reorderError) {
          console.error('Error reordering projects:', reorderError)
          return NextResponse.json({ error: reorderError }, { status: 500 })
        }

        return NextResponse.json({ success: true })
      }

      case 'duplicate': {
        if (!data.id) {
          return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
        }

        const { data: duplicatedProject, error: duplicateError } =
          await ProjectService.duplicateProject(data.id)

        if (duplicateError) {
          console.error('Error duplicating project:', duplicateError)
          return NextResponse.json({ error: duplicateError }, { status: 500 })
        }

        return NextResponse.json({ data: duplicatedProject })
      }

      case 'bulk-update': {
        if (!data.ids || !Array.isArray(data.ids)) {
          return NextResponse.json({ error: 'IDs array is required' }, { status: 400 })
        }

        const { count, error: bulkError } = await ProjectService.bulkUpdateProjects(
          data.ids,
          data.updates || {}
        )

        if (bulkError) {
          console.error('Error bulk updating projects:', bulkError)
          return NextResponse.json({ error: bulkError }, { status: 500 })
        }

        return NextResponse.json({ success: true, count })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in projects POST:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
