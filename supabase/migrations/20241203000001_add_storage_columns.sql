-- Migration: Add storage-related columns for image management
-- Created: 2024-12-03

-- Add storage-related columns to project_images table
ALTER TABLE project_images ADD COLUMN storage_path TEXT;
ALTER TABLE project_images ADD COLUMN file_size INTEGER;
ALTER TABLE project_images ADD COLUMN mime_type TEXT;
ALTER TABLE project_images ADD COLUMN crop_data JSONB;

-- Create migration tracking table
CREATE TABLE image_migration_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_path TEXT NOT NULL,
  new_storage_path TEXT NOT NULL,
  project_slug TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  migrated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for migration log
CREATE INDEX idx_image_migration_log_project_slug ON image_migration_log(project_slug);
CREATE INDEX idx_image_migration_log_status ON image_migration_log(status);
CREATE INDEX idx_image_migration_log_migrated_at ON image_migration_log(migrated_at);

-- Add comment for documentation
COMMENT ON TABLE image_migration_log IS 'Tracks migration of images from static files to Supabase Storage'; 