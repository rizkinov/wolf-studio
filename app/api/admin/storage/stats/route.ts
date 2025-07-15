import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get all images from database with metadata
    const { data: images, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching images:', error)
      return NextResponse.json({ error: 'Failed to fetch storage statistics' }, { status: 500 })
    }
    
    // Calculate storage usage
    let totalUsedSize = 0
    let bannerImagesSize = 0
    let galleryImagesSize = 0
    let tempFilesSize = 0
    
    const largestFiles: any[] = []
    const recentUploads: any[] = []
    
    images?.forEach((image: any) => {
      const fileSize = image.file_size || 0
      totalUsedSize += fileSize
      
      if (image.image_type === 'banner') {
        bannerImagesSize += fileSize
      } else if (image.image_type === 'gallery') {
        galleryImagesSize += fileSize
      } else {
        tempFilesSize += fileSize
      }
      
      // Add to largest files (we'll sort later)
      largestFiles.push({
        name: image.filename || 'Unknown',
        size: fileSize,
        url: image.url || '',
        uploadedAt: image.created_at,
        project: image.project_id || undefined
      })
      
      // Add to recent uploads if uploaded in last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const uploadDate = new Date(image.created_at)
      
      if (uploadDate > thirtyDaysAgo) {
        recentUploads.push({
          name: image.filename || 'Unknown',
          size: fileSize,
          url: image.url || '',
          uploadedAt: image.created_at,
          project: image.project_id || undefined
        })
      }
    })
    
    // Sort largest files by size (descending)
    largestFiles.sort((a, b) => b.size - a.size)
    
    // Sort recent uploads by date (newest first)
    recentUploads.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    
    // Calculate storage limits (10GB default)
    const totalSize = 10 * 1024 * 1024 * 1024 // 10GB in bytes
    const availableSize = totalSize - totalUsedSize
    
    const storageStats = {
      totalSize,
      usedSize: totalUsedSize,
      availableSize,
      largestFiles: largestFiles.slice(0, 10), // Top 10 largest files
      recentUploads: recentUploads.slice(0, 10), // 10 most recent uploads
      storageBreakdown: {
        bannerImages: bannerImagesSize,
        galleryImages: galleryImagesSize,
        tempFiles: tempFilesSize,
        other: totalUsedSize - bannerImagesSize - galleryImagesSize - tempFilesSize
      }
    }
    
    return NextResponse.json(storageStats)
  } catch (error) {
    console.error('Error in /api/admin/storage/stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 