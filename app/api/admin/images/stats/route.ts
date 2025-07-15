import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get image statistics from database
    const { data: images, error } = await supabase
      .from('project_images')
      .select('image_type')
    
    if (error) {
      console.error('Error fetching images:', error)
      return NextResponse.json({ error: 'Failed to fetch image statistics' }, { status: 500 })
    }
    
    // Count images by type
    const stats = {
      totalImages: images?.length || 0,
      bannerImages: images?.filter((img: any) => img.image_type === 'banner').length || 0,
      galleryImages: images?.filter((img: any) => img.image_type === 'gallery').length || 0,
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in /api/admin/images/stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 