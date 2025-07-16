'use client'

import React from 'react'
import Link from 'next/link'
import { BackToWorkButton } from '@/components/common/back-to-work-button'
import { useProjectTracking } from '@/components/common/project-page-with-tracking'
import { ProjectService } from '@/lib/services/database'
import { ProjectWithCategoryAndImages, ProjectImage } from '@/lib/types/database'
import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { BannerImage, GalleryImage } from '@/components/ui/optimized-image'
import { requestThrottler } from '@/lib/utils/request-throttling'
import { PerformanceMonitor } from '@/components/ui/performance-monitor'
import { useAuth } from '@/lib/auth/context'
import { useIsAdmin } from '@/lib/hooks/usePermissions'
import { AdminDebugPanel } from '@/components/admin/AdminDebugPanel'

interface ProjectPageProps {
  params: Promise<{
    slug: string
  }>
}

// Enhanced loading skeleton component
function ProjectLoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="h-12 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="hidden md:flex space-x-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </nav>
      </header>

      {/* Banner skeleton */}
      <div className="w-full h-[45vh] bg-gray-200 animate-pulse"></div>

      {/* Content skeleton */}
      <div className="flex-grow">
        <div className="pt-8 pb-4 max-w-3xl mx-auto px-6">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-12 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <section className="py-12 max-w-3xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-2/3 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
            <div className="md:w-1/3">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="mb-4">
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 max-w-3xl mx-auto px-6">
          <div className="flex flex-col space-y-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-full h-[350px] bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

// Error state component
function ProjectErrorState({ error }: { error: string }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/wolf-studio">
            <div className="h-12">
              <img 
                src="/wolf-studio-logo-head.svg" 
                alt="WOLF Studio Logo" 
                className="h-full"
              />
            </div>
          </Link>
        </nav>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="text-center p-8">
          <svg 
            className="w-24 h-24 mx-auto mb-6 text-gray-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/wolf-studio/our-work" 
            className="inline-flex items-center px-4 py-2 bg-[var(--cbre-green)] text-white rounded-lg hover:bg-[var(--cbre-green)]/90 transition-colors"
          >
            ← Back to Our Work
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function DynamicProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = React.use(params)
  const [project, setProject] = useState<ProjectWithCategoryAndImages | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set())

  // Check if user is authenticated admin (for performance monitor)
  const { isAuthenticated } = useAuth()
  const isAdmin = useIsAdmin()
  const showPerformanceMonitor = isAuthenticated && isAdmin

  // Track page view for analytics
  useProjectTracking(resolvedParams.slug)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Use request throttling to prevent rapid duplicate requests
        const data = await requestThrottler.throttle(
          `project-${resolvedParams.slug}`,
          async () => {
            const { data, error } = await ProjectService.getProject(resolvedParams.slug, true) // bySlug = true
            
            if (error || !data) {
              throw new Error('Project not found')
            }
            
            return data
          },
          2000 // Cache for 2 seconds
        )

        setProject(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load project'
        setError(errorMessage)
        console.error('Error fetching project:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [resolvedParams.slug])

  // Handle image load errors
  const handleImageError = (imageUrl: string) => {
    setImageLoadErrors(prev => new Set(prev).add(imageUrl))
  }

  if (loading) {
    return <ProjectLoadingSkeleton />
  }

  if (error || !project) {
    return <ProjectErrorState error={error || 'Project not found'} />
  }

  // Transform database project data to match the expected format
  const projectData = {
    id: project.slug,
    title: project.title,
    subtitle: project.subtitle || '',
    details: [
      { label: "Size", value: project.size || 'Not specified' },
      { label: "Location", value: project.location || 'Not specified' },
      { label: "Scope", value: project.scope || 'Not specified' },
      { label: "Year", value: project.year?.toString() || 'Not specified' }
    ],
    description: project.description && project.description.content ? 
      project.description.content.split('\n').filter((p: string) => p.trim() !== '') : 
      ['Project description coming soon.'],
    bannerImage: project.banner_image_url || '/placeholder-banner.jpg',
    galleryImages: project.images?.map((img: ProjectImage, index: number) => ({
      id: `gallery-${index + 1}`,
      alt: img.alt_text || `${project.title} gallery image ${index + 1}`,
      url: img.image_url
    })) || []
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Performance Monitor (Admin Only) */}
      {showPerformanceMonitor && <PerformanceMonitor />}
      
      {/* Debug Panel (temporary) */}
      <AdminDebugPanel />
      
      {/* Navigation Menu */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/wolf-studio">
              <div className="h-12">
                <img 
                  src="/wolf-studio-logo-head.svg" 
                  alt="WOLF Studio Logo" 
                  className="h-full"
                />
              </div>
            </Link>
          </div>
          <div className="hidden md:flex space-x-6">
            <Link href="/wolf-studio/#meet-the-pack" className="hover:text-cbre-green transition-colors">Meet the Pack</Link>
            <Link href="/wolf-studio/our-work" className="text-cbre-green font-medium">Our Work</Link>
            <Link href="/wolf-studio/#what-we-offer" className="hover:text-cbre-green transition-colors">What We Offer</Link>
            <Link href="/wolf-studio/#our-hideout" className="hover:text-cbre-green transition-colors">Our Hideout</Link>
            <Link href="/wolf-studio/#social" className="hover:text-cbre-green transition-colors">Social</Link>
            <Link href="/wolf-studio/#get-in-touch" className="hover:text-cbre-green transition-colors">Get in Touch</Link>
          </div>
          <div className="md:hidden">
            <button className="focus:outline-none" aria-label="Open menu">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Banner */}
        <div className="w-full h-[45vh] md:h-[60vh] relative overflow-hidden border-b border-gray-100">
          <BannerImage
            src={projectData.bannerImage}
            alt={`${projectData.title} Banner`}
            priority={true}
            className="w-full h-full"
          />
        </div>
        
        {/* Title Section */}
        <div className="pt-8 pb-4 max-w-3xl mx-auto px-6">
          {projectData.subtitle && (
            <h6 className="text-sm uppercase mb-2 tracking-wider font-medium text-[#333333] font-calibre">
              {projectData.subtitle}
            </h6>
          )}
          <h1 className="text-3xl md:text-5xl font-financier font-bold text-dark-grey leading-tight">
            {projectData.title}
          </h1>
        </div>

        {/* Project Info Section */}
        <section className="py-12 max-w-3xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Project Description */}
            <div className="lg:w-2/3">
              {projectData.description.map((paragraph: string, index: number) => (
                <p 
                  key={index} 
                  className="text-base mb-6 leading-relaxed text-dark-grey"
                  dangerouslySetInnerHTML={{ __html: paragraph }}
                />
              ))}
            </div>

            {/* Project Details */}
            <div className="lg:w-1/3">
              <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
                <h3 className="text-xl font-semibold mb-4 font-financier">Project Details</h3>
                <div className="grid grid-cols-1 gap-4">
                  {projectData.details.map((detail, index) => (
                    <div key={index}>
                      <p className="text-sm text-gray-500 font-calibre">{detail.label}</p>
                      <p className="font-financier text-lg text-dark-grey">{detail.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Project Gallery */}
        <section className="py-10 max-w-3xl mx-auto px-6">
          <div className="flex flex-col space-y-6 md:space-y-8">
            {projectData.galleryImages.map((image: { id: string; alt: string; url: string }, index: number) => (
              <div 
                key={image.id} 
                className="overflow-hidden w-full border border-gray-100 shadow-sm rounded-lg hover:shadow-md transition-shadow duration-300"
              >
                <GalleryImage
                  src={image.url}
                  alt={image.alt}
                  lazy={index > 0} // First image loads immediately, rest are lazy
                  className="w-full h-[300px] md:h-[400px] lg:h-[450px]"
                />
              </div>
            ))}
            
            {projectData.galleryImages.length === 0 && (
              <div className="text-center py-12">
                <svg 
                  className="w-16 h-16 mx-auto mb-4 text-gray-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
                <p className="text-gray-500 font-calibre">Gallery images coming soon</p>
              </div>
            )}
          </div>
          
          <div className="mt-12">
            <BackToWorkButton />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#012A2D] py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-[rgb(230,232,233)] font-calibre">
            © 2025 WOLF Studio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
} 