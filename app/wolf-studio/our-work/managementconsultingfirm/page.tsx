'use client'

import React from 'react'
import Link from 'next/link'
import { BackToWorkButton } from '@/components/back-to-work-button'
import { useProjectTracking } from '@/components/project-page-with-tracking'


/**
 * Project Page Template - Wolf Studio
 * 
 * This component serves as a template for project pages.
 * For CMS integration:
 * 1. Replace projectData with data from your CMS
 * 2. Update image paths to point to your CMS media library
 * 3. Keep the layout structure consistent for all projects
 */

// Sample project data structure - this would come from your CMS
const projectData = {
  // Basic project information
  id: "managementconsultingfirm",
  title: "Management Consulting Firm",
  subtitle: "Taipei Office",
  
  // Project metadata
  details: [
    { label: "Size", value: "20,000 sqft" },
    { label: "Location", value: "Taipei" },
    { label: "Scope", value: "Design Consultancy" },
    { label: "Year", value: "2022" }
  ],
  
  // Project description - could be a single rich text field in CMS
  description: [
    "This office interior design project created a modern, open workspace with a deep appreciation for Taiwanese culture and a client-centric approach. It was designed as a haven of calmness and productivity, fostering a sense of belonging and well-being among employees while offering a touch of luxury and tranquility in client areas."
  ],
  
  // Banner image - main hero image
  bannerImage: "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-banner.jpg",
  
  // Gallery images - can be expanded with more metadata from CMS
  galleryImages: [
    { 
      id: "gallery-1", 
      alt: "Management Consulting Firm Taiwan Office",
      url: "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-1.jpg"
    },
    { 
      id: "gallery-2", 
      alt: "Management Consulting Firm Taiwan Workspace",
      url: "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-2.jpg"
    },
    { 
      id: "gallery-3", 
      alt: "Management Consulting Firm Taiwan Collaboration Area",
      url: "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-3.jpg"
    },
    { 
      id: "gallery-4", 
      alt: "Management Consulting Firm Taiwan Panoramic View",
      url: "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-4.jpg"
    },
    { 
      id: "gallery-5", 
      alt: "Management Consulting Firm Taiwan Meeting Area",
      url: "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-5.jpg"
    },
    { 
      id: "gallery-6", 
      alt: "Management Consulting Firm Taiwan Reception",
      url: "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-6.jpg"
    },
    { 
      id: "gallery-7", 
      alt: "Management Consulting Firm Taiwan Client Area",
      url: "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-7.jpg"
    },
    { 
      id: "gallery-8", 
      alt: "Management Consulting Firm Taiwan Interior",
      url: "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-8.jpg"
    },
    { 
      id: "gallery-9", 
      alt: "Management Consulting Firm Taiwan Workspace",
      url: "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-9.jpg"
    },
    { 
      id: "gallery-10", 
      alt: "Management Consulting Firm Taiwan Design Detail",
      url: "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-10.jpg"
    }
  ]
};

/**
 * ProjectPage Component
 * 
 * This is a template for any project detail page.
 * When integrating with a CMS, you would:
 * 1. Fetch project data from your API/CMS
 * 2. Replace the hardcoded projectData with your fetched data
 * 3. Keep the component structure the same
 */
export default function ProjectPage() {
  // When integrating with a CMS, you'd replace this with your data fetch logic
  // For example:
  // const { data: projectData, isLoading, error } = useProjectData(projectId);
  
  // Track page view for analytics
  useProjectTracking('managementconsultingfirm');
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
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
          <img 
            src={projectData.bannerImage} 
            alt={`${projectData.title} Banner`} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Title Section */}
        <div className="pt-8 pb-4 max-w-3xl mx-auto px-6">
          {projectData.subtitle && (
            <h6 className="text-sm uppercase mb-2 tracking-wider font-medium text-[#333333] font-calibre">{projectData.subtitle}</h6>
          )}
          <h1 className="text-5xl font-financier font-bold text-dark-grey">{projectData.title}</h1>
        </div>

        {/* Project Info Section */}
        <section className="py-12 max-w-3xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Project Description */}
            <div className="md:w-2/3">
              {projectData.description.map((paragraph, index) => (
                <p key={index} className="text-base mb-6 leading-relaxed text-dark-grey">
                  {paragraph}
                </p>
              ))}
              
              {/* Design Philosophy */}
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-3">Open Office and Agile Working</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li className="text-base leading-relaxed text-dark-grey">
                    The primary focus was creating an open office layout that encourages collaboration and flexibility in workspace allocation
                  </li>
                  <li className="text-base leading-relaxed text-dark-grey">
                    Workstations were designed with adjustable desks, flexible seating options, and easy access to shared amenities
                  </li>
                  <li className="text-base leading-relaxed text-dark-grey">
                    Ergonomic furniture, ample greenery, and the incorporation of natural light created a nurturing atmosphere
                  </li>
                  <li className="text-base leading-relaxed text-dark-grey">
                    Design solutions foster a culture of agility and adaptability in the workplace
                  </li>
                </ul>
              </div>
              
              {/* Key Features */}
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-3">Local Taiwanese Influence</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li className="text-base leading-relaxed text-dark-grey">
                    Unique elements reflecting the local context of Taiwan were incorporated into the design
                  </li>
                  <li className="text-base leading-relaxed text-dark-grey">
                    Materials, textures, and feature walls inspired by Taiwanese culture, art, and history
                  </li>
                  <li className="text-base leading-relaxed text-dark-grey">
                    Local artisanal craftsmanship is showcased to celebrate the region&apos;s rich heritage
                  </li>
                  <li className="text-base leading-relaxed text-dark-grey">
                    Integration of cultural influences with modern office design principles
                  </li>
                </ul>
              </div>
              
              {/* Project Impact */}
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-3">Client Areas</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li className="text-base leading-relaxed text-dark-grey">
                    Client areas exude a sense of tranquility and sophistication with a zen-inspired design
                  </li>
                  <li className="text-base leading-relaxed text-dark-grey">
                    Use of natural materials, soft lighting, and minimalistic aesthetics created a serene environment
                  </li>
                  <li className="text-base leading-relaxed text-dark-grey">
                    Dedicated training rooms designed to accommodate various learning formats and workshops
                  </li>
                  <li className="text-base leading-relaxed text-dark-grey">
                    Modular furniture and advanced AV technology ensures versatility for different client needs
                  </li>
                </ul>
              </div>
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
                <img 
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-[350px] object-cover"
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