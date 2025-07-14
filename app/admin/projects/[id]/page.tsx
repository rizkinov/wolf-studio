'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CBRECard } from '@/components/cbre-card'
import { CBREButton } from '@/components/cbre-button'
import { CBREBadge } from '@/components/cbre-badge'
import { ArrowLeft, Save, Eye, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { ProjectService, CategoryService } from '@/lib/services/database'
import { Category, ProjectWithCategoryAndImages, ProjectUpdate, ProjectDescription } from '@/lib/types/database'

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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin/projects">
            <CBREButton variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </CBREButton>
          </Link>
          <div>
            <h1 className="text-2xl font-financier text-cbre-green mb-2">
              Edit Project
            </h1>
            <p className="text-dark-grey font-calibre">
              {project.title}
            </p>
          </div>
        </div>
        <div className="flex space-x-4">
          <Link href={`/wolf-studio/our-work/${project.slug}`} target="_blank">
            <CBREButton variant="outline" className="flex items-center space-x-2">
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
        <CBRECard className="p-4 mb-6 border-red-200 bg-red-50">
          <p className="text-red-600 font-calibre">{errors.general}</p>
        </CBRECard>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <CBRECard className="p-6">
              <h3 className="font-financier text-lg text-cbre-green mb-4">
                Basic Information
              </h3>
              <div className="space-y-4">
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
            <CBRECard className="p-6">
              <h3 className="font-financier text-lg text-cbre-green mb-4">
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
            <CBRECard className="p-6">
              <h3 className="font-financier text-lg text-cbre-green mb-4">
                Project Description
              </h3>
              <div>
                <label className="block text-sm font-medium text-dark-grey mb-2">
                  Description (HTML)
                </label>
                <textarea
                  value={formData.description?.content || ''}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent font-mono text-sm"
                  placeholder="Enter HTML content for the project description..."
                />
                <p className="text-gray-500 text-sm mt-1">
                  You can use HTML tags for formatting. Rich text editor coming soon.
                </p>
              </div>
            </CBRECard>

            {/* Images */}
            <CBRECard className="p-6">
              <h3 className="font-financier text-lg text-cbre-green mb-4">
                Project Images
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-2">
                    Banner Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.banner_image_url}
                    onChange={(e) => handleInputChange('banner_image_url', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Main project image displayed on listing and detail pages
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
              </div>
            </CBRECard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <CBRECard className="p-6">
              <h3 className="font-financier text-lg text-cbre-green mb-4">
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
            <div className="space-y-3">
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
  )
} 