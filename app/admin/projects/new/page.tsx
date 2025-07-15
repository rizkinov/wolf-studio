'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Eye, Save } from 'lucide-react'
import { CBRECard } from '@/components/cbre/cbre-card'
import { CBREButton } from '@/components/cbre/cbre-button'
import { CBREBadge } from '@/components/cbre/cbre-badge'
import Link from 'next/link'
import { Category, ProjectInsert, ProjectDescription } from '@/lib/types/database'
import ImageUploadZone from '@/components/admin/ImageUploadZone'
// Remove the direct import of createUploadFunction
// import { createUploadFunction } from '@/lib/services/image-upload'
import RichTextEditor, { isContentEmpty } from '@/components/admin/RichTextEditor'
import { createClient } from '@/lib/supabase/client'

interface ProjectFormData {
  title: string
  subtitle: string
  slug: string
  category_id: string
  is_published: boolean
  featured: boolean
  year: number | null
  size: string
  location: string
  scope: string
  description: ProjectDescription | null
  order_index: number
  banner_image_url: string
}

export default function NewProjectPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    subtitle: '',
    slug: '',
    category_id: '',
    is_published: false,
    featured: false,
    year: null,
    size: '',
    location: '',
    scope: '',
    description: null,
    order_index: 1,
    banner_image_url: ''
  })
  const [galleryImageUploads, setGalleryImageUploads] = useState<string[]>([]) // Store gallery image URLs

  // State for form handling
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Upload functions for API route calls
  const handleBannerUpload = async (file: File, onProgress: (progress: number) => void) => {
    try {
      // Get the current session for authentication
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session. Please log in again.')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('imageType', 'banner')
      // The projectId is not available here, so it's not appended.
      // This function is primarily for new projects.

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      return {
        url: result.url,
        path: result.path
      }
    } catch (error) {
      console.error('Banner upload error:', error)
      throw error
    }
  }

  const handleGalleryUpload = async (file: File, onProgress: (progress: number) => void) => {
    try {
      // Get the current session for authentication
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session. Please log in again.')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('imageType', 'gallery')
      // The projectId is not available here, so it's not appended.
      // This function is primarily for new projects.

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      return {
        url: result.url,
        path: result.path
      }
    } catch (error) {
      console.error('Gallery upload error:', error)
      throw error
    }
  }

  // Load categories on component mount
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      const result = await response.json()
      
      if (!response.ok) {
        console.error('Error loading categories:', result.error)
        return
      }
      
      setCategories(result.data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: '' }))
    }
  }

  const handleInputChange = (field: keyof ProjectFormData, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleDescriptionChange = (content: string) => {
    const description: ProjectDescription = {
      content,
      format: 'html',
      meta: {
        version: '1.0',
        lastModified: new Date().toISOString()
      }
    }
    setFormData(prev => ({ ...prev, description }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required'
    }

    if (!formData.subtitle.trim()) {
      newErrors.subtitle = 'Subtitle is required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    if (!formData.scope.trim()) {
      newErrors.scope = 'Scope is required'
    }

    if (formData.year && (formData.year < 1900 || formData.year > new Date().getFullYear() + 10)) {
      newErrors.year = 'Please enter a valid year'
    }

    // Validate banner image URL if provided
    if (formData.banner_image_url && formData.banner_image_url.trim()) {
      try {
        new URL(formData.banner_image_url)
      } catch {
        newErrors.banner_image_url = 'Please enter a valid URL'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const projectData: ProjectInsert = {
        title: formData.title,
        subtitle: formData.subtitle,
        slug: formData.slug,
        category_id: formData.category_id || null,
        is_published: formData.is_published,
        featured: formData.featured,
        year: formData.year,
        size: formData.size || null,
        location: formData.location,
        scope: formData.scope,
        description: formData.description,
        order_index: formData.order_index,
        banner_image_url: formData.banner_image_url || null,
        published_at: formData.is_published ? new Date().toISOString() : null
      }

      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'create',
          ...projectData
        }),
      })
      const result = await response.json()
      
      if (!response.ok) {
        console.error('Error creating project:', result.error)
        // Handle specific errors
        if (result.error.includes('duplicate key')) {
          setErrors({ slug: 'This slug is already taken. Please choose a different one.' })
        } else {
          setErrors({ general: 'Failed to create project. Please try again.' })
        }
        return
      }

            // Associate gallery images with the new project
      if (result.data && galleryImageUploads.length > 0) {
        console.log('🔄 Starting gallery image migration for project:', result.data.id)
        console.log('📁 Gallery images to migrate:', galleryImageUploads.length)
        console.log('📎 Image URLs:', galleryImageUploads)
        
        try {
          // Call API to migrate temp images to permanent location
          console.log('📡 Calling migration API...')
          const requestBody = {
            projectId: result.data.id,
            tempImageUrls: galleryImageUploads
          }
          console.log('📤 Request body:', requestBody)
          
          const response = await fetch('/api/admin/migrate-temp-images', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          })
          
          console.log('📥 API response status:', response.status)
          console.log('📥 API response ok:', response.ok)
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ API error response:', errorText)
            throw new Error(`Migration failed: ${errorText}`)
          }
          
          const migrationResult = await response.json()
          console.log('✅ Migration result:', migrationResult)
          console.log(`🎉 Gallery images migrated: ${migrationResult.successful}/${migrationResult.processed}`)
          
          if (migrationResult.failed > 0) {
            console.warn(`⚠️ ${migrationResult.failed} images failed to migrate`)
            console.warn('Failed results:', migrationResult.results.filter((r: any) => !r.success))
          }
          
        } catch (imageError) {
          console.error('❌ Error migrating gallery images:', imageError)
          console.error('❌ Error details:', imageError instanceof Error ? imageError.message : String(imageError))
          console.error('❌ Error stack:', imageError instanceof Error ? imageError.stack : 'No stack trace')
          // Don't fail the whole operation, just log the error
        }
      } else {
        console.log('ℹ️ No gallery images to migrate or no project data')
        console.log('   Project data exists:', !!result.data)
        console.log('   Gallery uploads count:', galleryImageUploads.length)
      }

      // Success - redirect to projects list
      router.push('/admin/projects')
    } catch (error) {
      console.error('Error creating project:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto p-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/admin/projects">
              <CBREButton variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </CBREButton>
            </Link>
            <div>
              <h1 className="text-2xl font-financier text-cbre-green mb-1">
                Create New Project
              </h1>
              <p className="text-dark-grey font-calibre">
                Add a new project to your portfolio
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <CBREButton
              variant="outline"
              onClick={() => setFormData(prev => ({ ...prev, is_published: !prev.is_published }))}
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>{formData.is_published ? 'Published' : 'Draft'}</span>
            </CBREButton>
          </div>
        </div>

        {/* Error Alert */}
        {errors.general && (
          <CBRECard className="p-4 mb-4 border-red-200 bg-red-50">
            <p className="text-red-600 font-calibre">{errors.general}</p>
          </CBRECard>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic Information */}
            <CBRECard className="p-5">
              <h3 className="font-financier text-lg text-cbre-green mb-3">
                Basic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter project title"
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-2">
                    Subtitle *
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent ${
                      errors.subtitle ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter project subtitle"
                  />
                  {errors.subtitle && (
                    <p className="text-red-600 text-sm mt-1">{errors.subtitle}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-2">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent ${
                      errors.slug ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="project-url-slug"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    URL: /wolf-studio/our-work/{formData.slug || 'project-slug'}
                  </p>
                  {errors.slug && (
                    <p className="text-red-600 text-sm mt-1">{errors.slug}</p>
                  )}
                </div>
              </div>
            </CBRECard>

            {/* Project Details */}
            <CBRECard className="p-5">
              <h3 className="font-financier text-lg text-cbre-green mb-3">
                Project Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent ${
                      errors.location ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="City, Country"
                  />
                  {errors.location && (
                    <p className="text-red-600 text-sm mt-1">{errors.location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.year || ''}
                    onChange={(e) => handleInputChange('year', e.target.value ? parseInt(e.target.value) : null)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent ${
                      errors.year ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="2024"
                    min="1900"
                    max={new Date().getFullYear() + 10}
                  />
                  {errors.year && (
                    <p className="text-red-600 text-sm mt-1">{errors.year}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-2">
                    Size
                  </label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent"
                    placeholder="e.g., 50,000 sq ft"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-2">
                    Scope *
                  </label>
                  <input
                    type="text"
                    value={formData.scope}
                    onChange={(e) => handleInputChange('scope', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent ${
                      errors.scope ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Design & Build"
                  />
                  {errors.scope && (
                    <p className="text-red-600 text-sm mt-1">{errors.scope}</p>
                  )}
                </div>
              </div>
            </CBRECard>

            {/* Description */}
            <CBRECard className="p-5">
              <h3 className="font-financier text-lg text-cbre-green mb-3">
                Project Description
              </h3>
              <div>
                <label className="block text-sm font-medium text-dark-grey mb-2">
                  Description
                </label>
                <RichTextEditor
                  content={formData.description?.content || ''}
                  onChange={(content) => handleDescriptionChange(content)}
                  placeholder="Enter the project description using the rich text editor..."
                  minHeight="300px"
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
                <p className="text-gray-500 text-sm mt-2">
                  Use the toolbar above to format your content with headings, lists, links, and more.
                </p>
              </div>
            </CBRECard>

            {/* Images */}
            <CBRECard className="p-6">
              <h3 className="font-financier text-lg text-cbre-green mb-4">
                Project Images
              </h3>
              <div className="space-y-6">
                {/* Banner Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-3">
                    Banner Image
                  </label>
                  <ImageUploadZone
                    multiple={false}
                    accept={{
                      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
                    }}
                    maxSize={5 * 1024 * 1024} // 5MB
                    uploadFn={async (file: File, onProgress: (progress: number) => void) => {
                      try {
                        const result = await handleBannerUpload(file, onProgress);
                        handleInputChange('banner_image_url', result.url);
                        return { url: result.url, path: result.path };
                      } catch (error) {
                        console.error('Banner upload error:', error);
                        throw error;
                      }
                    }}
                    onUpload={(files: any[]) => {
                      if (files.length > 0 && files[0].status === 'success') {
                        // Update form data with the uploaded banner image URL
                        const uploadedFile = files[0]
                        if (uploadedFile.url) {
                          handleInputChange('banner_image_url', uploadedFile.url)
                        }
                      }
                    }}
                    className="mb-4"
                  />
                  <p className="text-gray-500 text-sm">
                    Main project image displayed on listing and detail pages (16:9 aspect ratio recommended)
                  </p>
                </div>

                {/* Gallery Images */}
                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-3">
                    Gallery Images
                  </label>
                  <ImageUploadZone
                    multiple={true}
                    maxFiles={10}
                    accept={{
                      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
                    }}
                    maxSize={5 * 1024 * 1024} // 5MB
                    uploadFn={async (file: File, onProgress: (progress: number) => void) => {
                      try {
                        const result = await handleGalleryUpload(file, onProgress);
                        return { url: result.url, path: result.path };
                      } catch (error) {
                        console.error('Gallery upload error:', error);
                        throw error;
                      }
                    }}
                    onUpload={(files: any[]) => {
                      console.log('Gallery images uploaded:', files)
                      // Store uploaded image URLs for later association with project
                      const successfulUploads = files
                        .filter((file: any) => file.status === 'success' && file.url)
                        .map((file: any) => file.url)
                      
                      if (successfulUploads.length > 0) {
                        setGalleryImageUploads(prev => [...prev, ...successfulUploads])
                      }
                    }}
                    className="mb-4"
                  />
                  <p className="text-gray-500 text-sm">
                    Additional project images for the gallery (4:3 aspect ratio recommended)
                  </p>
                </div>

                {/* Legacy URL Input (for backwards compatibility) */}
                <details className="group">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    Advanced: Use Image URL Instead
                  </summary>
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-dark-grey mb-2">
                      Banner Image URL
                    </label>
                    <input
                      type="text"
                      value={formData.banner_image_url}
                      onChange={(e) => handleInputChange('banner_image_url', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent ${
                        errors.banner_image_url ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="https://example.com/image.jpg"
                    />
                    {errors.banner_image_url && (
                      <p className="text-red-500 text-sm mt-1">{errors.banner_image_url}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-1">
                      Manually enter an image URL (overrides uploaded banner)
                    </p>
                  </div>
                </details>
              </div>
            </CBRECard>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Publish Settings */}
            <CBRECard className="p-5">
              <h3 className="font-financier text-lg text-cbre-green mb-3">
                Publish Settings
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-dark-grey font-calibre">Status</span>
                  <CBREBadge className={formData.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {formData.is_published ? 'Published' : 'Draft'}
                  </CBREBadge>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => handleInputChange('is_published', e.target.checked)}
                    className="rounded border-gray-300 text-cbre-green focus:ring-cbre-green"
                  />
                  <label htmlFor="is_published" className="text-sm text-dark-grey">
                    Publish immediately
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="rounded border-gray-300 text-cbre-green focus:ring-cbre-green"
                  />
                  <label htmlFor="featured" className="text-sm text-dark-grey">
                    Featured project
                  </label>
                </div>
              </div>
            </CBRECard>

            {/* Category & Order */}
            <CBRECard className="p-6">
              <h3 className="font-financier text-lg text-cbre-green mb-4">
                Organization
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent ${
                      errors.category_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="text-red-600 text-sm mt-1">{errors.category_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => handleInputChange('order_index', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent"
                    min="1"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Lower numbers appear first
                  </p>
                </div>
              </div>
            </CBRECard>

            {/* Actions */}
            <div className="space-y-2">
              <CBREButton
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isSubmitting ? 'Creating...' : 'Create Project'}</span>
              </CBREButton>
              
              <Link href="/admin/projects" className="block">
                <CBREButton
                  type="button"
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </CBREButton>
              </Link>
            </div>
          </div>
        </div>
      </form>
      </div>
    </div>
  )
} 