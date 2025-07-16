import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
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
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }
    
    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('Error in projects API:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
} 