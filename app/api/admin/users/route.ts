import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { UserFilters, PaginationParams, SortParams, UserRole } from '@/lib/types/database'

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
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const filters: UserFilters = {}
    const pagination: PaginationParams = {}
    let sort: SortParams | undefined
    
    // Extract filters
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const department = searchParams.get('department')
    
    if (search) filters.search = search
    if (role && role !== 'all') filters.role = role as UserRole
    if (status && status !== 'all') filters.is_active = status === 'active'
    if (department) filters.department = department
    
    // Extract pagination
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')
    
    if (page) pagination.page = parseInt(page)
    if (limit) pagination.limit = parseInt(limit)
    
    // Extract sorting
    const sortColumn = searchParams.get('sortColumn')
    const sortOrder = searchParams.get('sortOrder')
    
    if (sortColumn && sortOrder) {
      sort = {
        column: sortColumn,
        order: sortOrder as 'asc' | 'desc'
      }
    }
    
    // Create admin client and fetch users
    const adminSupabase = createAdminClient()
    
    let query = adminSupabase
      .from('user_profiles')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters.role) {
      query = query.eq('role', filters.role)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }
    if (filters.department) {
      query = query.eq('department', filters.department)
    }

    // Apply sorting
    if (sort && sort.column) {
      query = query.order(sort.column, { ascending: sort.order === 'asc' })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    if (pagination.page && pagination.limit) {
      const offset = (pagination.page - 1) * pagination.limit
      query = query.range(offset, offset + pagination.limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [], count: count || 0 })
  } catch (error) {
    console.error('Error in users API:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body
    
    console.log('Creating user with data:', { action, email: data.email, role: data.role })
    
    const adminSupabase = createAdminClient()
    
    switch (action) {
      case 'create':
        // Try with email confirmation disabled
        console.log('Creating auth user with email confirmation disabled...')
        
        let authResult
        try {
          authResult = await adminSupabase.auth.admin.createUser({
            email: data.email,
            password: data.password || 'TempPassword123!',
            email_confirm: false, // Try with email confirmation disabled
            user_metadata: {
              full_name: data.full_name || data.email
            }
          })
        } catch (authCreateError) {
          console.error('Auth create error:', authCreateError)
          const errorMessage = authCreateError instanceof Error ? authCreateError.message : String(authCreateError)
          return NextResponse.json({ error: `Auth create error: ${errorMessage}` }, { status: 500 })
        }
        
        const { data: authUser, error: authError } = authResult
        
        if (authError) {
          console.error('Auth error:', authError)
          return NextResponse.json({ error: `Auth error: ${authError.message || JSON.stringify(authError)}` }, { status: 500 })
        }
        
        if (!authUser.user) {
          console.error('No user returned from auth')
          return NextResponse.json({ error: 'No user returned from auth' }, { status: 500 })
        }
        
        console.log('Auth user created:', authUser.user.id)
        
        // Wait for trigger to create profile
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Check if profile was created
        const { data: existingProfile, error: checkError } = await adminSupabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.user.id)
          .single()
        
        if (checkError) {
          console.error('Profile check error:', checkError)
          // If profile doesn't exist, create it manually
          const { data: newProfile, error: manualCreateError } = await adminSupabase
            .from('user_profiles')
            .insert({
              id: authUser.user.id,
              email: data.email,
              full_name: data.full_name,
              role: data.role || 'viewer',
              department: data.department,
              phone: data.phone,
              bio: data.bio,
              avatar_url: data.avatar_url,
              is_active: data.is_active !== undefined ? data.is_active : true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single()
          
          if (manualCreateError) {
            console.error('Manual profile creation error:', manualCreateError)
            return NextResponse.json({ error: `Manual profile creation error: ${manualCreateError.message}` }, { status: 500 })
          }
          
          console.log('User created successfully (manual profile):', newProfile)
          return NextResponse.json({ data: newProfile })
        }
        
        // Update existing profile with additional data
        const { data: updatedProfile, error: profileUpdateError } = await adminSupabase
          .from('user_profiles')
          .update({
            full_name: data.full_name,
            role: data.role || 'viewer',
            department: data.department,
            phone: data.phone,
            bio: data.bio,
            avatar_url: data.avatar_url,
            is_active: data.is_active !== undefined ? data.is_active : true,
            updated_at: new Date().toISOString()
          })
          .eq('id', authUser.user.id)
          .select()
          .single()
        
        if (profileUpdateError) {
          console.error('Profile update error:', profileUpdateError)
          return NextResponse.json({ error: `Profile update error: ${profileUpdateError.message}` }, { status: 500 })
        }
        
        console.log('User created successfully:', updatedProfile)
        return NextResponse.json({ data: updatedProfile })
      
      case 'update':
        const { id, ...updateData } = data
        const { data: updatedUser, error: updateError } = await adminSupabase
          .from('user_profiles')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()
        
        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }
        
        return NextResponse.json({ data: updatedUser })
      
      case 'deactivate':
        const { id: deactivateId } = data
        const { error: deactivateError } = await adminSupabase
          .from('user_profiles')
          .update({
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', deactivateId)
        
        if (deactivateError) {
          return NextResponse.json({ error: deactivateError.message }, { status: 500 })
        }
        
        return NextResponse.json({ success: true })
      
      case 'getActivitySummary':
        // First try to use the view if it exists
        const { data: viewData, error: viewError } = await adminSupabase
          .from('user_activity_summary')
          .select('*')
          .order('last_activity_at', { ascending: false, nullsFirst: false })

        // If view exists and works, return the data
        if (!viewError && viewData) {
          return NextResponse.json({ data: viewData })
        }

        // If view doesn't exist, build the query manually
        console.log('user_activity_summary view not found, building query manually...')
        
        // Get all users first
        const { data: users, error: usersError } = await adminSupabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (usersError) {
          return NextResponse.json({ error: usersError.message }, { status: 500 })
        }

        // Try to get activities - handle case where table might not exist
        const { data: activities, error: activitiesError } = await adminSupabase
          .from('activity_logs')
          .select('*')

        // If activities table doesn't exist, return users with zero activity
        if (activitiesError) {
          console.log('activity_logs table not found, returning users with zero activity')
          const summaryData = users.map(user => ({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            last_login_at: user.last_login_at,
            is_active: user.is_active,
            total_activities: 0,
            activities_last_7_days: 0,
            activities_last_30_days: 0,
            last_activity_at: null
          }))
          return NextResponse.json({ data: summaryData })
        }

        // Build activity summary manually
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const summaryData = users.map(user => {
          const userActivities = activities.filter(activity => activity.user_id === user.id)
          const last7Days = userActivities.filter(activity => 
            new Date(activity.created_at) >= sevenDaysAgo
          ).length
          const last30Days = userActivities.filter(activity => 
            new Date(activity.created_at) >= thirtyDaysAgo
          ).length
          const lastActivity = userActivities.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]

          return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            last_login_at: user.last_login_at,
            is_active: user.is_active,
            total_activities: userActivities.length,
            activities_last_7_days: last7Days,
            activities_last_30_days: last30Days,
            last_activity_at: lastActivity ? lastActivity.created_at : null
          }
        })

        return NextResponse.json({ data: summaryData })
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in users POST API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to process request: ${errorMessage}` }, { status: 500 })
  }
} 