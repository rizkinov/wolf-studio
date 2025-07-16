import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get comprehensive statistics
    const [projectsResult, categoriesResult, imagesResult, usersResult] = await Promise.all([
      // Projects statistics
      supabase
        .from('projects')
        .select('id, is_published, featured, created_at')
        .order('created_at', { ascending: false }),
      
      // Categories statistics
      supabase
        .from('categories')
        .select('id, created_at'),
      
      // Images statistics
      supabase
        .from('project_images')
        .select('id, image_type, created_at'),
      
      // Users statistics
      supabase
        .from('user_profiles')
        .select('id, role, is_active, created_at')
    ])
    
    if (projectsResult.error) {
      console.error('Error fetching projects:', projectsResult.error)
      return NextResponse.json({ error: 'Failed to fetch projects statistics' }, { status: 500 })
    }
    
    if (categoriesResult.error) {
      console.error('Error fetching categories:', categoriesResult.error)
      return NextResponse.json({ error: 'Failed to fetch categories statistics' }, { status: 500 })
    }
    
    if (imagesResult.error) {
      console.error('Error fetching images:', imagesResult.error)
      return NextResponse.json({ error: 'Failed to fetch images statistics' }, { status: 500 })
    }
    
    if (usersResult.error) {
      console.error('Error fetching users:', usersResult.error)
      return NextResponse.json({ error: 'Failed to fetch users statistics' }, { status: 500 })
    }
    
    const projects = projectsResult.data || []
    const categories = categoriesResult.data || []
    const images = imagesResult.data || []
    const users = usersResult.data || []
    
    // Calculate statistics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const stats = {
      projects: {
        total: projects.length,
        published: projects.filter(p => p.is_published).length,
        draft: projects.filter(p => !p.is_published).length,
        featured: projects.filter(p => p.featured).length,
        recentlyCreated: projects.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length
      },
      categories: {
        total: categories.length,
        recentlyCreated: categories.filter(c => new Date(c.created_at) >= thirtyDaysAgo).length
      },
      images: {
        total: images.length,
        banners: images.filter(i => i.image_type === 'banner').length,
        gallery: images.filter(i => i.image_type === 'gallery').length,
        recentlyUploaded: images.filter(i => new Date(i.created_at) >= sevenDaysAgo).length
      },
      users: {
        total: users.length,
        active: users.filter(u => u.is_active).length,
        inactive: users.filter(u => !u.is_active).length,
        admins: users.filter(u => u.role === 'admin').length,
        editors: users.filter(u => u.role === 'editor').length,
        viewers: users.filter(u => u.role === 'viewer').length,
        recentlyCreated: users.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length
      },
      system: {
        lastUpdated: now.toISOString(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform
      }
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in admin stats API:', error)
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
} 