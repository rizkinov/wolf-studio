'use client'

import { useState, useEffect } from 'react'
import { CBRECard } from '@/components/cbre-card'
import { CBREButton } from '@/components/cbre-button'
import { CBREBadge } from '@/components/cbre-badge'
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Calendar, 
  Download,
  PieChart,
  RefreshCw,
  Star,
  FileText,
  Activity
} from 'lucide-react'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { AnalyticsService } from '@/lib/services/database'

interface DashboardStats {
  totalProjects: number
  publishedProjects: number
  draftProjects: number
  featuredProjects: number
  totalCategories: number
  recentProjects: number
  projectsByCategory: { category: string; count: number }[]
  projectsByYear: { year: number; count: number }[]
}

interface ProjectPerformance {
  id: string
  title: string
  slug: string
  is_published: boolean
  featured: boolean
  category: string | null
  created_at: string
  updated_at: string
  views?: number
  engagement?: number
}

interface CategoryStats {
  id: string
  name: string
  slug: string
  projectCount: number
  publishedCount: number
  draftCount: number
  featuredCount: number
  averageViews?: number
  recentActivity: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projectPerformance, setProjectPerformance] = useState<ProjectPerformance[]>([])
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'categories'>('overview')

  const loadAnalytics = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const [statsResult, performanceResult, categoryResult] = await Promise.all([
        AnalyticsService.getDashboardStats(),
        AnalyticsService.getProjectPerformance(),
        AnalyticsService.getCategoryStats()
      ])

      if (statsResult.error) {
        console.error('Error loading dashboard stats:', statsResult.error)
      } else {
        setStats(statsResult.data)
      }

      if (performanceResult.error) {
        console.error('Error loading project performance:', performanceResult.error)
      } else {
        setProjectPerformance(performanceResult.data || [])
      }

      if (categoryResult.error) {
        console.error('Error loading category stats:', categoryResult.error)
      } else {
        setCategoryStats(categoryResult.data || [])
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setExporting(true)
      const result = await AnalyticsService.exportData(format)
      
      if (result.error) {
        console.error('Error exporting data:', result.error)
        return
      }

      if (result.data) {
        const blob = new Blob([result.data], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `wolf-studio-analytics-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-financier text-cbre-green mb-2">
            Analytics & Insights
          </h1>
          <p className="text-dark-grey font-calibre">
            Monitor your project performance and content insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <CBREButton 
            variant="outline" 
            onClick={() => loadAnalytics(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </CBREButton>
          <div className="flex items-center space-x-2">
            <CBREButton 
              variant="outline" 
              onClick={() => handleExport('csv')}
              disabled={exporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </CBREButton>
            <CBREButton 
              variant="outline" 
              onClick={() => handleExport('json')}
              disabled={exporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </CBREButton>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-8">
        <CBREButton
          variant={activeTab === 'overview' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('overview')}
        >
          <Activity className="h-4 w-4 mr-2" />
          Overview
        </CBREButton>
        <CBREButton
          variant={activeTab === 'projects' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('projects')}
        >
          <FileText className="h-4 w-4 mr-2" />
          Projects
        </CBREButton>
        <CBREButton
          variant={activeTab === 'categories' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('categories')}
        >
          <PieChart className="h-4 w-4 mr-2" />
          Categories
        </CBREButton>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <CBRECard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-light-grey rounded-lg">
                  <FileText className="h-6 w-6 text-cbre-green" />
                </div>
              </div>
              <div>
                <p className="text-dark-grey font-calibre text-sm">Total Projects</p>
                <p className="font-financier text-2xl text-cbre-green">{stats.totalProjects}</p>
                <p className="text-gray-500 text-xs mt-1">All time</p>
              </div>
            </CBRECard>

            <CBRECard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-light-grey rounded-lg">
                  <Eye className="h-6 w-6 text-cbre-green" />
                </div>
              </div>
              <div>
                <p className="text-dark-grey font-calibre text-sm">Published</p>
                <p className="font-financier text-2xl text-cbre-green">{stats.publishedProjects}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {stats.totalProjects > 0 ? Math.round((stats.publishedProjects / stats.totalProjects) * 100) : 0}% of total
                </p>
              </div>
            </CBRECard>

            <CBRECard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-light-grey rounded-lg">
                  <Star className="h-6 w-6 text-cbre-green" />
                </div>
              </div>
              <div>
                <p className="text-dark-grey font-calibre text-sm">Featured Projects</p>
                <p className="font-financier text-2xl text-cbre-green">{stats.featuredProjects}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {stats.totalProjects > 0 ? Math.round((stats.featuredProjects / stats.totalProjects) * 100) : 0}% of total
                </p>
              </div>
            </CBRECard>

            <CBRECard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-light-grey rounded-lg">
                  <Calendar className="h-6 w-6 text-cbre-green" />
                </div>
              </div>
              <div>
                <p className="text-dark-grey font-calibre text-sm">Recent Projects</p>
                <p className="font-financier text-2xl text-cbre-green">{stats.recentProjects}</p>
                <p className="text-gray-500 text-xs mt-1">Last 30 days</p>
              </div>
            </CBRECard>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Projects by Category */}
            <CBRECard className="p-6">
              <h3 className="font-financier text-lg text-cbre-green mb-4 flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Projects by Category
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Tooltip />
                  <Pie 
                    data={stats.projectsByCategory} 
                    dataKey="count" 
                    nameKey="category"
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {stats.projectsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {stats.projectsByCategory.map((entry, index) => (
                  <div key={entry.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="font-calibre text-dark-grey">{entry.category}</span>
                    </div>
                    <span className="text-gray-500">{entry.count}</span>
                  </div>
                ))}
              </div>
            </CBRECard>

            {/* Projects by Year */}
            <CBRECard className="p-6">
              <h3 className="font-financier text-lg text-cbre-green mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Projects by Year
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.projectsByYear}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#0d5d3f" 
                    fill="#0d5d3f" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CBRECard>
          </div>

          {/* Status Overview */}
          <CBRECard className="p-6">
            <h3 className="font-financier text-lg text-cbre-green mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Content Status Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-financier text-green-600 mb-2">
                  {stats.publishedProjects}
                </div>
                <div className="text-sm text-gray-500 mb-2">Published Projects</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${stats.totalProjects > 0 ? (stats.publishedProjects / stats.totalProjects) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-financier text-yellow-600 mb-2">
                  {stats.draftProjects}
                </div>
                <div className="text-sm text-gray-500 mb-2">Draft Projects</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${stats.totalProjects > 0 ? (stats.draftProjects / stats.totalProjects) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-financier text-blue-600 mb-2">
                  {stats.totalCategories}
                </div>
                <div className="text-sm text-gray-500 mb-2">Total Categories</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-full"></div>
                </div>
              </div>
            </div>
          </CBRECard>
        </>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <CBRECard className="p-6">
          <h3 className="font-financier text-lg text-cbre-green mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Project Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-calibre text-dark-grey">Project</th>
                  <th className="text-left py-3 px-4 font-calibre text-dark-grey">Category</th>
                  <th className="text-left py-3 px-4 font-calibre text-dark-grey">Status</th>
                  <th className="text-left py-3 px-4 font-calibre text-dark-grey">Views</th>
                  <th className="text-left py-3 px-4 font-calibre text-dark-grey">Engagement</th>
                  <th className="text-left py-3 px-4 font-calibre text-dark-grey">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {projectPerformance.map((project) => (
                  <tr key={project.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div>
                          <div className="font-calibre text-dark-grey">{project.title}</div>
                          <div className="text-sm text-gray-500">{project.slug}</div>
                        </div>
                        {project.featured && (
                          <Star className="h-4 w-4 text-yellow-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-calibre text-dark-grey">
                        {project.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <CBREBadge className={
                        project.is_published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }>
                        {project.is_published ? 'Published' : 'Draft'}
                      </CBREBadge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-calibre text-dark-grey">
                        {project.views?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-cbre-green h-2 rounded-full"
                            style={{ width: `${project.engagement || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">{project.engagement || 0}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-500">
                        {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CBRECard>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <CBRECard className="p-6">
          <h3 className="font-financier text-lg text-cbre-green mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Category Usage Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryStats.map((category) => (
              <CBRECard key={category.id} className="p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-calibre text-dark-grey font-semibold">{category.name}</h4>
                  <CBREBadge className="bg-blue-100 text-blue-800">
                    {category.projectCount} projects
                  </CBREBadge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Published:</span>
                    <span className="font-calibre text-green-600">{category.publishedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Drafts:</span>
                    <span className="font-calibre text-yellow-600">{category.draftCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Featured:</span>
                    <span className="font-calibre text-purple-600">{category.featuredCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Avg Views:</span>
                    <span className="font-calibre text-dark-grey">{category.averageViews?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Activity:</span>
                    <span className="font-calibre text-dark-grey text-xs">{category.recentActivity}</span>
                  </div>
                </div>
              </CBRECard>
            ))}
          </div>
        </CBRECard>
      )}

      {/* Export Status */}
      {exporting && (
        <CBRECard className="p-4 mt-6 bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-sm font-calibre text-blue-800">Exporting data...</span>
          </div>
        </CBRECard>
      )}
    </div>
  )
} 