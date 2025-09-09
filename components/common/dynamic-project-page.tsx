'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { BackToWorkButton } from '@/components/common/back-to-work-button'
import { useProjectTracking } from '@/components/common/project-page-with-tracking'
import { ProjectService } from '@/lib/services/database'
import { ProjectWithCategoryAndImages } from '@/lib/types/database'
import { BannerImage, GalleryImage } from '@/components/ui/optimized-image'

interface DynamicProjectPageProps {
  projectSlug: string
  fallbackData?: {
    id: string
    title: string
    subtitle: string
    details: Array<{ label: string; value: string }>
    description: string[]
    bannerImage: string
    galleryImages: Array<{ id: string; alt: string; url: string }>
  }
}

/**
 * Dynamic Project Page Component
 * 
 * This component fetches project data from the database first,
 * and falls back to provided static data if the database fetch fails.
 * This allows admin changes to be reflected immediately on live pages.
 */
export function DynamicProjectPage({ projectSlug, fallbackData }: DynamicProjectPageProps) {
  const [project, setProject] = useState<ProjectWithCategoryAndImages | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track page view for analytics
  useProjectTracking(projectSlug)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const { data, error } = await ProjectService.getProject(projectSlug, true) // bySlug = true
        
        if (error || !data) {
          throw new Error('Project not found in database')
        }
        
        setProject(data)
      } catch (err) {
        console.warn(`Failed to fetch project ${projectSlug} from database, using fallback data:`, err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectSlug])

  // Transform database project data or use fallback
  const projectData = React.useMemo(() => {
    if (project) {
      // Use database data (admin changes will be reflected)
      return {
        id: project.slug,
        title: project.title,
        subtitle: project.subtitle || '',
        details: [
          { label: "Size", value: project.size || 'Not specified' },
          { label: "Location", value: project.location || 'Not specified' },
          { label: "Scope", value: project.scope || 'Not specified' },
          { label: "Year", value: project.year?.toString() || 'Not specified' }
        ],
        description: project.description?.content ? 
          [project.description.content] :
          fallbackData?.description || ['Project description coming soon.'],
        bannerImage: project.banner_image_url || fallbackData?.bannerImage || '/placeholder-banner.jpg',
        galleryImages: project.images?.map((img, index) => ({
          id: `gallery-${index + 1}`,
          alt: img.alt_text || `${project.title} gallery image ${index + 1}`,
          url: img.image_url
        })) || fallbackData?.galleryImages || []
      }
    } else if (fallbackData) {
      // Use fallback data if database fails
      return fallbackData
    } else {
      // Default empty state
      return {
        id: projectSlug,
        title: 'Project Not Found',
        subtitle: '',
        details: [],
        description: ['Project information not available.'],
        bannerImage: '/placeholder-banner.jpg',
        galleryImages: []
      }
    }
  }, [project, fallbackData, projectSlug])

  if (loading && !fallbackData) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="flex items-center justify-center flex-grow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cbre-green"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Show admin notice if using database data */}
      {project && (
        <div className="hidden" data-source="database" data-updated={project.updated_at}></div>
      )}
      
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
            <Link href="/wolf-studio/#meet-the-pack" className="hover:text-cbre-green">Meet the Pack</Link>
            <Link href="/wolf-studio/our-work" className="text-cbre-green font-medium">Our Work</Link>
            <Link href="/wolf-studio/#what-we-offer" className="hover:text-cbre-green">What We Offer</Link>
            <Link href="/wolf-studio/#our-hideout" className="hover:text-cbre-green">Our Hideout</Link>
            <Link href="/wolf-studio/#social" className="hover:text-cbre-green">Social</Link>
            <Link href="/wolf-studio/#get-in-touch" className="hover:text-cbre-green">Get in Touch</Link>
          </div>
          <div className="md:hidden">
            <button className="focus:outline-none">
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
        <div className="w-full h-[45vh] relative overflow-hidden border-b border-gray-100">
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
          <h1 className="text-5xl font-financier font-bold text-dark-grey">
            {projectData.title}
          </h1>
        </div>

        {/* Project Info Section */}
        <section className="py-12 max-w-3xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Project Description */}
            <div className="md:w-2/3">
              {projectData.description.map((content, index) => (
                <div 
                  key={index} 
                  className="text-base leading-relaxed text-dark-grey project-description"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ))}
            </div>

            {/* Project Details */}
            <div className="md:w-1/3">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Project Details</h3>
                <div className="grid grid-cols-1 gap-4">
                  {projectData.details.map((detail, index) => (
                    <div key={index}>
                      <p className="text-sm text-gray-500">{detail.label}</p>
                      <p className="font-financier text-lg">{detail.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Project Gallery */}
        <section className="py-10 max-w-3xl mx-auto px-6">
          <div className="flex flex-col space-y-5">
            {projectData.galleryImages.map((image) => (
              <div key={image.id} className="overflow-hidden w-full border border-gray-100 shadow-sm">
                <GalleryImage
                  src={image.url}
                  alt={image.alt}
                  lazy={true}
                  className="w-full h-[350px]"
                />
              </div>
            ))}
          </div>
          <BackToWorkButton />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#012A2D] py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-[rgb(230,232,233)]">© 2025 WOLF Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}