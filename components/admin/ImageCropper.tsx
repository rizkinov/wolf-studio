'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, { 
  Crop, 
  PixelCrop, 
  centerCrop, 
  makeAspectCrop 
} from 'react-image-crop'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Crop as CropIcon, RotateCcw, Download, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import 'react-image-crop/dist/ReactCrop.css'

export interface AspectRatio {
  name: string
  value: number
  description: string
}

export interface CropResult {
  croppedImageUrl: string
  cropData: PixelCrop
  canvas: HTMLCanvasElement
}

interface ImageCropperProps {
  /** Source image URL or File */
  src: string | File
  /** Callback when crop is completed */
  onCropComplete?: (result: CropResult) => void
  /** Callback when crop changes */
  onCropChange?: (crop: PixelCrop) => void
  /** Available aspect ratios */
  aspectRatios?: AspectRatio[]
  /** Default aspect ratio */
  defaultAspectRatio?: string
  /** Minimum crop dimensions */
  minWidth?: number
  minHeight?: number
  /** Maximum crop dimensions */
  maxWidth?: number
  maxHeight?: number
  /** Custom class name */
  className?: string
  /** Whether to show the crop preview */
  showPreview?: boolean
  /** Custom crop area styles */
  cropAreaStyle?: React.CSSProperties
}

// Default aspect ratios for Wolf Studio projects
const DEFAULT_ASPECT_RATIOS: AspectRatio[] = [
  { name: 'banner', value: 16 / 9, description: 'Banner (16:9)' },
  { name: 'gallery', value: 4 / 3, description: 'Gallery (4:3)' },
  { name: 'square', value: 1, description: 'Square (1:1)' },
  { name: 'portrait', value: 3 / 4, description: 'Portrait (3:4)' },
  { name: 'free', value: 0, description: 'Free form' }
]

export default function ImageCropper({
  src,
  onCropComplete,
  onCropChange,
  aspectRatios = DEFAULT_ASPECT_RATIOS,
  defaultAspectRatio = 'banner',
  minWidth = 400,
  minHeight = 300,
  maxWidth,
  maxHeight,
  className,
  showPreview = true,
  cropAreaStyle
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(defaultAspectRatio)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [imageSrc, setImageSrc] = useState<string>('')
  const [previewCanvasRef, setPreviewCanvasRef] = useState<HTMLCanvasElement | null>(null)
  
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Handle image source (File or URL)
  useEffect(() => {
    if (src instanceof File) {
      const reader = new FileReader()
      reader.onload = () => setImageSrc(reader.result as string)
      reader.onerror = () => setImageError('Failed to read image file')
      reader.readAsDataURL(src)
    } else {
      setImageSrc(src)
    }
  }, [src])

  // Initialize crop when image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget
    
    if (width < minWidth || height < minHeight) {
      setImageError(`Image is too small. Minimum dimensions: ${minWidth}x${minHeight}px`)
      return
    }

    const selectedRatio = aspectRatios.find(r => r.name === selectedAspectRatio)
    const aspectRatio = selectedRatio?.value || 0

    if (aspectRatio > 0) {
      const crop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 80,
          },
          aspectRatio,
          width,
          height,
        ),
        width,
        height
      )
      setCrop(crop)
    } else {
      // Free form crop
      setCrop({
        unit: '%',
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      })
    }

    setImageLoaded(true)
    setImageError(null)
  }, [selectedAspectRatio, aspectRatios, minWidth, minHeight])

  // Handle aspect ratio change
  const handleAspectRatioChange = useCallback((ratioName: string) => {
    setSelectedAspectRatio(ratioName)
    
    if (!imgRef.current) return

    const { naturalWidth: width, naturalHeight: height } = imgRef.current
    const selectedRatio = aspectRatios.find(r => r.name === ratioName)
    const aspectRatio = selectedRatio?.value || 0

    if (aspectRatio > 0) {
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 80,
          },
          aspectRatio,
          width,
          height,
        ),
        width,
        height
      )
      setCrop(newCrop)
    } else {
      // Free form
      setCrop({
        unit: '%',
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      })
    }
  }, [aspectRatios])

  // Reset crop to default
  const resetCrop = useCallback(() => {
    handleAspectRatioChange(selectedAspectRatio)
  }, [selectedAspectRatio, handleAspectRatioChange])

  // Generate cropped image
  const generateCroppedImage = useCallback(async (): Promise<CropResult | null> => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return null
    }

    const canvas = canvasRef.current
    const image = imgRef.current
    const crop = completedCrop

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = crop.width * scaleX
    canvas.height = crop.height * scaleY

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve(null)
        
        const croppedImageUrl = URL.createObjectURL(blob)
        resolve({
          croppedImageUrl,
          cropData: crop,
          canvas: canvas
        })
      }, 'image/jpeg', 0.9)
    })
  }, [completedCrop])

  // Handle crop complete
  const handleCropComplete = useCallback(async () => {
    const result = await generateCroppedImage()
    if (result) {
      onCropComplete?.(result)
    }
  }, [generateCroppedImage, onCropComplete])

  // Download cropped image
  const downloadCroppedImage = useCallback(async () => {
    const result = await generateCroppedImage()
    if (result) {
      const link = document.createElement('a')
      link.download = 'cropped-image.jpg'
      link.href = result.croppedImageUrl
      link.click()
    }
  }, [generateCroppedImage])

  // Update preview canvas
  useEffect(() => {
    if (completedCrop && imgRef.current && showPreview) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const image = imgRef.current
      const crop = completedCrop
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      canvas.width = crop.width * scaleX
      canvas.height = crop.height * scaleY

      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      )

      setPreviewCanvasRef(canvas)
    }
  }, [completedCrop, showPreview])

  if (!imageSrc) {
    return (
      <div className={cn('flex items-center justify-center p-8 border-2 border-dashed rounded-lg', className)}>
        <p className="text-muted-foreground">No image provided</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CropIcon className="w-5 h-5" />
            Image Cropper
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Aspect Ratio Selector */}
          <div className="space-y-2">
            <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
            <Select value={selectedAspectRatio} onValueChange={handleAspectRatioChange}>
              <SelectTrigger id="aspect-ratio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aspectRatios.map((ratio) => (
                  <SelectItem key={ratio.name} value={ratio.name}>
                    {ratio.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={resetCrop} 
              variant="outline" 
              size="sm"
              disabled={!imageLoaded}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button 
              onClick={handleCropComplete} 
              size="sm"
              disabled={!completedCrop || !imageLoaded}
            >
              Apply Crop
            </Button>
            <Button 
              onClick={downloadCroppedImage} 
              variant="outline" 
              size="sm"
              disabled={!completedCrop || !imageLoaded}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {imageError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{imageError}</AlertDescription>
        </Alert>
      )}

      {/* Main Crop Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Editor */}
        <div className="space-y-2">
          <Label>Original Image</Label>
          <div className="border rounded-lg overflow-hidden bg-muted">
            {imageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => {
                  setCompletedCrop(c)
                  onCropChange?.(c)
                }}
                aspect={aspectRatios.find(r => r.name === selectedAspectRatio)?.value}
                minWidth={minWidth}
                minHeight={minHeight}
                maxWidth={maxWidth}
                maxHeight={maxHeight}
                style={cropAreaStyle}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop me"
                  onLoad={onImageLoad}
                  onError={() => setImageError('Failed to load image')}
                  className="max-w-full h-auto"
                />
              </ReactCrop>
            )}
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="border rounded-lg overflow-hidden bg-muted min-h-[200px] flex items-center justify-center">
              {previewCanvasRef ? (
                <canvas
                  ref={(el) => {
                    if (el && previewCanvasRef) {
                      const ctx = el.getContext('2d')
                      if (ctx) {
                        el.width = previewCanvasRef.width
                        el.height = previewCanvasRef.height
                        ctx.drawImage(previewCanvasRef, 0, 0)
                      }
                    }
                  }}
                  className="max-w-full h-auto"
                />
              ) : (
                <p className="text-muted-foreground text-sm">
                  {imageLoaded ? 'Select crop area to see preview' : 'Loading image...'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for crop generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
} 