# Project Images and Content Management Migration Plan

## Overview
This plan outlines the migration from static file-based images to a full Supabase-powered image management system with rich text editing capabilities.

## 🎯 Goals
- Migrate all existing static images to Supabase Storage
- Replace URL-based image inputs with drag-and-drop file uploads
- Implement image cropping and standardization
- Add rich text editor for project descriptions
- Maintain exact visual consistency with existing project pages
- Auto-populate all existing hardcoded project content

## 📋 Implementation Plan

### Phase 1: Supabase Storage Setup & Migration 
**Priority: CRITICAL (Foundation)**

#### 1.1 Set up Supabase Storage
- [ ] Create storage buckets in Supabase:
  - `project-images` (public bucket)
  - `project-images-temp` (temporary uploads)
- [ ] Configure bucket policies and permissions
- [ ] Set up image optimization policies (auto-compress, WebP conversion)
- [ ] Update environment variables and documentation

#### 1.2 Image Migration Service
- [ ] Create migration script to:
  - Scan all existing images in `/public/scraped-images/work-projects/`
  - Upload to Supabase Storage with proper naming convention
  - Update database records to reference Supabase URLs instead of static paths
  - Generate fallback URLs for missing images

#### 1.3 Content Migration Service
- [ ] Create script to extract content from existing hardcoded project pages:
  - Parse all project page files (`/app/wolf-studio/our-work/*/page.tsx`)
  - Extract `projectData` objects (title, subtitle, description, details, images)
  - Convert to database records with proper relationships
  - Handle duplicate projects and merge data intelligently

### Phase 2: Image Upload & Management System
**Priority: HIGH (Core Functionality)**

#### 2.1 Image Upload Components
- [ ] `ImageUploadZone` component:
  - Drag & drop interface
  - File type validation (JPG and PNG, 5MB limit)
  - Progress indicators
  - Error handling and validation messages

#### 2.2 Image Cropping System
- [ ] `ImageCropper` component:
  - Integration with react-image-crop or similar
  - Preset aspect ratios:
    - Banner: 16:9 or current aspect ratio analysis
    - Gallery: 4:3 or current aspect ratio analysis
  - Real-time preview
  - Minimum resolution enforcement

#### 2.3 Gallery Management Interface
- [ ] `GalleryManager` component:
  - Drag & drop reordering (react-beautiful-dnd)
  - Individual image editing (crop, caption, alt text)
  - Set banner image from gallery
  - Bulk operations (delete multiple, reorder)
  - Thumbnail previews with overlay controls

### Phase 3: Rich Text Editor Integration
**Priority: HIGH (Content Management)**

#### 3.1 Rich Text Editor Setup
- [ ] Install and configure rich text editor:
  - Consider: Tiptap, Quill, or Draft.js
  - Support for: Bold, italic, links, lists, paragraphs
  - Clean HTML output
  - Paste from Word/Google Docs support

#### 3.2 Content Migration
- [ ] Convert existing HTML descriptions to rich text format
- [ ] Migrate paragraph-based descriptions to rich text
- [ ] Ensure backward compatibility with existing content

### Phase 4: Enhanced Admin Interface
**Priority: MEDIUM (UX Improvements)**

#### 4.1 Project Edit Form Enhancement
- [ ] Replace "Banner Image URL" with upload zone
- [ ] Add "Gallery Images" section with:
  - Upload multiple images at once
  - Drag & drop reordering
  - Individual image management
  - Bulk operations

#### 4.2 Rich Text Integration
- [ ] Replace HTML textarea with rich text editor
- [ ] Add formatting toolbar
- [ ] Preview mode
- [ ] Auto-save functionality

#### 4.3 Image Management Features
- [ ] Image library/browser for reusing images
- [ ] Batch upload processing
- [ ] Image optimization settings
- [ ] Storage usage monitoring

### Phase 5: Frontend Updates & Testing
**Priority: MEDIUM (Display Layer)**

#### 5.1 Project Page Updates
- [ ] Update dynamic project page to use Supabase image URLs
- [ ] Ensure responsive image loading
- [ ] Add loading states and error handling
- [ ] Test all existing project pages

#### 5.2 Performance Optimization
- [ ] Implement image lazy loading
- [ ] Add Next.js Image optimization
- [ ] Set up CDN caching headers
- [ ] Optimize for mobile devices

## 🛠 Technical Implementation Details

### File Structure
```
lib/
├── services/
│   ├── image-upload.ts      # Image upload and processing
│   ├── image-migration.ts   # Migration utilities
│   └── content-migration.ts # Content extraction and migration
├── utils/
│   ├── image-processing.ts  # Cropping and optimization
│   └── storage.ts          # Supabase storage helpers
components/
├── admin/
│   ├── ImageUploadZone.tsx
│   ├── ImageCropper.tsx
│   ├── GalleryManager.tsx
│   └── RichTextEditor.tsx
└── ui/
    └── image-cropper.tsx
```

### Database Schema Updates
```sql
-- Add storage-related columns
ALTER TABLE project_images ADD COLUMN storage_path TEXT;
ALTER TABLE project_images ADD COLUMN file_size INTEGER;
ALTER TABLE project_images ADD COLUMN mime_type TEXT;
ALTER TABLE project_images ADD COLUMN crop_data JSONB;

-- Migration tracking
CREATE TABLE image_migration_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_path TEXT NOT NULL,
  new_storage_path TEXT NOT NULL,
  status TEXT NOT NULL,
  migrated_at TIMESTAMP DEFAULT now()
);
```

### Image Processing Pipeline
1. **Upload** → Validate size/type → Temporary storage
2. **Crop** → User interaction → Generate cropped versions
3. **Optimize** → Compress/WebP conversion → Final storage
4. **Database** → Update records with new URLs

### Content Migration Strategy
```typescript
// Extract from existing project pages
const projectData = {
  // From existing files like /app/wolf-studio/our-work/myp/page.tsx
  title: "MYP",
  subtitle: "An SGX listed realestate investment company",
  description: [
    "WOLF was engaged by MYP...",
    "Inspired by a contoured design..."
  ],
  details: [
    { label: "Size", value: "5,000 sqft" },
    { label: "Location", value: "MYP Centre Level 9" }
  ],
  images: [
    { type: "banner", path: "/scraped-images/work-projects/myp/myp-banner.jpg" },
    { type: "gallery", path: "/scraped-images/work-projects/myp/myp-gallery-1.jpg" }
  ]
}
```

## 🔧 Technical Specifications

### Image Requirements
- **Format**: JPG and PNG
- **Max Size**: 5MB
- **Banner Dimensions**: Maintain current aspect ratio (analyze existing)
- **Gallery Dimensions**: Maintain current aspect ratio (analyze existing)
- **Minimum Resolution**: 1920x1080 for banners, 800x600 for gallery
- **Optimization**: Auto-compress to 85% quality, generate WebP versions

### Rich Text Editor Features
- **Formatting**: Bold, italic, underline
- **Structure**: Paragraphs, line breaks
- **Links**: External links with validation
- **Lists**: Bulleted and numbered lists
- **Clean Output**: Sanitized HTML
- **Paste Support**: Clean paste from Word/Google Docs

### Storage Structure
```
project-images/
├── banners/
│   ├── {project-id}/
│   │   ├── original.{jpg|png}
│   │   ├── optimized.{jpg|png}
│   │   └── webp.webp
└── gallery/
    ├── {project-id}/
    │   ├── {image-id}-original.{jpg|png}
    │   ├── {image-id}-optimized.{jpg|png}
    │   └── {image-id}-webp.webp
```

## 📊 Success Metrics
- [ ] All existing images migrated successfully (0 broken images)
- [ ] All existing project content migrated accurately
- [ ] Image upload time < 5 seconds for 5MB files
- [ ] Rich text editor loads < 1 second
- [ ] Gallery reordering works smoothly
- [ ] Mobile responsive image management
- [ ] No performance degradation on project pages

## 🚀 Implementation Order

### Week 1: Foundation
1. Set up Supabase Storage buckets
2. Create image migration script
3. Migrate all existing images
4. Test image serving from Supabase

### Week 2: Core Features
1. Build ImageUploadZone component
2. Implement ImageCropper
3. Create basic GalleryManager
4. Test upload pipeline

### Week 3: Content System
1. Integrate rich text editor
2. Migrate existing content
3. Update admin forms
4. Test content editing workflow

### Week 4: Polish & Testing
1. Add drag & drop reordering
2. Implement image optimization
3. Update frontend display
4. Comprehensive testing

## 🎯 Next Steps
1. **Confirm approach**: Does this plan align with your vision?
2. **Prioritize phases**: Which phase should we tackle first?
3. **Technical choices**: Any preferences for rich text editor or image cropping library?
4. **Timeline**: What's the target completion date?

This plan ensures a smooth migration from static images to a full-featured image management system while maintaining all existing functionality and visual consistency.

## 📝 Implementation Log
- **Created**: 2025-01-03
- **Status**: Planning Phase
- **Next Phase**: Phase 1 - Supabase Storage Setup & Migration 