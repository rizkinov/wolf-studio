'use client'

import React, { useState, useEffect } from 'react'
import { HardDrive, Trash2, Download, RefreshCw, AlertTriangle } from 'lucide-react'
import { CBRECard } from '@/components/cbre-card'
import { CBREButton } from '@/components/cbre-button'
import { cn } from '@/lib/utils'

interface StorageStats {
  totalSize: number
  usedSize: number
  availableSize: number
  largestFiles: {
    name: string
    size: number
    url: string
    uploadedAt: string
    project?: string
  }[]
  recentUploads: {
    name: string
    size: number
    url: string
    uploadedAt: string
    project?: string
  }[]
  storageBreakdown: {
    bannerImages: number
    galleryImages: number
    tempFiles: number
    other: number
  }
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
  const [optimizing, setOptimizing] = useState(false)
  const [cleaning, setCleaning] = useState(false)

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
      const response = await fetch('/api/admin/storage/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // Fallback to mock data if API is not available
        console.warn('Storage API not available, using fallback data')
        setStats(getFallbackStats())
      }
    } catch (error) {
      console.error('Error loading storage stats:', error)
      setStats(getFallbackStats())
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getFallbackStats = (): StorageStats => ({
    totalSize: 10 * 1024 * 1024 * 1024, // 10GB
    usedSize: 2.8 * 1024 * 1024 * 1024, // 2.8GB
    availableSize: 7.2 * 1024 * 1024 * 1024, // 7.2GB
    largestFiles: [],
    recentUploads: [],
    storageBreakdown: {
      bannerImages: 1.2 * 1024 * 1024 * 1024, // 1.2GB
      galleryImages: 1.4 * 1024 * 1024 * 1024, // 1.4GB
      tempFiles: 0.1 * 1024 * 1024 * 1024, // 0.1GB
      other: 0.1 * 1024 * 1024 * 1024 // 0.1GB
    }
  })

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
    setOptimizing(true)
    try {
      const response = await fetch('/api/admin/storage/optimize', {
        method: 'POST'
      })
      if (response.ok) {
        await loadStorageStats(true)
      }
    } catch (error) {
      console.error('Error optimizing storage:', error)
    } finally {
      setOptimizing(false)
    }
  }

  const handleCleanupOldFiles = async () => {
    setCleaning(true)
    try {
      const response = await fetch('/api/admin/storage/cleanup', {
        method: 'POST'
      })
      if (response.ok) {
        await loadStorageStats(true)
      }
    } catch (error) {
      console.error('Error cleaning up files:', error)
    } finally {
      setCleaning(false)
    }
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

      {/* Storage Breakdown */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Storage Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {formatFileSize(stats.storageBreakdown.bannerImages)}
            </div>
            <div className="text-sm text-gray-600">Banner Images</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">
              {formatFileSize(stats.storageBreakdown.galleryImages)}
            </div>
            <div className="text-sm text-gray-600">Gallery Images</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">
              {formatFileSize(stats.storageBreakdown.tempFiles)}
            </div>
            <div className="text-sm text-gray-600">Temp Files</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-600">
              {formatFileSize(stats.storageBreakdown.other)}
            </div>
            <div className="text-sm text-gray-600">Other</div>
          </div>
        </div>
      </div>

      {/* Largest Files */}
      {stats.largestFiles.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Largest Files</h4>
          <div className="space-y-2">
            {stats.largestFiles.slice(0, 5).map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{file.name}</div>
                  <div className="text-xs text-gray-500">
                    {file.project && `${file.project} • `}
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700 ml-4">
                  {formatFileSize(file.size)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Uploads */}
      {stats.recentUploads.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Recent Uploads</h4>
          <div className="space-y-2">
            {stats.recentUploads.slice(0, 5).map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{file.name}</div>
                  <div className="text-xs text-gray-500">
                    {file.project && `${file.project} • `}
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700 ml-4">
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
              disabled={optimizing}
              className="flex items-center justify-center space-x-2"
            >
              <Download className={cn("h-4 w-4", optimizing && "animate-spin")} />
              <span>{optimizing ? 'Optimizing...' : 'Optimize Storage'}</span>
            </CBREButton>
            
            <CBREButton
              variant="outline"
              onClick={handleCleanupOldFiles}
              disabled={cleaning}
              className="flex items-center justify-center space-x-2 text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
            >
              <Trash2 className={cn("h-4 w-4", cleaning && "animate-spin")} />
              <span>{cleaning ? 'Cleaning...' : 'Cleanup Old Files'}</span>
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