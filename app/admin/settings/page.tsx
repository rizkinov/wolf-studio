'use client'

import { useState, useEffect } from 'react'
import { CBRECard } from '@/components/cbre-card'
import { CBREButton } from '@/components/cbre-button'
import { CBREBadge } from '@/components/cbre-badge'
import { Settings, User, Database, Image, Save, RefreshCw } from 'lucide-react'
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
  const [currentDate, setCurrentDate] = useState<string>('')
  const [lastCheck, setLastCheck] = useState<string>('')

  // Load user stats and system status
  useEffect(() => {
    const now = new Date()
    setCurrentDate(now.toLocaleDateString())
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

  const handleSaveSettings = async () => {
    // TODO: Implement settings save functionality
    console.log('Saving settings...')
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-financier text-[var(--cbre-green)] mb-2">
          System Settings
        </h1>
        <p className="text-dark-grey font-calibre">
          Manage your Wolf Studio admin dashboard configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <CBRECard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-5 w-5 text-[var(--cbre-green)]" />
            <h3 className="font-financier text-lg text-[var(--cbre-green)]">
              Account Information
            </h3>
          </div>
          <div className="space-y-4">
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
        <CBRECard className="p-6">
          <div className="flex items-center justify-between mb-4">
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
          <div className="space-y-4">
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

        {/* Storage Usage - Full Width (without redundant image counts) */}
        <div className="lg:col-span-2">
          <StorageMonitor showActions={true} />
        </div>

        {/* Image Management */}
        <CBRECard className="p-6 lg:col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <Image className="h-5 w-5 text-[var(--cbre-green)]" />
            <h3 className="font-financier text-lg text-[var(--cbre-green)]">
              Image Management
            </h3>
          </div>
          <div className="space-y-4">
            <p className="text-dark-grey text-sm">
              Browse, search, and reuse images across your projects. The image library provides 
              a centralized view of all uploaded images with advanced filtering and search capabilities.
            </p>
            
            <div className="flex space-x-3">
              <CBREButton
                onClick={() => setShowImageLibrary(true)}
                className="flex items-center space-x-2"
              >
                <Image className="h-4 w-4" />
                <span>Browse Image Library</span>
              </CBREButton>
              
              <CBREButton
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Database className="h-4 w-4" />
                <span>Manage Storage</span>
              </CBREButton>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Image Management Features</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Browse images in grid or list view</li>
                <li>• Search by filename or project name</li>
                <li>• Filter by image type (banner/gallery)</li>
                <li>• Copy URLs for quick reuse across projects</li>
                <li>• View image dimensions and file sizes</li>
                <li>• Storage optimization and cleanup tools</li>
              </ul>
            </div>
          </div>
        </CBRECard>

        {/* Application Settings */}
        <CBRECard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="h-5 w-5 text-[var(--cbre-green)]" />
            <h3 className="font-financier text-lg text-[var(--cbre-green)]">
              Application Settings
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-grey mb-2">
                Items per page
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--cbre-green)] focus:border-transparent"
                defaultValue="50"
              >
                <option value="10">10 items</option>
                <option value="25">25 items</option>
                <option value="50">50 items</option>
                <option value="100">100 items</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-grey mb-2">
                Default image quality
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--cbre-green)] focus:border-transparent"
                defaultValue="85"
              >
                <option value="100">High Quality (100%)</option>
                <option value="85">Standard Quality (85%)</option>
                <option value="70">Compressed (70%)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-dark-grey">Auto-optimize uploads</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-dark-grey">Generate WebP versions</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
          </div>
        </CBRECard>

        {/* Security Settings */}
        <CBRECard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="h-5 w-5 text-[var(--cbre-green)]" />
            <h3 className="font-financier text-lg text-[var(--cbre-green)]">
              Security Settings
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-grey mb-2">
                Session timeout
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--cbre-green)] focus:border-transparent"
                defaultValue="3600"
              >
                <option value="1800">30 minutes</option>
                <option value="3600">1 hour</option>
                <option value="7200">2 hours</option>
                <option value="14400">4 hours</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-dark-grey">Require re-authentication for deletions</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-dark-grey">Log admin actions</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-grey mb-2">
                Failed login attempts before lockout
              </label>
              <input 
                type="number" 
                defaultValue="5"
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--cbre-green)] focus:border-transparent"
              />
            </div>
          </div>
        </CBRECard>

        {/* Save Settings */}
        <div className="lg:col-span-2">
          <CBREButton 
            onClick={handleSaveSettings}
            className="w-full flex items-center justify-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </CBREButton>
        </div>
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
  )
} 