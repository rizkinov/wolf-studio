'use client'

import { useState, useEffect } from 'react'
import { CBRECard } from '@/components/cbre-card'
import { CBREButton } from '@/components/cbre-button'
import { CBREBadge } from '@/components/cbre-badge'
import { Settings, User, Database, HardDrive, Image, Save, RefreshCw } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import StorageMonitor from '@/components/admin/StorageMonitor'
import ImageLibrary from '@/components/admin/ImageLibrary'

export default function SettingsPage() {
  const { user } = useAuth()
  const [showImageLibrary, setShowImageLibrary] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [currentDate, setCurrentDate] = useState<string>('')
  const [currentTime, setCurrentTime] = useState<string>('')
  const [lastCheck, setLastCheck] = useState<string>('')

  // Set dates only on client side to avoid hydration mismatch
  useEffect(() => {
    const now = new Date()
    setCurrentDate(now.toLocaleDateString())
    setCurrentTime(now.toLocaleTimeString())
    setLastCheck(now.toLocaleString())
  }, [])

  const handleRefreshSystem = async () => {
    setRefreshing(true)
    // Simulate system refresh
    await new Promise(resolve => setTimeout(resolve, 2000))
    setRefreshing(false)
  }

  const handleImageSelect = (image: any) => {
    console.log('Selected image:', image)
    // Handle image selection
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
              <CBREBadge className="bg-[var(--cbre-green)] text-white">Administrator</CBREBadge>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-grey mb-1">
                Last Login
              </label>
              <div className="text-dark-grey text-sm">
                {currentDate && currentTime ? `${currentDate} at ${currentTime}` : 'Loading...'}
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
              <CBREBadge className="bg-green-100 text-green-800">Connected</CBREBadge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-grey">Storage</span>
              <CBREBadge className="bg-green-100 text-green-800">Available</CBREBadge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-grey">Authentication</span>
              <CBREBadge className="bg-green-100 text-green-800">Active</CBREBadge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-grey">API Status</span>
              <CBREBadge className="bg-green-100 text-green-800">Online</CBREBadge>
            </div>
            <div className="text-xs text-gray-500 mt-4">
              Last system check: {lastCheck || 'Loading...'}
            </div>
          </div>
        </CBRECard>

        {/* Storage Usage - Full Width */}
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-[var(--cbre-green)] mb-1">
                  156
                </div>
                <div className="text-sm text-gray-600">Total Images</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600 mb-1">
                  42
                </div>
                <div className="text-sm text-gray-600">Banner Images</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600 mb-1">
                  114
                </div>
                <div className="text-sm text-gray-600">Gallery Images</div>
              </div>
            </div>
            
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

        {/* Advanced Settings */}
        <CBRECard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="h-5 w-5 text-[var(--cbre-green)]" />
            <h3 className="font-financier text-lg text-[var(--cbre-green)]">
              Advanced Settings
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
                defaultValue="medium"
              >
                <option value="high">High (100%)</option>
                <option value="medium">Medium (85%)</option>
                <option value="low">Low (70%)</option>
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
                defaultValue="60"
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="240">4 hours</option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--cbre-green)] focus:border-transparent"
              />
            </div>
          </div>
        </CBRECard>

        {/* Save Settings */}
        <div className="lg:col-span-2">
          <CBREButton className="w-full flex items-center justify-center space-x-2">
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