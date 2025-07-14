// Image Migration Service for Wolf Studio
// This service handles migration of existing static images to Supabase Storage

import fs from 'fs'
import path from 'path'
import { createClient } from '@/lib/supabase/client'
import { uploadToStorage, generateStoragePath, STORAGE_BUCKETS } from '@/lib/utils/storage'

export interface ImageMigrationResult {
  success: boolean
  projectSlug: string
  imagesProcessed: number
  imagesMigrated: number
  errors: string[]
}

export interface ImageFile {
  filename: string
  type: 'banner' | 'gallery'
  projectSlug: string
  localPath: string
  size: number
}

// Scan directory for project images
export const scanProjectImages = async (projectsDir: string): Promise<ImageFile[]> => {
  const images: ImageFile[] = []
  
  try {
    const projectDirs = fs.readdirSync(projectsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    for (const projectSlug of projectDirs) {
      const projectPath = path.join(projectsDir, projectSlug)
      
      if (!fs.existsSync(projectPath)) continue
      
      const files = fs.readdirSync(projectPath)
        .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
      
      for (const filename of files) {
        const filePath = path.join(projectPath, filename)
        const stats = fs.statSync(filePath)
        
        // Determine image type based on filename
        const type = filename.includes('-banner.') ? 'banner' : 'gallery'
        
        images.push({
          filename,
          type,
          projectSlug,
          localPath: filePath,
          size: stats.size
        })
      }
    }
  } catch (error) {
    console.error('Error scanning project images:', error)
  }
  
  return images
}

// Convert file to File object for upload
const fileToFileObject = (filePath: string, filename: string): File => {
  const fileBuffer = fs.readFileSync(filePath)
  const mimeType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
  
  return new File([fileBuffer], filename, { type: mimeType })
}

// Migrate a single image
export const migrateImage = async (image: ImageFile): Promise<{
  success: boolean
  error?: string
  storagePath?: string
  publicUrl?: string
}> => {
  try {
    // Create File object from local file
    const fileObject = fileToFileObject(image.localPath, image.filename)
    
    // Generate storage path
    const storagePath = generateStoragePath(
      image.projectSlug,
      image.type,
      image.filename
    )
    
    // Upload to Supabase Storage
    const uploadResult = await uploadToStorage(
      STORAGE_BUCKETS.PROJECT_IMAGES,
      storagePath,
      fileObject,
      { upsert: true }
    )
    
    if (uploadResult.error) {
      return { success: false, error: uploadResult.error }
    }
    
    if (!uploadResult.data) {
      return { success: false, error: 'No data returned from upload' }
    }
    
    return {
      success: true,
      storagePath: uploadResult.data.path,
      publicUrl: uploadResult.data.publicUrl
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during migration'
    }
  }
}

// Log migration result to database
export const logMigrationResult = async (
  originalPath: string,
  storagePath: string,
  projectSlug: string,
  status: 'success' | 'failed',
  errorMessage?: string
): Promise<void> => {
  try {
    const supabase = createClient()
    
    await supabase
      .from('image_migration_log')
      .insert({
        original_path: originalPath,
        new_storage_path: storagePath,
        project_slug: projectSlug,
        status,
        error_message: errorMessage || null
      })
  } catch (error) {
    console.error('Error logging migration result:', error)
  }
}

// Migrate all images for a project
export const migrateProjectImages = async (
  projectSlug: string,
  projectDir: string
): Promise<ImageMigrationResult> => {
  const result: ImageMigrationResult = {
    success: true,
    projectSlug,
    imagesProcessed: 0,
    imagesMigrated: 0,
    errors: []
  }
  
  try {
    const projectPath = path.join(projectDir, projectSlug)
    
    if (!fs.existsSync(projectPath)) {
      result.success = false
      result.errors.push(`Project directory not found: ${projectPath}`)
      return result
    }
    
    const images = await scanProjectImages(projectDir)
    const projectImages = images.filter(img => img.projectSlug === projectSlug)
    
    result.imagesProcessed = projectImages.length
    
    for (const image of projectImages) {
      try {
        const migrationResult = await migrateImage(image)
        
        if (migrationResult.success) {
          result.imagesMigrated++
          
          // Log success
          await logMigrationResult(
            image.localPath,
            migrationResult.storagePath || '',
            projectSlug,
            'success'
          )
        } else {
          result.errors.push(`Failed to migrate ${image.filename}: ${migrationResult.error}`)
          
          // Log failure
          await logMigrationResult(
            image.localPath,
            '',
            projectSlug,
            'failed',
            migrationResult.error
          )
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        result.errors.push(`Error migrating ${image.filename}: ${errorMessage}`)
        
        // Log failure
        await logMigrationResult(
          image.localPath,
          '',
          projectSlug,
          'failed',
          errorMessage
        )
      }
    }
    
    result.success = result.errors.length === 0
    
  } catch (error) {
    result.success = false
    result.errors.push(`Error migrating project ${projectSlug}: ${error}`)
  }
  
  return result
}

// Migrate all images from static directory
export const migrateAllImages = async (
  projectsDir: string = 'public/scraped-images/work-projects'
): Promise<{
  success: boolean
  totalProjects: number
  successfulProjects: number
  totalImages: number
  migratedImages: number
  errors: string[]
}> => {
  const overallResult = {
    success: true,
    totalProjects: 0,
    successfulProjects: 0,
    totalImages: 0,
    migratedImages: 0,
    errors: [] as string[]
  }
  
  try {
    const fullPath = path.join(process.cwd(), projectsDir)
    const images = await scanProjectImages(fullPath)
    
    // Group images by project
    const projectGroups = images.reduce((acc, img) => {
      if (!acc[img.projectSlug]) {
        acc[img.projectSlug] = []
      }
      acc[img.projectSlug].push(img)
      return acc
    }, {} as Record<string, ImageFile[]>)
    
    overallResult.totalProjects = Object.keys(projectGroups).length
    overallResult.totalImages = images.length
    
    // Migrate each project
    for (const projectSlug of Object.keys(projectGroups)) {
      const projectResult = await migrateProjectImages(projectSlug, fullPath)
      
      if (projectResult.success) {
        overallResult.successfulProjects++
      }
      
      overallResult.migratedImages += projectResult.imagesMigrated
      overallResult.errors.push(...projectResult.errors)
    }
    
    overallResult.success = overallResult.errors.length === 0
    
  } catch (error) {
    overallResult.success = false
    overallResult.errors.push(`Error during migration: ${error}`)
  }
  
  return overallResult
}

// Get migration status
export const getMigrationStatus = async (): Promise<{
  totalMigrated: number
  totalFailed: number
  byProject: Record<string, { success: number; failed: number }>
}> => {
  try {
    const supabase = createClient()
    
    const { data: logs, error } = await supabase
      .from('image_migration_log')
      .select('project_slug, status')
    
    if (error) {
      throw error
    }
    
    const result = {
      totalMigrated: 0,
      totalFailed: 0,
      byProject: {} as Record<string, { success: number; failed: number }>
    }
    
    for (const log of logs || []) {
      const { project_slug, status } = log
      
      if (!result.byProject[project_slug]) {
        result.byProject[project_slug] = { success: 0, failed: 0 }
      }
      
      if (status === 'success') {
        result.totalMigrated++
        result.byProject[project_slug].success++
      } else if (status === 'failed') {
        result.totalFailed++
        result.byProject[project_slug].failed++
      }
    }
    
    return result
    
  } catch (error) {
    console.error('Error getting migration status:', error)
    return {
      totalMigrated: 0,
      totalFailed: 0,
      byProject: {}
    }
  }
} 