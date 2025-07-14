'use client'

import { useAuth } from '@/lib/auth/context'
import { CBRECard } from '@/components/cbre-card'
import { CBREButton } from '@/components/cbre-button'
import { useRouter } from 'next/navigation'
import { LogOut, FolderOpen, Settings, BarChart3 } from 'lucide-react'

export default function AdminDashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-lighter-grey">
      {/* Header */}
      <header className="bg-white border-b border-light-grey">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-financier text-cbre-green">
                Wolf Studio Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-dark-grey font-calibre">
                Welcome, {user?.email}
              </span>
              <CBREButton
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </CBREButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-financier text-cbre-green mb-2">
            Dashboard Overview
          </h2>
          <p className="text-dark-grey font-calibre">
            Manage your Wolf Studio projects and content
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <CBRECard className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-cbre-green/10 rounded-lg">
                <FolderOpen className="h-6 w-6 text-cbre-green" />
              </div>
              <div>
                <h3 className="font-financier text-lg text-cbre-green">
                  Manage Projects
                </h3>
                <p className="text-dark-grey font-calibre text-sm">
                  Create, edit, and organize your work portfolio
                </p>
              </div>
            </div>
          </CBRECard>

          <CBRECard className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent-green/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-accent-green" />
              </div>
              <div>
                <h3 className="font-financier text-lg text-cbre-green">
                  Analytics
                </h3>
                <p className="text-dark-grey font-calibre text-sm">
                  View project performance and statistics
                </p>
              </div>
            </div>
          </CBRECard>

          <CBRECard className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-sage/10 rounded-lg">
                <Settings className="h-6 w-6 text-sage" />
              </div>
              <div>
                <h3 className="font-financier text-lg text-cbre-green">
                  Settings
                </h3>
                <p className="text-dark-grey font-calibre text-sm">
                  Configure site settings and preferences
                </p>
              </div>
            </div>
          </CBRECard>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CBRECard className="p-6">
            <h3 className="font-financier text-lg text-cbre-green mb-4">
              Recent Projects
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-lighter-grey/50 rounded">
                <span className="font-calibre text-dark-grey">Swiss Bank</span>
                <span className="text-sm text-dark-grey">Updated 2 days ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-lighter-grey/50 rounded">
                <span className="font-calibre text-dark-grey">Heineken</span>
                <span className="text-sm text-dark-grey">Updated 1 week ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-lighter-grey/50 rounded">
                <span className="font-calibre text-dark-grey">CBRE</span>
                <span className="text-sm text-dark-grey">Updated 2 weeks ago</span>
              </div>
            </div>
          </CBRECard>

          <CBRECard className="p-6">
            <h3 className="font-financier text-lg text-cbre-green mb-4">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-calibre text-dark-grey">Total Projects</span>
                <span className="font-financier text-2xl text-cbre-green">28</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-calibre text-dark-grey">Published</span>
                <span className="font-financier text-2xl text-accent-green">28</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-calibre text-dark-grey">Categories</span>
                <span className="font-financier text-2xl text-sage">8</span>
              </div>
            </div>
          </CBRECard>
        </div>
      </main>
    </div>
  )
} 