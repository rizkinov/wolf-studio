import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CBREButton } from '@/components/cbre-button'
import { CBREStyledCard } from '@/components/cbre-styled-card'

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
  id: "globalconsultinggiant",
  title: "Global Consulting Giant",
  subtitle: "Professional Services Firm",
  
  // Project metadata
  details: [
    { label: "Size", value: "90,000 sqft" },
    { label: "Location", value: "Singapore" },
    { label: "Scope", value: "Workplace Strategy & Design" },
    { label: "Year", value: "2022" }
  ],
  
  // Project description - could be a single rich text field in CMS
  description: [
    "For this global professional services firm, we created a flagship office that embodies their position as a leader in the consulting world. The design reflects their forward-thinking approach while maintaining the sophistication and gravitas expected of a premier consulting organization.",
    "The workspace is organized around a central hub that serves as the heart of the office - creating opportunities for spontaneous collaboration and knowledge sharing between practice groups. From this hub radiate specialized neighborhoods for different consulting disciplines, each with their own character while maintaining overall design cohesion.",
    "Client-facing spaces were given special attention, with a variety of meeting settings from formal boardrooms to casual conversation areas. Advanced technology is seamlessly integrated throughout, supporting hybrid collaboration and enabling consultants to work effectively with colleagues and clients across global locations."
  ],
  
  // Banner image - main hero image
  bannerImage: "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-banner.jpg",
  
  // Gallery images - can be expanded with more metadata from CMS
  galleryImages: [
    { 
      id: "gallery-1", 
      alt: "Global Consulting Giant Interior Design",
      url: "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-1.jpg"
    },
    { 
      id: "gallery-2", 
      alt: "Global Consulting Giant Reception",
      url: "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-2.jpg"
    },
    { 
      id: "gallery-3", 
      alt: "Global Consulting Giant Workspace",
      url: "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-3.jpg"
    },
    { 
      id: "gallery-4", 
      alt: "Global Consulting Giant Meeting Room",
      url: "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-4.jpg"
    },
    { 
      id: "gallery-5", 
      alt: "Global Consulting Giant Collaboration Area",
      url: "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-5.jpg"
    },
    { 
      id: "gallery-6", 
      alt: "Global Consulting Giant Client Space",
      url: "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-6.jpg"
    },
    { 
      id: "gallery-7", 
      alt: "Global Consulting Giant Social Hub",
      url: "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-7.jpg"
    },
    { 
      id: "gallery-8", 
      alt: "Global Consulting Giant Focus Area",
      url: "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-8.jpg"
    },
    { 
      id: "gallery-9", 
      alt: "Global Consulting Giant Amenity Space",
      url: "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-9.jpg"
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
          <h6 className="text-sm uppercase mb-2 tracking-wider font-medium text-[#333333] font-calibre">{projectData.subtitle}</h6>
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
            {projectData.galleryImages.map((image, index) => (
              <div key={image.id} className="overflow-hidden w-full border border-gray-100 shadow-sm">
                <img 
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-[350px] object-cover"
                />
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/wolf-studio/our-work">
              <CBREButton variant="view-more">
                Back to work
              </CBREButton>
            </Link>
          </div>
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