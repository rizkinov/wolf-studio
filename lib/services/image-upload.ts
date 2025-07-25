import { createClient } from '@/lib/supabase/client'
import { ProjectImage } from '@/lib/types/database'

// Create Supabase client only when needed
const getSupabaseClient = () => {
  // Only return null during build time when environment variables might not be available
  if (typeof window === 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    return null
  }
  return createClient()
}

interface UploadResult {
  error?: { message: string }
  data?: any
}

interface UploadProgress {
  progress: number
  status: 'uploading' | 'complete' | 'error'
}

interface FileUploadOptions {
  onProgress?: (progress: UploadProgress) => void
  maxSize?: number
  allowedTypes?: string[]
}

class ImageUploadService {
  private bucketName = 'project-images'

  /**
   * Upload a single image file to Supabase Storage
   */
  async uploadImage(
    file: File,
    options: FileUploadOptions = {}
  ): Promise<ProjectImage> {
    const {
      onProgress
    } = options

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }
      
      // Check authentication state
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      
      if (authError || !session) {
        throw new Error('User not authenticated. Please log in to upload images.')
      }

      // Validate file
      this.validateFile(file)

      // Optimize image if needed
      const optimizedFile = await this.optimizeImage(file, {
        maxWidth: 1920, // Default max width
        maxHeight: 1080, // Default max height
        quality: 0.9 // Default quality
      })

      // Get image dimensions
      const dimensions = await this.getImageDimensions(optimizedFile)

      // Prepare form data for API
      const formData = new FormData()
      formData.append('file', optimizedFile)
      // projectId, imageType, maxWidth, maxHeight, quality are removed from options
      // as they are not directly used in the new upload logic

      // Upload via API route with authentication
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Upload failed: ${errorData.error || response.statusText}`)
      }

      const result = await response.json()

              return {
          id: result.id,
          project_id: result.project_id,
          image_url: result.image_url,
          image_type: result.image_type,
          display_order: result.display_order,
          alt_text: result.alt_text,
          caption: result.caption,
          created_at: result.created_at,
          updated_at: result.updated_at
        }
    } catch (error) {
      console.error('Image upload failed:', error)
      throw error
    }
  }

  /**
   * Upload multiple images concurrently
   */
  async uploadMultipleImages(
    files: File[],
    options: FileUploadOptions = {}
  ): Promise<ProjectImage[]> {
    const uploadPromises = files.map((file, index) => {
      const fileOptions = {
        ...options,
        onProgress: options.onProgress 
          ? (progress: UploadProgress) => {
              // Adjust progress for multiple files
              const adjustedProgress = {
                ...progress,
                progress: (index * 100 + progress.progress) / files.length
              }
              options.onProgress!(adjustedProgress)
            }
          : undefined
      }
      
      return this.uploadImage(file, fileOptions)
    })

    return Promise.all(uploadPromises)
  }

  /**
   * Delete an image from storage and database
   */
  async deleteImage(imageId: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }
      
      // Get image record to find storage path
      const { data: imageRecord, error: fetchError } = await supabase
        .from('project_images')
        .select('storage_path')
        .eq('id', imageId)
        .single()

      if (fetchError || !imageRecord) {
        throw new Error('Image record not found')
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.bucketName)
        .remove([imageRecord.storage_path])

      if (storageError) {
        console.warn('Failed to delete from storage:', storageError.message)
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('project_images')
        .delete()
        .eq('id', imageId)

      if (dbError) {
        throw new Error(`Failed to delete image record: ${dbError.message}`)
      }
    } catch (error) {
      console.error('Image deletion failed:', error)
      throw error
    }
  }

  /**
   * Update image metadata in database
   */
  async updateImageMetadata(
    imageId: string,
    updates: {
      alt_text?: string
      caption?: string
      display_order?: number
      image_type?: 'banner' | 'gallery'
    }
  ): Promise<void> {
    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }
    
    const { error } = await supabase
      .from('project_images')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', imageId)

    if (error) {
      throw new Error(`Failed to update image metadata: ${error.message}`)
    }
  }

  /**
   * Reorder images for a project
   */
  async reorderImages(projectId: string, imageIds: string[]): Promise<void> {
    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const updatePromises = imageIds.map((imageId, index) => 
      supabase
        .from('project_images')
        .update({ order_index: index })
        .eq('id', imageId)
        .eq('project_id', projectId)
    )

      const results = await Promise.all(updatePromises)
  
  const errors = results.filter(result => result.error)
  if (errors.length > 0) {
    throw new Error(`Failed to reorder images: ${errors[0].error?.message}`)
  }
  }

  /**
   * Get images for a project
   */
  async getProjectImages(projectId: string): Promise<ProjectImage[]> {
    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }
    
    const { data, error } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true })

    if (error) {
      throw new Error(`Failed to get project images: ${error.message}`)
    }

    return data || []
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: File): void {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    if (file.size > maxSize) {
      throw new Error(`File size exceeds 5MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}. Allowed types: JPG, PNG, WebP`)
    }
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'jpg'
  }

  /**
   * Optimize image before upload
   */
  private async optimizeImage(
    file: File,
    options: { maxWidth: number; maxHeight: number; quality: number }
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        const { maxWidth, maxHeight, quality } = options

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx!.imageSmoothingQuality = 'high'
        ctx!.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image optimization failed'))
              return
            }

            // Create optimized file
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })

            resolve(optimizedFile)
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image for optimization'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Get image dimensions
   */
  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }

      img.onerror = () => reject(new Error('Failed to get image dimensions'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Upload file with progress tracking
   */
  private async uploadWithProgress(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }
    
    // For now, use standard upload as Supabase doesn't expose progress
    // In a real implementation, you might use a different approach
    const startTime = Date.now()
    
    // Simulate progress if callback is provided
    if (onProgress) {
      onProgress({ progress: 0, status: 'uploading' })
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const estimatedTotal = 3000 // 3 seconds estimated
        const percentage = Math.min((elapsed / estimatedTotal) * 100, 95)
        
        onProgress({
          progress: percentage,
          status: 'uploading'
        })
        
        if (percentage >= 95) {
          clearInterval(progressInterval)
        }
      }, 100)
    }

    const result = await supabase.storage
      .from(this.bucketName)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    // Complete progress
    if (onProgress) {
      onProgress({ progress: 100, status: 'complete' })
    }

    return result
  }

  /**
   * Create database record for uploaded image
   */
  private async createImageRecord(data: {
    projectId: string
    imageType: 'banner' | 'gallery'
    storagePath: string
    publicUrl: string
    fileName: string
    fileSize: number
    mimeType: string
    dimensions: { width: number; height: number }
  }): Promise<string> {
    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }
    
    // Get next display order
    const { data: existingImages } = await supabase
      .from('project_images')
      .select('display_order')
      .eq('project_id', data.projectId)
      .eq('image_type', data.imageType)
      .order('display_order', { ascending: false })
      .limit(1)

    const nextOrder = existingImages && existingImages.length > 0 
      ? existingImages[0].display_order + 1 
      : 0

    const { data: insertedImage, error } = await supabase
      .from('project_images')
      .insert({
        project_id: data.projectId,
        image_url: data.publicUrl,
        storage_path: data.storagePath,
        image_type: data.imageType,
        display_order: nextOrder,
        file_size: data.fileSize,
        mime_type: data.mimeType,
        alt_text: `${data.imageType} image for project`
        // Note: created_at and updated_at will use database defaults
      })
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      throw new Error(`Failed to create image record: ${error.message}`)
    }

    return insertedImage.id
  }
}

// Export singleton instance
export const imageUploadService = new ImageUploadService()

// Export utility function for component usage
export const createUploadFunction = (options: FileUploadOptions) => {
  return async (file: File, onProgress: (progress: number) => void) => {
    const result = await imageUploadService.uploadImage(file, {
      ...options,
      onProgress: (progress) => onProgress(progress.progress)
    })
    
          return {
        url: result.image_url,
        path: result.image_url
      }
  }
} 