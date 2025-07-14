'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  GripVertical, 
  Edit3, 
  Trash2, 
  Star, 
  StarOff, 
  MoreVertical,
  Eye,
  Download,
  Copy,
  AlertTriangle,
  Image as ImageIcon,
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ImageCropper, { CropResult } from './ImageCropper'
import { createClient } from '@/lib/supabase/client'

export interface GalleryImage {
  id: string
  url: string
  alt_text?: string
  caption?: string
  display_order: number
  image_type: 'banner' | 'gallery'
  storage_path?: string
  file_size?: number
  mime_type?: string
}

interface GalleryManagerProps {
  /** Gallery images */
  images?: GalleryImage[]
  /** Project ID to load images for */
  projectId?: string
  /** Callback when images are reordered */
  onReorder?: (images: GalleryImage[]) => void
  /** Callback when an image is updated */
  onImageUpdate?: (imageId: string, updates: Partial<GalleryImage>) => void
  /** Callback when images are deleted */
  onImageDelete?: (imageIds: string[]) => void
  /** Callback when banner image is set */
  onSetBanner?: (imageId: string) => void
  /** Callback when new images are uploaded */
  onImageUpload?: (files: File[]) => void
  /** Callback when gallery is updated */
  onGalleryUpdate?: (images: GalleryImage[]) => void
  /** Whether the component is in edit mode */
  editMode?: boolean
  /** Maximum number of images allowed */
  maxImages?: number
  /** Custom class name */
  className?: string
  /** Whether bulk operations are enabled */
  enableBulkOperations?: boolean
}

interface ImageEditDialogProps {
  image: GalleryImage
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updates: Partial<GalleryImage>) => void
  onCrop?: (imageId: string, cropResult: CropResult) => void
}

function ImageEditDialog({ image, isOpen, onOpenChange, onSave, onCrop }: ImageEditDialogProps) {
  const [altText, setAltText] = useState(image.alt_text || '')
  const [caption, setCaption] = useState(image.caption || '')
  const [showCropper, setShowCropper] = useState(false)

  const handleSave = () => {
    onSave({
      alt_text: altText,
      caption: caption
    })
    onOpenChange(false)
  }

  const handleCropComplete = (result: CropResult) => {
    onCrop?.(image.id, result)
    setShowCropper(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image Preview */}
          <div className="text-center">
            <img
              src={image.url}
              alt={image.alt_text}
              className="max-w-full h-auto max-h-64 mx-auto rounded-lg border"
            />
          </div>

          {/* Image Cropper */}
          {showCropper ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Crop Image</h3>
                <Button variant="outline" onClick={() => setShowCropper(false)}>
                  Cancel Crop
                </Button>
              </div>
              <ImageCropper
                src={image.url}
                onCropComplete={handleCropComplete}
                defaultAspectRatio={image.image_type === 'banner' ? 'banner' : 'gallery'}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alt-text">Alt Text</Label>
                  <Input
                    id="alt-text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe the image for accessibility"
                  />
                </div>
                <div>
                  <Label htmlFor="caption">Caption</Label>
                  <Input
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Image caption (optional)"
                  />
                </div>
              </div>

              {/* Image Details */}
              <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div>
                  <Label>Type</Label>
                  <p className="capitalize">{image.image_type}</p>
                </div>
                <div>
                  <Label>File Size</Label>
                  <p>{image.file_size ? `${(image.file_size / 1024).toFixed(1)} KB` : 'Unknown'}</p>
                </div>
                <div>
                  <Label>Format</Label>
                  <p>{image.mime_type || 'Unknown'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={() => setShowCropper(true)} variant="outline">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Crop Image
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function GalleryManager({
  images,
  projectId,
  onReorder,
  onImageUpdate,
  onImageDelete,
  onSetBanner,
  onImageUpload,
  onGalleryUpdate,
  editMode = true,
  maxImages = 20,
  className,
  enableBulkOperations = true
}: GalleryManagerProps) {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null)
  const [dragDisabled, setDragDisabled] = useState(false)
  
  // Internal state for loading images when projectId is provided
  const [internalImages, setInternalImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load images from database when projectId is provided
  useEffect(() => {
    if (projectId && !images) {
      loadProjectImages()
    }
  }, [projectId, images])

  const loadProjectImages = async () => {
    if (!projectId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_images')
        .select('*')
        .eq('project_id', projectId)
        .order('image_type', { ascending: false }) // banners first
        .order('display_order', { ascending: true })

      if (error) {
        throw error
      }

      const galleryImages: GalleryImage[] = (data || []).map(item => ({
        id: item.id,
        url: item.image_url,
        alt_text: item.alt_text,
        caption: item.caption,
        display_order: item.display_order,
        image_type: item.image_type as 'banner' | 'gallery',
        storage_path: item.storage_path,
        file_size: item.file_size,
        mime_type: item.mime_type
      }))

      setInternalImages(galleryImages)
      
      // Notify parent component of loaded images
      if (onGalleryUpdate) {
        onGalleryUpdate(galleryImages)
      }
    } catch (err) {
      console.error('Error loading project images:', err)
      setError(err instanceof Error ? err.message : 'Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  // Use provided images or internal images - ensure it's always an array
  const actualImages = images || internalImages
  
  // Defensive check: ensure actualImages is always an array
  const safeActualImages = Array.isArray(actualImages) ? actualImages : []

  // Sort images by display_order and type (banners first) - with extra defensive programming
  const sortedImages = Array.isArray(safeActualImages) ? [...safeActualImages].sort((a, b) => {
    if (a.image_type !== b.image_type) {
      return a.image_type === 'banner' ? -1 : 1
    }
    return a.display_order - b.display_order
  }) : []

  const bannerImages = sortedImages.filter(img => img.image_type === 'banner')
  const galleryImages = sortedImages.filter(img => img.image_type === 'gallery')

  // Handle drag end
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination || !onReorder) return

    const { source, destination } = result
    if (source.index === destination.index) return

    const newImages = Array.from(Array.isArray(sortedImages) ? sortedImages : [])
    const [reorderedItem] = newImages.splice(source.index, 1)
    newImages.splice(destination.index, 0, reorderedItem)

    // Update display_order
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      display_order: index
    }))

    onReorder(updatedImages)
  }, [sortedImages, onReorder])

  // Handle bulk selection
  const handleImageSelection = useCallback((imageId: string, selected: boolean) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(imageId)
      } else {
        newSet.delete(imageId)
      }
      return newSet
    })
  }, [])

  // Select all images
  const handleSelectAll = useCallback(() => {
    if (selectedImages.size === safeActualImages.length) {
      setSelectedImages(new Set())
    } else {
      setSelectedImages(new Set(safeActualImages.map(img => img.id)))
    }
  }, [selectedImages.size, safeActualImages])

  // Delete selected images
  const handleBulkDelete = useCallback(() => {
    if (selectedImages.size > 0 && onImageDelete) {
      onImageDelete(Array.from(selectedImages))
      setSelectedImages(new Set())
    }
  }, [selectedImages, onImageDelete])

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0 && onImageUpload) {
      onImageUpload(Array.from(files))
    }
    // Reset input
    event.target.value = ''
  }, [onImageUpload])

  const canAddMore = safeActualImages.length < maxImages

  return (
    <div className={cn('space-y-6', className)}>
      {/* Loading State */}
      {loading && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Loading project images...
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading images: {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadProjectImages}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Gallery Manager
              <span className="text-sm font-normal text-muted-foreground">
                ({safeActualImages.length}/{maxImages} images)
              </span>
            </CardTitle>
            
            <div className="flex gap-2">
              {/* Upload Button */}
              {editMode && canAddMore && (
                <div>
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button asChild variant="outline" size="sm">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Add Images
                    </label>
                  </Button>
                </div>
              )}

              {/* Bulk Actions */}
              {enableBulkOperations && selectedImages.size > 0 && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedImages.size === safeActualImages.length && safeActualImages.length > 0 ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete ({selectedImages.size})
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Capacity Warning */}
          {!canAddMore && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Maximum number of images ({maxImages}) reached. Delete some images to add new ones.
              </AlertDescription>
            </Alert>
          )}

          {/* Bulk Selection Controls */}
          {enableBulkOperations && safeActualImages.length > 0 && (
            <div className="flex items-center gap-4 mb-4 p-2 bg-muted/50 rounded">
              <Checkbox
                checked={selectedImages.size === safeActualImages.length && safeActualImages.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedImages.size > 0 
                  ? `${selectedImages.size} image${selectedImages.size === 1 ? '' : 's'} selected`
                  : 'Select images for bulk operations'
                }
              </span>
            </div>
          )}

          {/* Images Grid */}
          {safeActualImages.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No images uploaded yet</p>
              {editMode && (
                <p className="text-sm text-muted-foreground mt-2">
                  Upload images to get started
                </p>
              )}
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="gallery" direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4",
                      snapshot.isDraggingOver && "bg-muted/50 rounded-lg p-2"
                    )}
                  >
                    {(Array.isArray(sortedImages) ? sortedImages : []).map((image, index) => (
                      <Draggable 
                        key={image.id} 
                        draggableId={image.id} 
                        index={index}
                        isDragDisabled={!editMode || dragDisabled}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "relative group",
                              snapshot.isDragging && "opacity-75"
                            )}
                          >
                            {/* Image Card */}
                            <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                              {/* Drag Handle */}
                              {editMode && (
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute top-2 left-2 z-10 p-1 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <GripVertical className="w-4 h-4 text-white" />
                                </div>
                              )}

                              {/* Selection Checkbox */}
                              {enableBulkOperations && (
                                <div className="absolute top-2 right-2 z-10">
                                  <Checkbox
                                    checked={selectedImages.has(image.id)}
                                    onCheckedChange={(checked) => 
                                      handleImageSelection(image.id, checked as boolean)
                                    }
                                    className="bg-white border-2"
                                  />
                                </div>
                              )}

                              {/* Image */}
                              <img
                                src={image.url}
                                alt={image.alt_text || `Gallery image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />

                              {/* Banner Badge */}
                              {image.image_type === 'banner' && (
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-yellow-500 text-yellow-900 text-xs font-medium rounded">
                                  Banner
                                </div>
                              )}

                              {/* Overlay Controls */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="flex gap-2">
                                  {/* View */}
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => window.open(image.url, '_blank')}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>

                                  {/* Edit */}
                                  {editMode && (
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => setEditingImage(image)}
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </Button>
                                  )}

                                  {/* More Actions */}
                                  {editMode && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="secondary">
                                          <MoreVertical className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        {image.image_type === 'gallery' ? (
                                          <DropdownMenuItem
                                            onClick={() => onSetBanner?.(image.id)}
                                          >
                                            <Star className="w-4 h-4 mr-2" />
                                            Set as Banner
                                          </DropdownMenuItem>
                                        ) : (
                                          <DropdownMenuItem
                                            onClick={() => onImageUpdate?.(image.id, { image_type: 'gallery' })}
                                          >
                                            <StarOff className="w-4 h-4 mr-2" />
                                            Remove from Banner
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                          onClick={() => navigator.clipboard.writeText(image.url)}
                                        >
                                          <Copy className="w-4 h-4 mr-2" />
                                          Copy URL
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Download className="w-4 h-4 mr-2" />
                                          Download
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => onImageDelete?.([image.id])}
                                          className="text-destructive"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Image Info */}
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-muted-foreground truncate">
                                {image.alt_text || `Image ${index + 1}`}
                              </p>
                              {image.caption && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {image.caption}
                                </p>
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
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingImage && (
        <ImageEditDialog
          image={editingImage}
          isOpen={!!editingImage}
          onOpenChange={(open) => !open && setEditingImage(null)}
          onSave={(updates) => {
            onImageUpdate?.(editingImage.id, updates)
            setEditingImage(null)
          }}
          onCrop={(imageId, cropResult) => {
            // Handle crop result - you might want to upload the cropped image
            console.log('Crop completed for image:', imageId, cropResult)
          }}
        />
      )}
    </div>
  )
} 