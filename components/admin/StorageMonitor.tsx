'use client'

import React, { useState, useEffect } from 'react'
import { HardDrive, Trash2, Download, RefreshCw, AlertTriangle } from 'lucide-react'
import { CBRECard } from '@/components/cbre-card'
import { CBREButton } from '@/components/cbre-button'
import { CBREBadge } from '@/components/cbre-badge'
import { cn } from '@/lib/utils'

interface StorageStats {
  totalSize: number
  usedSize: number
  availableSize: number
  imageCount: number
  bannerImages: number
  galleryImages: number
  largestFiles: {
    name: string
    size: number
    url: string
    uploadedAt: string
  }[]
  recentUploads: {
    name: string
    size: number
    url: string
    uploadedAt: string
  }[]
}

interface StorageMonitorProps {
  /** Custom className */
  className?: string
  /** Whether to show management actions */
  showActions?: boolean
}

const StorageMonitor: React.FC<StorageMonitorProps> = ({
  className,
  showActions = true
}) => {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadStorageStats()
  }, [])

  const loadStorageStats = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      // Mock data - replace with actual Supabase Storage API calls
      const mockStats: StorageStats = {
        totalSize: 10 * 1024 * 1024 * 1024, // 10GB
        usedSize: 2.8 * 1024 * 1024 * 1024, // 2.8GB
        availableSize: 7.2 * 1024 * 1024 * 1024, // 7.2GB
        imageCount: 156,
        bannerImages: 42,
        galleryImages: 114,
        largestFiles: [
          {
            name: 'cbre-banner-hd.jpg',
            size: 8.5 * 1024 * 1024, // 8.5MB
            url: '/storage/cbre-banner-hd.jpg',
            uploadedAt: '2024-01-15T10:30:00Z'
          },
          {
            name: 'myp-gallery-original.jpg',
            size: 7.2 * 1024 * 1024, // 7.2MB
            url: '/storage/myp-gallery-original.jpg',
            uploadedAt: '2024-01-12T14:20:00Z'
          },
          {
            name: 'bosch-banner-4k.jpg',
            size: 6.8 * 1024 * 1024, // 6.8MB
            url: '/storage/bosch-banner-4k.jpg',
            uploadedAt: '2024-01-10T09:15:00Z'
          }
        ],
        recentUploads: [
          {
            name: 'new-project-banner.jpg',
            size: 3.2 * 1024 * 1024,
            url: '/storage/new-project-banner.jpg',
            uploadedAt: '2024-01-20T16:45:00Z'
          },
          {
            name: 'gallery-image-01.jpg',
            size: 2.1 * 1024 * 1024,
            url: '/storage/gallery-image-01.jpg',
            uploadedAt: '2024-01-20T15:30:00Z'
          }
        ]
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setStats(mockStats)
    } catch (error) {
      console.error('Error loading storage stats:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getUsagePercentage = (): number => {
    if (!stats) return 0
    return (stats.usedSize / stats.totalSize) * 100
  }

  const getUsageColor = (): string => {
    const percentage = getUsagePercentage()
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-[var(--cbre-green)]'
  }

  const handleOptimizeStorage = async () => {
    // Implement storage optimization (compress images, remove duplicates, etc.)
    console.log('Optimizing storage...')
  }

  const handleCleanupOldFiles = async () => {
    // Implement cleanup of old/unused files
    console.log('Cleaning up old files...')
  }

  if (loading && !stats) {
    return (
      <CBRECard className={cn("p-6", className)}>
        <div className="flex items-center space-x-3 mb-4">
          <HardDrive className="h-5 w-5 text-[var(--cbre-green)]" />
          <h3 className="font-financier text-lg text-[var(--cbre-green)]">
            Storage Usage
          </h3>
        </div>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </CBRECard>
    )
  }

  if (!stats) return null

  return (
    <CBRECard className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <HardDrive className="h-5 w-5 text-[var(--cbre-green)]" />
          <h3 className="font-financier text-lg text-[var(--cbre-green)]">
            Storage Usage
          </h3>
        </div>
        <CBREButton
          variant="outline"
          size="sm"
          onClick={() => loadStorageStats(true)}
          disabled={refreshing}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          <span>Refresh</span>
        </CBREButton>
      </div>

      {/* Usage Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {formatFileSize(stats.usedSize)} of {formatFileSize(stats.totalSize)} used
          </span>
          <span className="text-sm text-gray-500">
            {getUsagePercentage().toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={cn("h-3 rounded-full transition-all duration-300", getUsageColor())}
            style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
          ></div>
        </div>
        {getUsagePercentage() >= 90 && (
          <div className="flex items-center space-x-2 mt-2 text-red-600 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Storage is nearly full. Consider cleaning up old files.</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-[var(--cbre-green)]">
            {stats.imageCount}
          </div>
          <div className="text-sm text-gray-600">Total Images</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {stats.bannerImages}
          </div>
          <div className="text-sm text-gray-600">Banner Images</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {stats.galleryImages}
          </div>
          <div className="text-sm text-gray-600">Gallery Images</div>
        </div>
      </div>

      {/* Largest Files */}
      {stats.largestFiles.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Largest Files</h4>
          <div className="space-y-2">
            {stats.largestFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-sm text-gray-900">{file.name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {formatFileSize(file.size)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CBREButton
              variant="outline"
              onClick={handleOptimizeStorage}
              className="flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Optimize Storage</span>
            </CBREButton>
            
            <CBREButton
              variant="outline"
              onClick={handleCleanupOldFiles}
              className="flex items-center justify-center space-x-2 text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
            >
              <Trash2 className="h-4 w-4" />
              <span>Cleanup Old Files</span>
            </CBREButton>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Storage optimization can reduce file sizes by up to 30% without quality loss
          </div>
        </div>
      )}
    </CBRECard>
  )
}

export default StorageMonitor 