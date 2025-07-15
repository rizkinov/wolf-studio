'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CBRECard } from '@/components/cbre/cbre-card'
import { CBREButton } from '@/components/cbre/cbre-button'
import { CBREBadge } from '@/components/cbre/cbre-badge'
import { ArrowLeft, Save, Eye, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { ProjectService, CategoryService } from '@/lib/services/database'
import { Category, ProjectWithCategoryAndImages, ProjectUpdate, ProjectDescription } from '@/lib/types/database'
import RichTextEditor, { isContentEmpty } from '@/components/admin/RichTextEditor'
import ImageUploadZone from '@/components/admin/ImageUploadZone'
import GalleryManager from '@/components/admin/GalleryManager'
// Remove the direct import of createUploadFunction
// import { createUploadFunction } from '@/lib/services/image-upload'
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

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<ProjectWithCategoryAndImages | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadProject = useCallback(async () => {
    try {
      setLoading(true)
      const result = await ProjectService.getProject(projectId)
      if (result.error) {
        console.error('Error loading project:', result.error)
        router.push('/admin/projects')
        return
      }

      if (!result.data) {
        router.push('/admin/projects')
        return
      }

      const proj = result.data
      setProject(proj)
      setFormData({
        title: proj.title,
        subtitle: proj.subtitle || '',
        slug: proj.slug,
        category_id: proj.category_id || '',
        is_published: proj.is_published,
        featured: proj.featured,
        year: proj.year,
        size: proj.size || '',
        location: proj.location || '',
        scope: proj.scope || '',
        description: proj.description,
        order_index: proj.order_index,
        banner_image_url: proj.banner_image_url || ''
      })
    } catch (error) {
      console.error('Error loading project:', error)
      router.push('/admin/projects')
    } finally {
      setLoading(false)
    }
  }, [projectId, router])

  useEffect(() => {
    loadProject()
    loadCategories()
  }, [loadProject])

  const loadCategories = async () => {
    try {
      const result = await CategoryService.getCategories()
      if (result.error) {
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
      // Only auto-generate slug if it matches the current title's slug
      ...(prev.slug === generateSlug(prev.title) ? { slug: generateSlug(title) } : {})
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
        version: formData.description?.meta?.version || '1.0',
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
      const updates: ProjectUpdate = {
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
        published_at: formData.is_published && !project?.is_published ? new Date().toISOString() : undefined
      }

      const result = await ProjectService.updateProject(projectId, updates)
      
      if (result.error) {
        console.error('Error updating project:', result.error)
        if (result.error.includes('duplicate key')) {
          setErrors({ slug: 'This slug is already taken. Please choose a different one.' })
        } else {
          setErrors({ general: 'Failed to update project. Please try again.' })
        }
        return
      }

      // Success - redirect to projects list
      router.push('/admin/projects')
    } catch (error) {
      console.error('Error updating project:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!project) return

    if (window.confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
      try {
        const result = await ProjectService.deleteProject(projectId)
        if (result.error) {
          console.error('Error deleting project:', result.error)
          setErrors({ general: 'Failed to delete project. Please try again.' })
          return
        }
        router.push('/admin/projects')
      } catch (error) {
        console.error('Error deleting project:', error)
        setErrors({ general: 'An unexpected error occurred. Please try again.' })
      }
    }
  }

  // Replace the createUploadFunction usage with API route calls
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
      if (projectId) {
        formData.append('projectId', projectId)
      }

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
      if (projectId) {
        formData.append('projectId', projectId)
      }

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

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto p-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/admin/projects">
              <CBREButton variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </CBREButton>
            </Link>
            <div>
              <h1 className="text-2xl font-financier text-cbre-green mb-1">
                Edit Project
              </h1>
              <p className="text-dark-grey font-calibre">
                {project.title}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href={`/wolf-studio/our-work/${project.slug}`} target="_blank">
              <CBREButton
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Preview</span>
              </CBREButton>
            </Link>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Description (HTML)
                  </label>
                  <RichTextEditor
                    content={formData.description?.content || ''}
                    onChange={handleDescriptionChange}
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
              <CBRECard className="p-5">
                <h3 className="font-financier text-lg text-cbre-green mb-3">
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
                      uploadFn={handleBannerUpload}
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
                    <GalleryManager
                      projectId={projectId}
                      onImageUpload={async (files: File[]) => {
                        console.log('Uploading gallery images:', files)
                        try {
                          // Upload each file using the upload function
                          const uploadPromises = files.map(file => 
                            handleGalleryUpload(file, () => {})
                          )
                          
                          const results = await Promise.all(uploadPromises)
                          console.log('Gallery images uploaded successfully:', results)
                          
                          // Reload the project to get updated images
                          await loadProject()
                        } catch (error) {
                          console.error('Error uploading gallery images:', error)
                        }
                      }}
                      onGalleryUpdate={(images) => {
                        console.log('Gallery updated:', images)
                        // Images are automatically loaded from database
                      }}
                    />
                    <p className="text-gray-500 text-sm mt-2">
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
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--cbre-green)] focus:border-transparent ${
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
                      {formData.banner_image_url && (
                        <div className="mt-2">
                          <img
                            src={formData.banner_image_url}
                            alt="Banner preview"
                            className="w-full h-32 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
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
                <div className="space-y-4">
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
                      Published
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
                  {project.published_at && (
                    <div className="text-xs text-gray-500">
                      Published: {new Date(project.published_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CBRECard>

              {/* Category & Order */}
              <CBRECard className="p-5">
                <h3 className="font-financier text-lg text-cbre-green mb-3">
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
                  <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                </CBREButton>
                
                <CBREButton
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Project</span>
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