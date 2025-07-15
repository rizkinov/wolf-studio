'use client'

import { useState, useEffect } from 'react'
import { CBRECard } from '@/components/cbre/cbre-card'
import { CBREButton } from '@/components/cbre/cbre-button'
import { CBREBadge } from '@/components/cbre/cbre-badge'
import { User, Database, Image, RefreshCw } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import StorageMonitor from '@/components/admin/StorageMonitor'
import ImageLibrary from '@/components/admin/ImageLibrary'

interface SystemStatus {
  database: 'connected' | 'disconnected' | 'error'
  storage: 'available' | 'unavailable' | 'error'
  authentication: 'active' | 'inactive' | 'error'
  api: 'online' | 'offline' | 'error'
}

interface UserStats {
  totalImages: number
  bannerImages: number
  galleryImages: number
  lastLogin: string | null
  role: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [showImageLibrary, setShowImageLibrary] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'connected',
    storage: 'available',
    authentication: 'active',
    api: 'online'
  })
  const [userStats, setUserStats] = useState<UserStats>({
    totalImages: 0,
    bannerImages: 0,
    galleryImages: 0,
    lastLogin: null,
    role: 'Administrator'
  })
  const [lastCheck, setLastCheck] = useState<string>('')

  // Load user stats and system status
  useEffect(() => {
    const now = new Date()
    setLastCheck(now.toLocaleString())
    
    loadUserStats()
    checkSystemStatus()
  }, [])

  const loadUserStats = async () => {
    try {
      // Get real image counts from API
      const response = await fetch('/api/admin/images/stats')
      if (response.ok) {
        const stats = await response.json()
        setUserStats(prev => ({
          ...prev,
          totalImages: stats.totalImages || 0,
          bannerImages: stats.bannerImages || 0,
          galleryImages: stats.galleryImages || 0
        }))
      }
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  const checkSystemStatus = async () => {
    try {
      // Check actual system status
      const response = await fetch('/api/admin/system/status')
      if (response.ok) {
        const status = await response.json()
        setSystemStatus(status)
      }
    } catch (error) {
      console.error('Error checking system status:', error)
      setSystemStatus({
        database: 'error',
        storage: 'error',
        authentication: 'error',
        api: 'error'
      })
    }
  }

  const handleRefreshSystem = async () => {
    setRefreshing(true)
    await checkSystemStatus()
    await loadUserStats()
    setRefreshing(false)
  }

  const handleImageSelect = (image: any) => {
    console.log('Selected image:', image)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'available':
      case 'active':
      case 'online':
        return <CBREBadge className="bg-green-100 text-green-800">Online</CBREBadge>
      case 'error':
        return <CBREBadge className="bg-red-100 text-red-800">Error</CBREBadge>
      default:
        return <CBREBadge className="bg-yellow-100 text-yellow-800">Unknown</CBREBadge>
    }
  }

  return (
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-financier text-[var(--cbre-green)] mb-1">
            System Settings
          </h1>
          <p className="text-dark-grey font-calibre">
            Monitor your Wolf Studio admin dashboard status
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Account Information */}
          <CBRECard className="p-5">
            <div className="flex items-center space-x-3 mb-3">
              <User className="h-5 w-5 text-[var(--cbre-green)]" />
              <h3 className="font-financier text-lg text-[var(--cbre-green)]">
                Account Information
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-dark-grey mb-1">
                  Email Address
                </label>
                <div className="text-dark-grey bg-gray-50 px-3 py-2 rounded border">
                  {user?.email || 'Not signed in'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-grey mb-1">
                  Role
                </label>
                <CBREBadge className="bg-[var(--cbre-green)] text-white">{userStats.role}</CBREBadge>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-grey mb-1">
                  Account Created
                </label>
                <div className="text-dark-grey text-sm">
                  {user?.user_metadata?.created_at ? 
                    new Date(user.user_metadata.created_at).toLocaleDateString() : 
                    'Not available'
                  }
                </div>
              </div>
            </div>
          </CBRECard>

          {/* System Status */}
          <CBRECard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-[var(--cbre-green)]" />
                <h3 className="font-financier text-lg text-[var(--cbre-green)]">
                  System Status
                </h3>
              </div>
              <CBREButton
                variant="outline"
                size="sm"
                onClick={handleRefreshSystem}
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </CBREButton>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-dark-grey">Database</span>
                {getStatusBadge(systemStatus.database)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-grey">Storage</span>
                {getStatusBadge(systemStatus.storage)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-grey">Authentication</span>
                {getStatusBadge(systemStatus.authentication)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-grey">API Status</span>
                {getStatusBadge(systemStatus.api)}
              </div>
              <div className="text-xs text-gray-500 mt-4">
                Last system check: {lastCheck || 'Loading...'}
              </div>
            </div>
          </CBRECard>

          {/* Storage Usage - Full Width (monitoring only, no actions) */}
          <div className="lg:col-span-2">
            <StorageMonitor showActions={false} />
          </div>

          {/* Image Management */}
          <CBRECard className="p-5 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-3">
              <Image className="h-5 w-5 text-[var(--cbre-green)]" />
              <h3 className="font-financier text-lg text-[var(--cbre-green)]">
                Image Management
              </h3>
            </div>
            <div className="space-y-3">
              <p className="text-dark-grey text-sm">
                Browse, search, and reuse images across your projects. The image library provides 
                a centralized view of all uploaded images with advanced filtering and search capabilities.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {userStats.totalImages}
                  </div>
                  <div className="text-sm text-gray-600">Total Images</div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {userStats.bannerImages}
                  </div>
                  <div className="text-sm text-gray-600">Banner Images</div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <CBREButton
                  onClick={() => setShowImageLibrary(true)}
                  className="flex items-center space-x-2"
                >
                  <Image className="h-4 w-4" />
                  <span>Browse Image Library</span>
                </CBREButton>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Image Library Features</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Browse images in grid or list view</li>
                  <li>• Search by filename or project name</li>
                  <li>• Filter by image type (banner/gallery)</li>
                  <li>• Copy URLs for quick reuse across projects</li>
                  <li>• View image dimensions and file sizes</li>
                  <li>• Real-time storage usage monitoring</li>
                </ul>
              </div>
            </div>
          </CBRECard>
        </div>

        {/* Image Library Modal */}
        <ImageLibrary
          isOpen={showImageLibrary}
          onClose={() => setShowImageLibrary(false)}
          onSelect={handleImageSelect}
          multiple={false}
          typeFilter="all"
        />
      </div>
    </div>
  )
} 