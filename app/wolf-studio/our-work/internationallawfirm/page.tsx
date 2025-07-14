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
  id: "internationallawfirm",
  title: "International Law Firm",
  subtitle: "Transformative agile workspace",
  
  // Project metadata
  details: [
    { label: "Size", value: "25,000 sqft" },
    { label: "Location", value: "Singapore" },
    { label: "Scope", value: "Design & Build" },
    { label: "Year", value: "2022" }
  ],
  
  // Project description - could be a single rich text field in CMS
  description: [
    "This top tier International Law Firm spanned across 25,000 square feet with a goal to transform and revolutionise the traditional legal industry's workspaces typology.",
    "Catering to approximately 200 staff members, the design encompasses a dynamic mix of private rooms, shared workspaces, team-based areas, open work cafes, and collaborative zones."
  ],
  
  // Key objectives section
  objectives: [
    "Revitalize the Workspace: Create a fresh and invigorating environment that rekindles the enthusiasm of lawyers for office work.",
    "Enhance Work Efficiency: Provide attorneys with the tools and spaces required to excel in their professional endeavors.",
    "Professional Excellence: Craft an atmosphere that reflects the ethos of a top-tier law firm, characterized by professionalism, sophistication, and impeccable service.",
    "Comfort and Assurance: Infuse soft hospitality touches into the design to cultivate a sense of comfort and assurance among staff and visitors.",
    "Local Inspiration: Develop a warm and inviting Singaporean-inspired café adjacent to the reception, welcoming both internal stakeholders and external guests."
  ],
  
  // Design concept
  designConcept: [
    "Flexible Workspace Design: Emphasis on unassigned workspaces to foster collaboration, innovation, and adaptability.",
    "Private Rooms: Offering secluded, focused workspaces for lawyers requiring confidentiality and concentration.",
    "Shared Rooms: Encouraging interaction and knowledge sharing among legal teams.",
    "Team-Based Rooms: Facilitating group work and cross-functional collaboration among lawyers.",
    "Open Work Cafe: A central hub for networking and informal meetings, complete with comfortable seating and state-of-the-art technology.",
    "Collaboration Areas: Strategically placed zones for brainstorming, meetings, and group discussions.",
    "Singaporean-Inspired Cafe: A warm and welcoming café designed with Singaporean motifs, serving as a delightful gathering spot and a testament to the firm's local presence."
  ],
  
  // Banner image - main hero image
  bannerImage: "/scraped-images/work-projects/internationallawfirm/internationallawfirm-banner.jpg",
  
  // Gallery images - can be expanded with more metadata from CMS
  galleryImages: [
    { 
      id: "gallery-1", 
      alt: "International Law Firm",
      url: "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-1.jpg"
    },
    { 
      id: "gallery-2", 
      alt: "International Law Firm",
      url: "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-2.jpg"
    },
    { 
      id: "gallery-3", 
      alt: "International Law Firm",
      url: "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-3.jpg"
    },
    { 
      id: "gallery-4", 
      alt: "International Law Firm",
      url: "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-4.jpg"
    },
    { 
      id: "gallery-5", 
      alt: "International Law Firm",
      url: "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-5.jpg"
    },
    { 
      id: "gallery-6", 
      alt: "International Law Firm",
      url: "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-6.jpg"
    },
    { 
      id: "gallery-7", 
      alt: "International Law Firm",
      url: "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-7.jpg"
    },
    { 
      id: "gallery-8", 
      alt: "International Law Firm",
      url: "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-8.jpg"
    },
    { 
      id: "gallery-9", 
      alt: "International Law Firm",
      url: "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-9.jpg"
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
  useProjectTracking('internationallawfirm');
  
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
              {/* Main description paragraphs */}
              {projectData.description.map((paragraph, index) => (
                <p key={index} className="text-base mb-6 leading-relaxed text-dark-grey">
                  {paragraph}
                </p>
              ))}
              
              {/* Client's Objectives */}
              <h3 className="text-xl font-semibold mb-4">Client&apos;s Objectives for this transformation:</h3>
              <div className="mb-6">
                {projectData.objectives.map((objective, index) => (
                  <div key={index} className="mb-2 text-base leading-relaxed text-dark-grey flex">
                    <span className="mr-2">{index + 1}.</span>
                    <span>{objective}</span>
                  </div>
                ))}
              </div>
              
              {/* Design Concept */}
              <h3 className="text-xl font-semibold mb-4">Design Concept:</h3>
              <div className="mb-6">
                {projectData.designConcept.map((concept, index) => (
                  <div key={index} className="mb-2 text-base leading-relaxed text-dark-grey flex">
                    <span className="mr-2">•</span>
                    <span>{concept}</span>
                  </div>
                ))}
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
