'use client'

import { CBRECard } from '@/components/cbre/cbre-card'
import { CBREButton } from '@/components/cbre/cbre-button'
import { FolderOpen, Settings, BarChart3, Plus, Edit, Eye } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ProjectService, AnalyticsService, CategoryService } from '@/lib/services/database'

interface DashboardStats {
  totalProjects: number
  totalPageViews: number
  totalCategories: number
  publishedProjects: number
  loading: boolean
}

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalPageViews: 0,
    totalCategories: 0,
    publishedProjects: 0,
    loading: true
  })

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true }))
        
        // Fetch all dashboard data in parallel
        const [projectsResponse, categoriesResponse, analyticsResponse] = await Promise.all([
          ProjectService.getProjects(),
          CategoryService.getCategories(),
          AnalyticsService.getProjectPerformance()
        ])

        // Count total projects and published projects
        const totalProjects = projectsResponse.data?.length || 0
        const publishedProjects = projectsResponse.data?.filter(p => p.is_published).length || 0
        
        // Count categories
        const totalCategories = categoriesResponse.data?.length || 0

        // Get page views from analytics
        const totalPageViews = analyticsResponse.data?.reduce((sum, project) => sum + project.views, 0) || 0

        setStats({
          totalProjects,
          totalPageViews,
          totalCategories,
          publishedProjects,
          loading: false
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    fetchDashboardStats()
  }, [])
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
            <span className="text-2xl font-financier text-dark-grey">
              {stats.loading ? '...' : stats.totalProjects}
            </span>
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
            <span className="text-2xl font-financier text-dark-grey">
              {stats.loading ? '...' : stats.totalPageViews.toLocaleString()}
            </span>
          </div>
          <h3 className="text-lg font-calibre text-dark-grey mb-2">Page Views</h3>
          <p className="text-sm text-medium-grey font-calibre">
            Total views across all projects
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
            <span className="text-2xl font-financier text-dark-grey">
              {stats.loading ? '...' : stats.totalCategories}
            </span>
          </div>
          <h3 className="text-lg font-calibre text-dark-grey mb-2">Categories</h3>
          <p className="text-sm text-medium-grey font-calibre">
            Project categories available
          </p>
          <div className="mt-4 pt-4 border-t border-light-grey">
            <Link href="/admin/categories">
              <CBREButton variant="outline" size="sm" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Manage Categories
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

      {/* Quick Stats */}
      <CBRECard className="p-6">
        <h3 className="text-xl font-financier text-cbre-green mb-4">
          Quick Stats
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-light-grey">
              <span className="font-calibre text-dark-grey">Total Projects</span>
              <span className="font-financier text-2xl text-cbre-green">
                {stats.loading ? '...' : stats.totalProjects}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-light-grey">
              <span className="font-calibre text-dark-grey">Published Projects</span>
              <span className="font-financier text-2xl text-accent-green">
                {stats.loading ? '...' : stats.publishedProjects}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="font-calibre text-dark-grey">Draft Projects</span>
              <span className="font-financier text-2xl text-sage">
                {stats.loading ? '...' : stats.totalProjects - stats.publishedProjects}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-light-grey">
              <span className="font-calibre text-dark-grey">Total Page Views</span>
              <span className="font-financier text-2xl text-cbre-green">
                {stats.loading ? '...' : stats.totalPageViews.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-light-grey">
              <span className="font-calibre text-dark-grey">Categories</span>
              <span className="font-financier text-2xl text-accent-green">
                {stats.loading ? '...' : stats.totalCategories}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="font-calibre text-dark-grey">Avg Views/Project</span>
              <span className="font-financier text-2xl text-sage">
                {stats.loading ? '...' : stats.totalProjects > 0 ? Math.round(stats.totalPageViews / stats.totalProjects) : 0}
              </span>
            </div>
          </div>
        </div>
      </CBRECard>
    </div>
  )
} 