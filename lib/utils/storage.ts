// Supabase Storage utilities for Wolf Studio image management
import { createClient } from '@/lib/supabase/client'

export interface StorageUploadResult {
  data: {
    id: string
    path: string
    fullPath: string
    publicUrl: string
  } | null
  error: string | null
}

export interface StorageUploadOptions {
  upsert?: boolean
  contentType?: string
  duplex?: 'half'
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  PROJECT_IMAGES: 'project-images',
  PROJECT_IMAGES_TEMP: 'project-images-temp'
} as const

// Helper function to get storage client
export const getStorageClient = () => {
  const supabase = createClient()
  return supabase.storage
}

// Upload file to Supabase Storage
export const uploadToStorage = async (
  bucket: string,
  filePath: string,
  file: File | Blob,
  options: StorageUploadOptions = {}
): Promise<StorageUploadResult> => {
  try {
    const storage = getStorageClient()
    
    const { data, error } = await storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: options.upsert || false,
        contentType: options.contentType || file.type,
        duplex: options.duplex
      })

    if (error) {
      return { data: null, error: error.message }
    }

    if (!data) {
      return { data: null, error: 'No data returned from upload' }
    }

    // Get public URL
    const { data: publicUrlData } = storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      data: {
        id: data.id,
        path: data.path,
        fullPath: data.fullPath,
        publicUrl: publicUrlData.publicUrl
      },
      error: null
    }
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error during upload'
    }
  }
}

// Generate storage path for project images
export const generateStoragePath = (
  projectSlug: string,
  imageType: 'banner' | 'gallery',
  filename: string,
  imageId?: string
): string => {
  const baseFolder = imageType === 'banner' ? 'banners' : 'gallery'
  
  if (imageType === 'banner') {
    return `${baseFolder}/${projectSlug}/${filename}`
  } else {
    return `${baseFolder}/${projectSlug}/${imageId || 'gallery'}-${filename}`
  }
}

// Validate file type and size
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPG and PNG files are allowed'
    }
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB'
    }
  }

  return { isValid: true }
}

// Get public URL for a file
export const getPublicUrl = (bucket: string, filePath: string): string => {
  const storage = getStorageClient()
  const { data } = storage.from(bucket).getPublicUrl(filePath)
  return data.publicUrl
} 