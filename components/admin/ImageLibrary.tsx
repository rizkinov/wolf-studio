'use client'

import React, { useState, useEffect } from 'react'
import { Search, X, Copy, Grid, List } from 'lucide-react'
import { CBREButton } from '@/components/cbre-button'
import { CBREBadge } from '@/components/cbre-badge'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface ImageAsset {
  id: string
  url: string
  name: string
  size: number
  dimensions?: {
    width: number
    height: number
  }
  uploadedAt: string
  projectId?: string
  projectName?: string
  type: 'banner' | 'gallery'
  mimeType: string
}

interface ImageLibraryProps {
  /** Whether the library is open */
  isOpen: boolean
  /** Function to close the library */
  onClose: () => void
  /** Function called when an image is selected */
  onSelect?: (image: ImageAsset) => void
  /** Whether to allow multiple selection */
  multiple?: boolean
  /** Filter by image type */
  typeFilter?: 'banner' | 'gallery' | 'all'
  /** Custom className */
  className?: string
}

const ImageLibrary: React.FC<ImageLibraryProps> = ({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  typeFilter = 'all',
  className
}) => {
  const [images, setImages] = useState<ImageAsset[]>([])
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'banner' | 'gallery'>(typeFilter)

  // Load images from database
  useEffect(() => {
    if (isOpen) {
      loadImages()
    }
  }, [isOpen, filter])

  const loadImages = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // Query all project images with project details
      let query = supabase
        .from('project_images')
        .select(`
          id,
          image_url,
          alt_text,
          file_size,
          mime_type,
          image_type,
          created_at,
          project:projects(
            id,
            title,
            slug
          )
        `)
        .order('created_at', { ascending: false })

      // Apply type filter
      if (filter !== 'all') {
        query = query.eq('image_type', filter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading images:', error)
        setImages([])
        return
      }

      // Transform database results to ImageAsset format
      const transformedImages: ImageAsset[] = (data || []).map((item: any) => ({
        id: item.id,
        url: item.image_url,
        name: item.image_url.split('/').pop() || 'Unknown',
        size: item.file_size || 0,
        dimensions: undefined, // No width/height in database yet
        uploadedAt: item.created_at,
        projectId: item.project?.id,
        projectName: item.project?.title || 'Unknown Project',
        type: item.image_type as 'banner' | 'gallery',
        mimeType: item.mime_type || 'image/jpeg'
      }))

      setImages(transformedImages)
    } catch (error) {
      console.error('Error loading images:', error)
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  const filteredImages = images.filter(image =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleImageClick = (image: ImageAsset) => {
    if (multiple) {
      const newSelected = new Set(selectedImages)
      if (newSelected.has(image.id)) {
        newSelected.delete(image.id)
      } else {
        newSelected.add(image.id)
      }
      setSelectedImages(newSelected)
    } else {
      onSelect?.(image)
      onClose()
    }
  }

  const handleSelectMultiple = () => {
    const selectedImageObjects = images.filter(img => selectedImages.has(img.id))
    selectedImageObjects.forEach(img => onSelect?.(img))
    onClose()
  }

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    // You might want to show a toast notification here
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={cn(
        "bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 h-[80vh] flex flex-col",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-financier text-[var(--cbre-green)]">
              Image Library
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Browse and select images from your project library
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--cbre-green)] focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--cbre-green)] focus:border-transparent"
            >
              <option value="all">All Images</option>
              <option value="banner">Banner Images</option>
              <option value="gallery">Gallery Images</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'px-3 py-2 text-sm transition-colors',
                  viewMode === 'grid'
                    ? 'bg-[var(--cbre-green)] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-3 py-2 text-sm transition-colors',
                  viewMode === 'list'
                    ? 'bg-[var(--cbre-green)] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Image Grid/List */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading images...</div>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-lg font-medium">No images found</div>
              <div className="text-sm">Try adjusting your search or filter criteria</div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    "bg-white border-2 rounded-lg overflow-hidden cursor-pointer transition-all",
                    selectedImages.has(image.id)
                      ? "border-[var(--cbre-green)] shadow-lg"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                  )}
                  onClick={() => handleImageClick(image)}
                >
                  <div className="aspect-[4/3] bg-gray-100 relative">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <CBREBadge className={image.type === 'banner' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                        {image.type}
                      </CBREBadge>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {image.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {image.projectName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {image.dimensions ? `${image.dimensions.width}×${image.dimensions.height} • ` : ''}{formatFileSize(image.size)}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyImageUrl(image.url)
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy URL"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    "flex items-center space-x-4 p-3 border rounded-lg cursor-pointer transition-all",
                    selectedImages.has(image.id)
                      ? "border-[var(--cbre-green)] bg-green-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  onClick={() => handleImageClick(image)}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {image.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {image.projectName}{image.dimensions ? ` • ${image.dimensions.width}×${image.dimensions.height}` : ''}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatFileSize(image.size)} • {new Date(image.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CBREBadge className={image.type === 'banner' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                      {image.type}
                    </CBREBadge>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyImageUrl(image.url)
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy URL"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''} found
            {multiple && selectedImages.size > 0 && ` • ${selectedImages.size} selected`}
          </div>
          <div className="flex items-center space-x-3">
            <CBREButton
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </CBREButton>
            {multiple && selectedImages.size > 0 && (
              <CBREButton
                type="button"
                onClick={handleSelectMultiple}
              >
                Select {selectedImages.size} Image{selectedImages.size !== 1 ? 's' : ''}
              </CBREButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageLibrary 