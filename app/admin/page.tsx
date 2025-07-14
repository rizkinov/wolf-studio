'use client'

import { CBRECard } from '@/components/cbre-card'
import { CBREButton } from '@/components/cbre-button'
import { FolderOpen, Settings, BarChart3, Plus, Edit, Eye } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  return (
    <div className="p-8">
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
        <Link href="/admin/projects">
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
        </Link>

        <Link href="/admin/categories">
          <CBRECard className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent-green/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-accent-green" />
              </div>
              <div>
                <h3 className="font-financier text-lg text-cbre-green">
                  Categories
                </h3>
                <p className="text-dark-grey font-calibre text-sm">
                  Organize projects by category
                </p>
              </div>
            </div>
          </CBRECard>
        </Link>

        <Link href="/admin/analytics">
          <CBRECard className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-sage/10 rounded-lg">
                <Settings className="h-6 w-6 text-sage" />
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
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="font-financier text-lg text-cbre-green mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/projects/new">
            <CBREButton className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </CBREButton>
          </Link>
          <Link href="/admin/projects">
            <CBREButton variant="outline" className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit Projects</span>
            </CBREButton>
          </Link>
          <Link href="/wolf-studio" target="_blank">
            <CBREButton variant="outline" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>View Site</span>
            </CBREButton>
          </Link>
        </div>
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
    </div>
  )
} 