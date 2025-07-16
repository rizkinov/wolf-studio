import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requestThrottler } from '@/lib/utils/request-throttling'
import { ensureConnectionsWarmed } from '@/lib/utils/connection-warming'
import { retryDatabaseQuery } from '@/lib/utils/retry-mechanism'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Ensure connections are warmed up
    await ensureConnectionsWarmed()
    
    // Use request throttling with retry mechanism
    const data = await requestThrottler.throttle(
      `project-detail-${id}`,
      async () => {
        return await retryDatabaseQuery(
          async () => {
            const supabase = await createClient()
            
            // Get project by ID
            const { data, error } = await supabase
              .from('projects')
              .select(`
                *,
                category:categories(*),
                images:project_images(*)
              `)
              .eq('id', id)
              .eq('is_published', true) // Only return published projects for public API
              .single()
            
            if (error) {
              if (error.code === 'PGRST116') {
                throw new Error('Project not found')
              }
              console.error('Error fetching project:', error)
              throw new Error('Failed to fetch project from database')
            }
            
            return data
          },
          `project-detail-${id}`
        )
      },
      10000 // Cache for 10 seconds since individual projects change less frequently
    )
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in project API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch project'
    
    if (errorMessage === 'Project not found') {
      return NextResponse.json({ error: errorMessage }, { status: 404 })
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
} 