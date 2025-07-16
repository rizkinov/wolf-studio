import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
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
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
      console.error('Error fetching project:', error)
      return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in project API:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
} 