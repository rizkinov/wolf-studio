#!/usr/bin/env node

/**
 * Image Migration Script for Wolf Studio
 * 
 * This script handles:
 * 1. Setting up Supabase Storage buckets
 * 2. Migrating existing images from static files to Supabase Storage
 * 3. Running database migrations
 * 
 * Usage:
 *   node scripts/migrate-images.js [--setup-only] [--migrate-only] [--dry-run]
 * 
 * Options:
 *   --setup-only: Only set up storage buckets, don't migrate images
 *   --migrate-only: Only migrate images, skip bucket setup
 *   --dry-run: Show what would be done without actually doing it
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const STORAGE_BUCKETS = {
  PROJECT_IMAGES: 'project-images',
  PROJECT_IMAGES_TEMP: 'project-images-temp'
}

// Parse command line arguments
const args = process.argv.slice(2)
const setupOnly = args.includes('--setup-only')
const migrateOnly = args.includes('--migrate-only')
const dryRun = args.includes('--dry-run')

// Utility functions
const log = (message) => console.log(`[${new Date().toISOString()}] ${message}`)
const error = (message) => console.error(`[${new Date().toISOString()}] ERROR: ${message}`)
const success = (message) => console.log(`[${new Date().toISOString()}] ✅ ${message}`)

// Validate environment
function validateEnvironment() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    error('Missing required environment variables:')
    error('  - NEXT_PUBLIC_SUPABASE_URL')
    error('  - SUPABASE_SERVICE_ROLE_KEY')
    error('Please set these in your .env.local file.')
    process.exit(1)
  }
}

// Create Supabase client
function createSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}

// Set up storage buckets
async function setupStorageBuckets() {
  log('Setting up Supabase Storage buckets...')
  
  const supabase = createSupabaseClient()
  
  for (const [bucketName, bucketId] of Object.entries(STORAGE_BUCKETS)) {
    try {
      log(`Setting up bucket: ${bucketId}`)
      
      if (dryRun) {
        log(`[DRY RUN] Would create bucket: ${bucketId}`)
        continue
      }
      
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        error(`Failed to list buckets: ${listError.message}`)
        continue
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === bucketId)
      
      if (bucketExists) {
        log(`Bucket ${bucketId} already exists`)
        continue
      }
      
      // Create bucket
      const { error: createError } = await supabase.storage.createBucket(bucketId, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5 * 1024 * 1024 // 5MB
      })
      
      if (createError) {
        error(`Failed to create bucket ${bucketId}: ${createError.message}`)
      } else {
        success(`Created bucket: ${bucketId}`)
      }
      
    } catch (err) {
      error(`Error setting up bucket ${bucketId}: ${err.message}`)
    }
  }
}

// Run database migrations
async function runDatabaseMigrations() {
  log('Running database migrations...')
  
  const supabase = createSupabaseClient()
  
  try {
    // Read and execute the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20241203000001_add_storage_columns.sql')
    
    if (!fs.existsSync(migrationPath)) {
      error(`Migration file not found: ${migrationPath}`)
      return false
    }
    
    const migrationSql = fs.readFileSync(migrationPath, 'utf8')
    
    if (dryRun) {
      log('[DRY RUN] Would execute migration SQL')
      return true
    }
    
    // Execute the migration
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql: migrationSql
    })
    
    if (migrationError) {
      error(`Migration failed: ${migrationError.message}`)
      return false
    }
    
    success('Database migrations completed')
    return true
    
  } catch (err) {
    error(`Error running migrations: ${err.message}`)
    return false
  }
}

// Scan for existing images
function scanExistingImages() {
  const imagesDir = path.join(__dirname, '../public/scraped-images/work-projects')
  const images = []
  
  if (!fs.existsSync(imagesDir)) {
    error(`Images directory not found: ${imagesDir}`)
    return []
  }
  
  try {
    const projectDirs = fs.readdirSync(imagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
    
    for (const projectSlug of projectDirs) {
      const projectPath = path.join(imagesDir, projectSlug)
      const files = fs.readdirSync(projectPath)
        .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
      
      for (const filename of files) {
        const filePath = path.join(projectPath, filename)
        const stats = fs.statSync(filePath)
        const type = filename.includes('-banner.') ? 'banner' : 'gallery'
        
        images.push({
          projectSlug,
          filename,
          type,
          localPath: filePath,
          size: stats.size,
          relativePath: `scraped-images/work-projects/${projectSlug}/${filename}`
        })
      }
    }
  } catch (err) {
    error(`Error scanning images: ${err.message}`)
  }
  
  return images
}

// Migrate a single image
async function migrateImage(image, supabase) {
  try {
    const fileBuffer = fs.readFileSync(image.localPath)
    const mimeType = image.filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
    
    // Generate storage path
    const baseFolder = image.type === 'banner' ? 'banners' : 'gallery'
    const storagePath = `${baseFolder}/${image.projectSlug}/${image.filename}`
    
    if (dryRun) {
      log(`[DRY RUN] Would migrate: ${image.relativePath} -> ${storagePath}`)
      return { success: true, storagePath }
    }
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.PROJECT_IMAGES)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true
      })
    
    if (uploadError) {
      return { success: false, error: uploadError.message }
    }
    
    // Log migration to database
    const { error: logError } = await supabase
      .from('image_migration_log')
      .insert({
        original_path: image.relativePath,
        new_storage_path: storagePath,
        project_slug: image.projectSlug,
        status: 'success'
      })
    
    if (logError) {
      error(`Failed to log migration: ${logError.message}`)
    }
    
    return { success: true, storagePath }
    
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// Migrate all images
async function migrateImages() {
  log('Starting image migration...')
  
  const images = scanExistingImages()
  
  if (images.length === 0) {
    log('No images found to migrate')
    return
  }
  
  log(`Found ${images.length} images across ${new Set(images.map(i => i.projectSlug)).size} projects`)
  
  // Group by project for better reporting
  const projectGroups = images.reduce((acc, img) => {
    if (!acc[img.projectSlug]) {
      acc[img.projectSlug] = []
    }
    acc[img.projectSlug].push(img)
    return acc
  }, {})
  
  const supabase = createSupabaseClient()
  let totalMigrated = 0
  let totalFailed = 0
  
  for (const [projectSlug, projectImages] of Object.entries(projectGroups)) {
    log(`Migrating ${projectImages.length} images for project: ${projectSlug}`)
    
    for (const image of projectImages) {
      const result = await migrateImage(image, supabase)
      
      if (result.success) {
        totalMigrated++
        log(`✅ ${image.filename} -> ${result.storagePath}`)
      } else {
        totalFailed++
        error(`❌ ${image.filename}: ${result.error}`)
        
        // Log failure to database
        if (!dryRun) {
          await supabase
            .from('image_migration_log')
            .insert({
              original_path: image.relativePath,
              new_storage_path: '',
              project_slug: image.projectSlug,
              status: 'failed',
              error_message: result.error
            })
        }
      }
    }
  }
  
  log(`Migration complete: ${totalMigrated} succeeded, ${totalFailed} failed`)
}

// Main function
async function main() {
  console.log('🖼️  Wolf Studio Image Migration Tool')
  console.log('=====================================')
  
  validateEnvironment()
  
  if (dryRun) {
    log('DRY RUN MODE - No actual changes will be made')
  }
  
  try {
    // Step 1: Run database migrations (unless migrate-only)
    if (!migrateOnly) {
      await runDatabaseMigrations()
    }
    
    // Step 2: Set up storage buckets (unless migrate-only)
    if (!migrateOnly) {
      await setupStorageBuckets()
    }
    
    // Step 3: Migrate images (unless setup-only)
    if (!setupOnly) {
      await migrateImages()
    }
    
    success('Migration process completed!')
    
  } catch (err) {
    error(`Migration failed: ${err.message}`)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
} 