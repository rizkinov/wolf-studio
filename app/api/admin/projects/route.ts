import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client with service role key
const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function GET(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    
    // Get single project by ID
    const projectId = searchParams.get('id')
    if (projectId) {
      const { data, error } = await adminSupabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) {
        console.error('Error fetching project:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ data })
    }

    // Get all projects
    const { data, error } = await adminSupabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
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
    
    const adminSupabase = createAdminClient()
    
    switch (action) {
      case 'create':
        const { data: newProject, error: createError } = await adminSupabase
          .from('projects')
          .insert({
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (createError) {
          console.error('Error creating project:', createError)
          return NextResponse.json({ error: createError.message }, { status: 500 })
        }
        
        return NextResponse.json({ data: newProject })
      
      case 'update':
        const { id, ...updateData } = data
        const { data: updatedProject, error: updateError } = await adminSupabase
          .from('projects')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()
        
        if (updateError) {
          console.error('Error updating project:', updateError)
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }
        
        return NextResponse.json({ data: updatedProject })
      
      case 'delete':
        const { error: deleteError } = await adminSupabase
          .from('projects')
          .delete()
          .eq('id', data.id)
        
        if (deleteError) {
          console.error('Error deleting project:', deleteError)
          return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }
        
        return NextResponse.json({ success: true })
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in projects POST:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
} 