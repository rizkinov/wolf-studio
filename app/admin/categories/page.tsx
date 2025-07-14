'use client'

import { useState, useEffect } from 'react'
import { CBRECard } from '@/components/cbre-card'
import { CBREButton } from '@/components/cbre-button'
import { Plus, Edit, Trash2, Tag, Save, X } from 'lucide-react'
import { Category, CategoryInsert, CategoryUpdate } from '@/lib/types/database'

interface CategoryFormData {
  name: string
  slug: string
  description: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: ''
  })
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/categories')
      const result = await response.json()
      
      if (!response.ok) {
        console.error('Error loading categories:', result.error)
        return
      }
      
      setCategories(result.data)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingCategory) {
        // Update existing category
        const updates: CategoryUpdate = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null
        }
        const response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            action: 'update',
            id: editingCategory.id,
            ...updates
          }),
        })
        const result = await response.json()
        
        if (!response.ok) {
          console.error('Error updating category:', result.error)
          return
        }
      } else {
        // Create new category
        const categoryData: CategoryInsert = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null
        }
        const response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            action: 'create',
            ...categoryData
          }),
        })
        const result = await response.json()
        
        if (!response.ok) {
          console.error('Error creating category:', result.error)
          return
        }
      }

      // Reset form and reload categories
      setFormData({ name: '', slug: '', description: '' })
      setEditingCategory(null)
      setShowForm(false)
      loadCategories()
    } catch (error) {
      console.error('Error submitting category:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            action: 'delete',
            id: id
          }),
        })
        const result = await response.json()
        
        if (!response.ok) {
          console.error('Error deleting category:', result.error)
          return
        }
        loadCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
      }
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', slug: '', description: '' })
    setEditingCategory(null)
    setShowForm(false)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-financier text-cbre-green mb-2">
            Categories
          </h1>
          <p className="text-dark-grey font-calibre">
            Organize your projects by category
          </p>
        </div>
        <CBREButton
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Category</span>
        </CBREButton>
      </div>

      {/* Form */}
      {showForm && (
        <CBRECard className="p-6 mb-6">
          <h3 className="font-financier text-lg text-cbre-green mb-4">
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-grey mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-grey mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-grey mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent"
              />
            </div>
            <div className="flex space-x-4">
              <CBREButton
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{editingCategory ? 'Update' : 'Create'}</span>
              </CBREButton>
              <CBREButton
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </CBREButton>
            </div>
          </form>
        </CBRECard>
      )}

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <CBRECard className="p-8 text-center col-span-full">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-dark-grey font-calibre">No categories found.</p>
            <CBREButton
              onClick={() => setShowForm(true)}
              className="mt-4 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Category</span>
            </CBREButton>
          </CBRECard>
        ) : (
          categories.map((category) => (
            <CBRECard key={category.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-cbre-green" />
                  <h3 className="font-financier text-lg text-cbre-green">
                    {category.name}
                  </h3>
                </div>
                <div className="flex space-x-2">
                  <CBREButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </CBREButton>
                  <CBREButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </CBREButton>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Slug:</span>
                  <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
                    {category.slug}
                  </code>
                </div>
                {category.description && (
                  <p className="text-dark-grey font-calibre text-sm">
                    {category.description}
                  </p>
                )}
                <div className="text-xs text-gray-400">
                  Created: {new Date(category.created_at).toLocaleDateString()}
                </div>
              </div>
            </CBRECard>
          ))
        )}
      </div>
    </div>
  )
} 