import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requestThrottler } from '@/lib/utils/request-throttling'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Create a cache key based on search parameters
    const cacheKey = `projects-${searchParams.toString()}`
    
    // Use request throttling to prevent duplicate requests
    const result = await requestThrottler.throttle(
      cacheKey,
      async () => {
        const supabase = await createClient()
        return await fetchProjects(supabase, searchParams)
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

async function fetchProjects(supabase: any, searchParams: URLSearchParams) {
  const published = searchParams.get('published')
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  
  // Build query
  let query = supabase
    .from('projects')
    .select(`
      *,
      category:categories(*),
      images:project_images(*)
    `)
  
  // Apply filters
  if (published === 'true') {
    query = query.eq('is_published', true)
  }
  
  if (category) {
    query = query.eq('category_id', category)
  }
  
  if (featured === 'true') {
    query = query.eq('featured', true)
  }
  
  // Apply ordering
  query = query.order('order_index', { ascending: true })
  
  // Apply pagination
  if (limit) {
    const limitNum = parseInt(limit)
    query = query.limit(limitNum)
    
    if (offset) {
      const offsetNum = parseInt(offset)
      query = query.range(offsetNum, offsetNum + limitNum - 1)
    }
  }

  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching projects:', error)
    throw new Error('Failed to fetch projects from database')
  }

  return data || []
} 