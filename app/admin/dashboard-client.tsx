'use client'

import { CBRECard } from '@/components/cbre-card'
import { CBREButton } from '@/components/cbre-button'
import { FolderOpen, Settings, BarChart3, Plus, Edit, Eye } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboardClient() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Projects Overview */}
        <CBRECard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <FolderOpen className="h-8 w-8 text-cbre-green" />
            <span className="text-2xl font-financier text-dark-grey">12</span>
          </div>
          <h3 className="text-lg font-calibre text-dark-grey mb-2">Projects</h3>
          <p className="text-sm text-medium-grey font-calibre">
            Total projects in the system
          </p>
          <div className="mt-4 pt-4 border-t border-light-grey">
            <Link href="/admin/projects">
              <CBREButton variant="outline" size="sm" className="w-full">
                <FolderOpen className="h-4 w-4 mr-2" />
                Manage Projects
              </CBREButton>
            </Link>
          </div>
        </CBRECard>

        {/* Analytics Overview */}
        <CBRECard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="h-8 w-8 text-cbre-green" />
            <span className="text-2xl font-financier text-dark-grey">1,234</span>
          </div>
          <h3 className="text-lg font-calibre text-dark-grey mb-2">Page Views</h3>
          <p className="text-sm text-medium-grey font-calibre">
            Total views this month
          </p>
          <div className="mt-4 pt-4 border-t border-light-grey">
            <Link href="/admin/analytics">
              <CBREButton variant="outline" size="sm" className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </CBREButton>
            </Link>
          </div>
        </CBRECard>

        {/* Settings Overview */}
        <CBRECard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Settings className="h-8 w-8 text-cbre-green" />
            <span className="text-2xl font-financier text-dark-grey">3</span>
          </div>
          <h3 className="text-lg font-calibre text-dark-grey mb-2">Categories</h3>
          <p className="text-sm text-medium-grey font-calibre">
            Project categories available
          </p>
          <div className="mt-4 pt-4 border-t border-light-grey">
            <Link href="/admin/settings">
              <CBREButton variant="outline" size="sm" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Manage Settings
              </CBREButton>
            </Link>
          </div>
        </CBRECard>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-xl font-financier text-cbre-green mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/projects/new">
            <CBREButton className="w-full flex items-center justify-center">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </CBREButton>
          </Link>
          <Link href="/admin/projects">
            <CBREButton variant="outline" className="w-full flex items-center justify-center">
              <Edit className="h-4 w-4 mr-2" />
              Edit Projects
            </CBREButton>
          </Link>
          <Link href="/admin/analytics">
            <CBREButton variant="outline" className="w-full flex items-center justify-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </CBREButton>
          </Link>
          <Link href="/wolf-studio">
            <CBREButton variant="outline" className="w-full flex items-center justify-center">
              <Eye className="h-4 w-4 mr-2" />
              View Site
            </CBREButton>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <CBRECard className="p-6">
        <h3 className="text-xl font-financier text-cbre-green mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-light-grey">
            <div>
              <p className="font-calibre text-dark-grey">New project created</p>
              <p className="text-sm text-medium-grey">CBRE Office Design</p>
            </div>
            <span className="text-sm text-medium-grey">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-light-grey">
            <div>
              <p className="font-calibre text-dark-grey">Project updated</p>
              <p className="text-sm text-medium-grey">Heineken Corporate Office</p>
            </div>
            <span className="text-sm text-medium-grey">1 day ago</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-calibre text-dark-grey">Category added</p>
              <p className="text-sm text-medium-grey">Technology Headquarters</p>
            </div>
            <span className="text-sm text-medium-grey">3 days ago</span>
          </div>
        </div>
      </CBRECard>
    </div>
  )
} 