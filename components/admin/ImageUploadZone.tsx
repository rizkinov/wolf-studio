'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadedFile {
  file: File
  preview: string
  id: string
  status: 'uploading' | 'success' | 'error'
  progress?: number
  error?: string
}

interface ImageUploadZoneProps {
  /** Maximum file size in bytes (default: 5MB) */
  maxSize?: number
  /** Maximum number of files (default: 10) */
  maxFiles?: number
  /** Accepted file types */
  accept?: Record<string, string[]>
  /** Callback when files are uploaded successfully */
  onUpload?: (files: UploadedFile[]) => void
  /** Callback when upload starts */
  onUploadStart?: (files: File[]) => void
  /** Callback for upload progress */
  onProgress?: (fileId: string, progress: number) => void
  /** Whether to allow multiple files */
  multiple?: boolean
  /** Custom upload function */
  uploadFn?: (file: File, onProgress: (progress: number) => void) => Promise<{ url: string; path: string }>
  /** Custom class name */
  className?: string
  /** Whether the component is disabled */
  disabled?: boolean
}

export default function ImageUploadZone({
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 10,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.webp']
  },
  onUpload,
  onUploadStart,
  onProgress,
  multiple = true,
  uploadFn,
  className,
  disabled = false
}: ImageUploadZoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragActive, setIsDragActive] = useState(false)

  const handleUpload = useCallback(async (files: File[]) => {
    if (!uploadFn) {
      console.warn('No upload function provided to ImageUploadZone')
      return
    }

    onUploadStart?.(files)

    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading' as const,
      progress: 0
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Upload files concurrently
    const uploadPromises = newFiles.map(async (uploadedFile) => {
      try {
        const result = await uploadFn(uploadedFile.file, (progress) => {
          onProgress?.(uploadedFile.id, progress)
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === uploadedFile.id 
                ? { ...f, progress } 
                : f
            )
          )
        })

        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'success' as const, progress: 100 } 
              : f
          )
        )

        return { ...uploadedFile, status: 'success' as const, ...result }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'error' as const, error: errorMessage } 
              : f
          )
        )

        return { ...uploadedFile, status: 'error' as const, error: errorMessage }
      }
    })

    const results = await Promise.all(uploadPromises)
    onUpload?.(results)
  }, [uploadFn, onUpload, onUploadStart, onProgress])

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => 
        `${file.name}: ${errors.map((e: any) => e.message).join(', ')}`
      )
      console.error('File upload errors:', errors)
      // You might want to show these errors to the user
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles)
    }
  }, [handleUpload])

  const { getRootProps, getInputProps, isDragActive: dropzoneIsDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: multiple ? maxFiles : 1,
    multiple,
    disabled,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false)
  })

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId)
      // Clean up preview URLs
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return updated
    })
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragActive || dropzoneIsDragActive
            ? 'border-primary bg-primary/10' 
            : 'border-muted-foreground/25',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center',
            isDragActive || dropzoneIsDragActive 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          )}>
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-medium">
              {isDragActive || dropzoneIsDragActive
                ? 'Drop files here'
                : 'Drag & drop images here, or click to select'
              }
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Supports JPG, PNG, WebP up to {formatFileSize(maxSize)}
              {multiple && ` (max ${maxFiles} files)`}
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
              >
                {/* Preview */}
                <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.file.size)}
                  </p>
                  
                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-primary h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress || 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {file.progress || 0}% uploaded
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {file.status === 'error' && file.error && (
                    <p className="text-xs text-destructive mt-1">{file.error}</p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {file.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  )}
                  {file.status === 'success' && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0 p-1 hover:bg-muted rounded"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 