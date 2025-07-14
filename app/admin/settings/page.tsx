'use client'

import { useState } from 'react'
import { CBRECard } from '@/components/cbre-card'
import { CBREButton } from '@/components/cbre-button'
import { CBREBadge } from '@/components/cbre-badge'
import { Settings, Save, User, Globe, Shield, Database, Palette } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Wolf Studio',
    siteDescription: 'Award-winning interior design and architecture firm',
    contactEmail: 'info@wolfstudio.com',
    defaultProjectsPerPage: 10,
    enableAnalytics: true,
    enableNotifications: true,
    maintenanceMode: false,
    autoBackup: true
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    // Show success message (you could use a toast library here)
    alert('Settings saved successfully!')
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-financier text-cbre-green mb-2">
          Settings
        </h1>
        <p className="text-dark-grey font-calibre">
          Configure your Wolf Studio admin panel and website settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Site Information */}
            <CBRECard className="p-6">
              <h3 className="font-financier text-lg text-cbre-green mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Site Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent"
                  />
                </div>
              </div>
            </CBRECard>

            {/* Display Settings */}
            <CBRECard className="p-6">
              <h3 className="font-financier text-lg text-cbre-green mb-4 flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Display Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-2">
                    Projects Per Page
                  </label>
                  <select
                    value={settings.defaultProjectsPerPage}
                    onChange={(e) => handleInputChange('defaultProjectsPerPage', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbre-green focus:border-transparent"
                  >
                    <option value={5}>5 projects</option>
                    <option value={10}>10 projects</option>
                    <option value={15}>15 projects</option>
                    <option value={20}>20 projects</option>
                  </select>
                </div>
              </div>
            </CBRECard>

            {/* System Settings */}
            <CBRECard className="p-6">
              <h3 className="font-financier text-lg text-cbre-green mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                System Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-calibre text-dark-grey">Enable Analytics</p>
                    <p className="text-sm text-gray-500">Collect visitor statistics and performance metrics</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableAnalytics}
                    onChange={(e) => handleInputChange('enableAnalytics', e.target.checked)}
                    className="rounded border-gray-300 text-cbre-green focus:ring-cbre-green"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-calibre text-dark-grey">Notifications</p>
                    <p className="text-sm text-gray-500">Receive email notifications for important events</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableNotifications}
                    onChange={(e) => handleInputChange('enableNotifications', e.target.checked)}
                    className="rounded border-gray-300 text-cbre-green focus:ring-cbre-green"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-calibre text-dark-grey">Auto Backup</p>
                    <p className="text-sm text-gray-500">Automatically backup database daily</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoBackup}
                    onChange={(e) => handleInputChange('autoBackup', e.target.checked)}
                    className="rounded border-gray-300 text-cbre-green focus:ring-cbre-green"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-calibre text-dark-grey">Maintenance Mode</p>
                    <p className="text-sm text-gray-500">Temporarily disable public site access</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                    className="rounded border-gray-300 text-cbre-green focus:ring-cbre-green"
                  />
                </div>
              </div>
            </CBRECard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <CBRECard className="p-6">
              <h3 className="font-financier text-lg text-cbre-green mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <CBREButton
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Settings'}</span>
                </CBREButton>

                <CBREButton
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all settings to default?')) {
                      // Reset to defaults
                      setSettings({
                        siteName: 'Wolf Studio',
                        siteDescription: 'Award-winning interior design and architecture firm',
                        contactEmail: 'info@wolfstudio.com',
                        defaultProjectsPerPage: 10,
                        enableAnalytics: true,
                        enableNotifications: true,
                        maintenanceMode: false,
                        autoBackup: true
                      })
                    }
                  }}
                >
                  <Settings className="h-4 w-4" />
                  <span>Reset to Defaults</span>
                </CBREButton>
              </div>
            </CBRECard>

            {/* System Status */}
            <CBRECard className="p-6">
              <h3 className="font-financier text-lg text-cbre-green mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-dark-grey font-calibre text-sm">Database</span>
                  <CBREBadge className="bg-green-100 text-green-800">Healthy</CBREBadge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-grey font-calibre text-sm">Storage</span>
                  <CBREBadge className="bg-green-100 text-green-800">Available</CBREBadge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-grey font-calibre text-sm">Backup</span>
                  <CBREBadge className="bg-green-100 text-green-800">Up to date</CBREBadge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-grey font-calibre text-sm">Security</span>
                  <CBREBadge className="bg-green-100 text-green-800">Secure</CBREBadge>
                </div>
              </div>
            </CBRECard>

            {/* Account Info */}
            <CBRECard className="p-6">
              <h3 className="font-financier text-lg text-cbre-green mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Account Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Admin User</p>
                  <p className="font-calibre text-dark-grey">rizki.novianto@cbre.com</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="font-calibre text-dark-grey">Today, 2:30 PM</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <CBREBadge className="bg-cbre-green text-white">Administrator</CBREBadge>
                </div>
              </div>
            </CBRECard>
          </div>
        </div>
      </form>

      {/* Coming Soon Features */}
      <CBRECard className="p-8 text-center mt-8 border-dashed border-2 border-gray-300">
        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="font-financier text-lg text-dark-grey mb-2">
          More Settings Coming Soon
        </h3>
        <p className="text-gray-500 font-calibre">
          User management, API settings, theme customization, and advanced security options will be available in future updates.
        </p>
      </CBRECard>
    </div>
  )
} 