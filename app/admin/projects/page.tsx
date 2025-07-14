'use client'

import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { CBRECard } from '@/components/cbre-card'
import { CBREButton } from '@/components/cbre-button'
import { CBREBadge } from '@/components/cbre-badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, GripVertical, Copy, Filter, X } from 'lucide-react'
import Link from 'next/link'
import { ProjectService, CategoryService } from '@/lib/services/database'
import { ProjectWithCategoryAndImages, Category } from '@/lib/types/database'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithCategoryAndImages[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState<'title' | 'created_at' | 'updated_at' | 'order_index'>('order_index')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'not-featured'>('all')
  const [yearFilter, setYearFilter] = useState<string>('')
  
  // Bulk operations
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  
  // Drag and drop
  const [isDragMode, setIsDragMode] = useState(false)
  const [draggedProjects, setDraggedProjects] = useState<ProjectWithCategoryAndImages[]>([])

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      const filters = {
        search: searchTerm || undefined,
        category_id: selectedCategory || undefined,
        is_published: publishedFilter === 'all' ? undefined : publishedFilter === 'published',
        featured: featuredFilter === 'all' ? undefined : featuredFilter === 'featured',
        year: yearFilter ? parseInt(yearFilter) : undefined
      }
      
      const result = await ProjectService.getProjects(filters, {
        page: currentPage,
        limit: 10
      }, {
        column: sortBy,
        order: sortOrder
      })
      
      if (result.error) {
        console.error('Error loading projects:', result.error)
        return
      }
      
      setProjects(result.data)
      setDraggedProjects(result.data)
      setTotalPages(Math.ceil(result.count / 10))
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCategory, publishedFilter, featuredFilter, yearFilter, currentPage, sortBy, sortOrder])

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

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  useEffect(() => {
    loadCategories()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    try {
      const result = await ProjectService.deleteProject(id)
      if (result.error) {
        console.error('Error deleting project:', result.error)
        return
      }
      loadProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const result = await ProjectService.updateProject(id, {
        is_published: !currentStatus
      })
      if (result.error) {
        console.error('Error updating project:', result.error)
        return
      }
      loadProjects()
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const handleDuplicate = async (projectId: string) => {
    try {
      const result = await ProjectService.duplicateProject(projectId)
      if (result.error) {
        console.error('Error duplicating project:', result.error)
        return
      }
      loadProjects()
    } catch (error) {
      console.error('Error duplicating project:', error)
    }
  }

  const handleDragEnd = async (result: { destination?: { index: number } | null; source: { index: number } }) => {
    if (!result.destination) return

    const items = Array.from(draggedProjects)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setDraggedProjects(items)

    // Update order indexes
    const reorderData = items.map((item, index) => ({
      id: item.id,
      order_index: index + 1
    }))

    try {
      const result = await ProjectService.reorderProjects(reorderData)
      if (result.error) {
        console.error('Error reordering projects:', result.error)
        // Revert on error
        setDraggedProjects(projects)
        return
      }
      // Refresh the projects list
      loadProjects()
    } catch (error) {
      console.error('Error reordering projects:', error)
      setDraggedProjects(projects)
    }
  }

  const handleSelectProject = (projectId: string) => {
    const newSelected = new Set(selectedProjects)
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId)
    } else {
      newSelected.add(projectId)
    }
    setSelectedProjects(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const handleSelectAll = () => {
    if (selectedProjects.size === projects.length) {
      setSelectedProjects(new Set())
      setShowBulkActions(false)
    } else {
      setSelectedProjects(new Set(projects.map(p => p.id)))
      setShowBulkActions(true)
    }
  }

  const handleBulkPublish = async () => {
    try {
      const result = await ProjectService.bulkUpdateProjects(
        Array.from(selectedProjects),
        { is_published: true }
      )
      if (result.error) {
        console.error('Error bulk publishing projects:', result.error)
        return
      }
      setSelectedProjects(new Set())
      setShowBulkActions(false)
      loadProjects()
    } catch (error) {
      console.error('Error bulk publishing projects:', error)
    }
  }

  const handleBulkUnpublish = async () => {
    try {
      const result = await ProjectService.bulkUpdateProjects(
        Array.from(selectedProjects),
        { is_published: false }
      )
      if (result.error) {
        console.error('Error bulk unpublishing projects:', result.error)
        return
      }
      setSelectedProjects(new Set())
      setShowBulkActions(false)
      loadProjects()
    } catch (error) {
      console.error('Error bulk unpublishing projects:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedProjects.size} projects?`)) return
    
    try {
      const deletePromises = Array.from(selectedProjects).map(id => 
        ProjectService.deleteProject(id)
      )
      
      const results = await Promise.all(deletePromises)
      const hasErrors = results.some(r => r.error)
      
      if (hasErrors) {
        console.error('Some projects failed to delete')
      }
      
      setSelectedProjects(new Set())
      setShowBulkActions(false)
      loadProjects()
    } catch (error) {
      console.error('Error bulk deleting projects:', error)
    }
  }

  const getStatusColor = (isPublished: boolean) => {
    return isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-')
    setSortBy(field as 'title' | 'created_at' | 'updated_at' | 'order_index')
    setSortOrder(order as 'asc' | 'desc')
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setPublishedFilter('all')
    setFeaturedFilter('all')
    setYearFilter('')
  }

  const activeFiltersCount = [
    searchTerm,
    selectedCategory,
    publishedFilter !== 'all',
    featuredFilter !== 'all',
    yearFilter
  ].filter(Boolean).length

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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
            Projects
          </h1>
          <p className="text-dark-grey font-calibre">
            Manage your project portfolio
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <CBREButton
            variant="outline"
            onClick={() => setIsDragMode(!isDragMode)}
            className={isDragMode ? 'bg-cbre-green text-white' : ''}
          >
            <GripVertical className="h-4 w-4 mr-2" />
            {isDragMode ? 'Exit Reorder' : 'Reorder'}
          </CBREButton>
          <Link href="/admin/projects/new">
            <CBREButton className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </CBREButton>
          </Link>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <CBRECard className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-calibre text-blue-800">
              {selectedProjects.size} project{selectedProjects.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <CBREButton size="sm" variant="outline" onClick={handleBulkPublish}>
                Publish Selected
              </CBREButton>
              <CBREButton size="sm" variant="outline" onClick={handleBulkUnpublish}>
                Unpublish Selected
              </CBREButton>
              <CBREButton
                size="sm"
                variant="outline"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-800"
              >
                Delete Selected
              </CBREButton>
              <CBREButton
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedProjects(new Set())
                  setShowBulkActions(false)
                }}
              >
                Cancel
              </CBREButton>
            </div>
          </div>
        </CBRECard>
      )}

      {/* Search and Filters */}
      <CBRECard className="p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="lg:w-48">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent"
              >
                <option value="order_index-asc">Order (A-Z)</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="updated_at-desc">Recently Updated</option>
              </select>
            </div>

            {/* Advanced Filters Toggle */}
            <CBREButton
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="lg:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-cbre-green text-white rounded-full px-2 py-1 text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </CBREButton>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Published Status
                </label>
                <select
                  value={publishedFilter}
                  onChange={(e) => setPublishedFilter(e.target.value as 'all' | 'published' | 'draft')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Status
                </label>
                <select
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value as 'all' | 'featured' | 'not-featured')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="featured">Featured</option>
                  <option value="not-featured">Not Featured</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  placeholder="e.g., 2024"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent"
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <CBREButton variant="outline" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </CBREButton>
              </div>
            </div>
          )}
        </div>
      </CBRECard>

      {/* Projects List */}
      <div className="mb-6">
        {projects.length === 0 ? (
          <CBRECard className="p-8 text-center">
            <p className="text-dark-grey font-calibre">No projects found.</p>
          </CBRECard>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="projects" isDropDisabled={!isDragMode}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {(isDragMode ? draggedProjects : projects).map((project, index) => (
                    <Draggable
                      key={project.id}
                      draggableId={project.id}
                      index={index}
                      isDragDisabled={!isDragMode}
                    >
                                             {(provided, snapshot) => (
                         <div
                           ref={provided.innerRef}
                           {...provided.draggableProps}
                           className={`p-6 bg-white border border-light-grey shadow-sm rounded-none ${
                             snapshot.isDragging ? 'shadow-lg' : ''
                           }`}
                         >
                          <div className="flex items-center space-x-4">
                            {/* Drag Handle */}
                            {isDragMode && (
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-move text-gray-400 hover:text-gray-600"
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>
                            )}

                                                         {/* Checkbox */}
                             {!isDragMode && (
                               <Checkbox
                                 checked={selectedProjects.has(project.id)}
                                 onCheckedChange={() => handleSelectProject(project.id)}
                               />
                             )}

                            {/* Project Info */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-financier text-lg text-cbre-green">
                                  {project.title}
                                </h3>
                                <CBREBadge className={getStatusColor(project.is_published)}>
                                  {project.is_published ? 'Published' : 'Draft'}
                                </CBREBadge>
                                <CBREBadge variant="outline">
                                  {project.category?.name || 'No Category'}
                                </CBREBadge>
                                {project.featured && (
                                  <CBREBadge className="bg-yellow-100 text-yellow-800">
                                    Featured
                                  </CBREBadge>
                                )}
                              </div>
                              <p className="text-dark-grey font-calibre text-sm mb-2">
                                {project.subtitle}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Order: {project.order_index}</span>
                                <span>•</span>
                                <span>
                                  Updated: {new Date(project.updated_at).toLocaleDateString()}
                                </span>
                                {project.year && (
                                  <>
                                    <span>•</span>
                                    <span>Year: {project.year}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            {!isDragMode && (
                              <div className="flex items-center space-x-2">
                                <Link href={`/wolf-studio/our-work/${project.slug}`} target="_blank">
                                  <CBREButton variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </CBREButton>
                                </Link>
                                <Link href={`/admin/projects/${project.id}`}>
                                  <CBREButton variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </CBREButton>
                                </Link>
                                <CBREButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDuplicate(project.id)}
                                >
                                  <Copy className="h-4 w-4" />
                                </CBREButton>
                                <CBREButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTogglePublished(project.id, project.is_published)}
                                >
                                  {project.is_published ? 'Unpublish' : 'Publish'}
                                </CBREButton>
                                <CBREButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(project.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </CBREButton>
                              </div>
                                                         )}
                           </div>
                         </div>
                       )}
                     </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Select All / Bulk Actions */}
      {!isDragMode && projects.length > 0 && (
        <CBRECard className="p-4 mb-6">
          <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-4">
               <Checkbox
                 checked={selectedProjects.size === projects.length}
                 onCheckedChange={handleSelectAll}
               />
               <span className="text-sm font-calibre text-gray-700">
                 Select All ({projects.length} projects)
               </span>
             </div>
            {selectedProjects.size > 0 && (
              <span className="text-sm font-calibre text-blue-600">
                {selectedProjects.size} selected
              </span>
            )}
          </div>
        </CBRECard>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-dark-grey font-calibre">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex space-x-2">
            <CBREButton
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </CBREButton>
            <CBREButton
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </CBREButton>
          </div>
        </div>
      )}
    </div>
  )
} 