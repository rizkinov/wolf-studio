import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check database connection
    let databaseStatus = 'connected'
    try {
      const { error } = await supabase.from('projects').select('count').limit(1)
      if (error) {
        databaseStatus = 'error'
      }
    } catch (error) {
      databaseStatus = 'error'
    }
    
    // Check storage
    let storageStatus = 'available'
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets()
      if (error || !buckets) {
        storageStatus = 'error'
      }
    } catch (error) {
      storageStatus = 'error'
    }
    
    // Check authentication
    let authStatus = 'active'
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        authStatus = 'inactive'
      }
    } catch (error) {
      authStatus = 'error'
    }
    
    const systemStatus = {
      database: databaseStatus,
      storage: storageStatus,
      authentication: authStatus,
      api: 'online' // If we reach this point, API is online
    }
    
    return NextResponse.json(systemStatus)
  } catch (error) {
    console.error('Error in /api/admin/system/status:', error)
    return NextResponse.json({
      database: 'error',
      storage: 'error',
      authentication: 'error',
      api: 'error'
    }, { status: 500 })
  }
} 