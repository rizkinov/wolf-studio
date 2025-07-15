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
    
    const { data, error } = await adminSupabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('Error in GET /api/admin/categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body
    
    const adminSupabase = createAdminClient()
    
    switch (action) {
      case 'create':
        const { data: newCategory, error: createError } = await adminSupabase
          .from('categories')
          .insert({
            name: data.name,
            slug: data.slug,
            description: data.description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (createError) {
          return NextResponse.json({ error: createError.message }, { status: 500 })
        }
        
        return NextResponse.json({ data: newCategory })
      
      case 'update':
        const { data: updatedCategory, error: updateError } = await adminSupabase
          .from('categories')
          .update({
            name: data.name,
            slug: data.slug,
            description: data.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id)
          .select()
          .single()
        
        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }
        
        return NextResponse.json({ data: updatedCategory })
      
      case 'delete':
        const { error: deleteError } = await adminSupabase
          .from('categories')
          .delete()
          .eq('id', data.id)
        
        if (deleteError) {
          return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }
        
        return NextResponse.json({ success: true })
      
      case 'get':
        const column = data.bySlug ? 'slug' : 'id'
        const { data: category, error: getError } = await adminSupabase
          .from('categories')
          .select('*')
          .eq(column, data.identifier)
          .single()
        
        if (getError) {
          return NextResponse.json({ error: getError.message }, { status: 500 })
        }
        
        return NextResponse.json({ data: category })
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in POST /api/admin/categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 