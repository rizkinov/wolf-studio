import { BlobServiceClient } from '@azure/storage-blob'
import { v4 as uuidv4 } from 'uuid'

// Configuration
const CONTAINER_NAME = 'project-images'
const CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING

interface UploadResult {
  url: string
  path: string
}

interface FileUploadOptions {
  onProgress?: (progress: { progress: number; status: string }) => void
}

class ImageUploadService {
  private blobServiceClient: BlobServiceClient | null = null
  private containerClient: any = null

  constructor() {
    if (CONNECTION_STRING) {
      try {
        this.blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING)
        this.containerClient = this.blobServiceClient.getContainerClient(CONTAINER_NAME)
      } catch (error) {
        console.error('Failed to initialize Azure Blob Storage client:', error)
      }
    }
  }

  /**
   * Upload a single image file to Azure Blob Storage
   */
  async uploadImage(
    file: File,
    options: FileUploadOptions = {}
  ): Promise<any> { // Returning any to match the shape expected by the UI for now, or we should update the UI types too
    if (!this.containerClient) {
      throw new Error('Azure Storage not configured. Check AZURE_STORAGE_CONNECTION_STRING.')
    }

    try {
      // Create the container if it doesn't exist
      await this.containerClient.createIfNotExists({
        access: 'blob' // Public read access
      })

      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${uuidv4()}.${extension}`
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName)

      // Upload data
      const buffer = await file.arrayBuffer()

      // Simulate progress since the SDK doesn't expose granular progress for small files easily in browser environment
      // For larger files, we would use uploadBrowserData
      if (options.onProgress) {
        options.onProgress({ progress: 10, status: 'uploading' })
      }

      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: {
          blobContentType: file.type
        }
      })

      if (options.onProgress) {
        options.onProgress({ progress: 100, status: 'complete' })
      }

      const publicUrl = blockBlobClient.url

      // Return a shape compatible with what the UI expects (ProjectImage interface-ish)
      // Note: We are NOT saving to the database here anymore because that logic was tightly coupled to Supabase
      // The UI/API route calling this should handle the DB insertion using Prisma
      return {
        id: uuidv4(), // Temporary ID
        image_url: publicUrl,
        image_type: 'gallery', // Default
        display_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
  ): Promise<any[]> {
    const uploadPromises = files.map((file, index) => {
      const fileOptions = {
        ...options,
        onProgress: options.onProgress
          ? (progress: any) => {
            // Simple progress aggregation
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

  // Stub methods to prevent crashes in components using these
  async deleteImage(imageId: string): Promise<void> {
    console.warn('deleteImage not fully implemented for Azure yet')
  }

  async updateImageMetadata(imageId: string, updates: any): Promise<void> {
    console.warn('updateImageMetadata not fully implemented for Azure yet')
  }

  async reorderImages(projectId: string, imageIds: string[]): Promise<void> {
    console.warn('reorderImages not fully implemented for Azure yet')
  }

  async getProjectImages(projectId: string): Promise<any[]> {
    console.warn('getProjectImages should be fetched via API/Prisma, not this service')
    return []
  }
}

export const imageUploadService = new ImageUploadService()

export const createUploadFunction = (options: FileUploadOptions) => {
  return async (file: File, onProgress: (progress: number) => void) => {
    const result = await imageUploadService.uploadImage(file, {
      ...options,
      onProgress: (p) => onProgress(p.progress)
    })

    return {
      url: result.image_url,
      path: result.image_url
    }
  }
}