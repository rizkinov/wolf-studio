import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { ensureConnectionsWarmed } from '@/lib/utils/connection-warming'
import { retryDatabaseQuery } from '@/lib/utils/retry-mechanism'

export async function GET(request: NextRequest) {
  try {
    // Ensure connections are warmed up
    await ensureConnectionsWarmed()
    
    // Get the authenticated user from the request
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create admin client to bypass RLS policies
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Fetch user profile with retry mechanism
    const profile = await retryDatabaseQuery(
      async () => {
        const { data: profile, error: profileError } = await adminSupabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching user profile:', profileError)
          throw new Error('Failed to fetch user profile')
        }

        return profile
      },
      'auth-profile-fetch'
    )

    // Fetch user permissions with retry mechanism
    const permissions = await retryDatabaseQuery(
      async () => {
        const { data: permissions, error: permissionsError } = await adminSupabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', user.id)

        if (permissionsError) {
          console.error('Error fetching user permissions:', permissionsError)
          // Don't fail if permissions table doesn't exist, just return empty permissions
          return []
        }

        return permissions || []
      },
      'auth-permissions-fetch'
    )

    const userWithPermissions = {
      ...profile,
      permissions
    }

    return NextResponse.json({ data: userWithPermissions })
  } catch (error) {
    console.error('Error in profile API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 