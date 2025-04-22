import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CBREButton } from '@/components/cbre-button'
import { CBREStyledCard } from '@/components/cbre-styled-card'
import { BackToWorkButton } from '@/components/back-to-work-button'


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
  id: "managementconsultingsg",
  title: "Management Consulting SG",
  subtitle: "Global Consultancy Headquarters",
  
  // Project metadata
  details: [
    { label: "Size", value: "20,000 sqft" },
    { label: "Location", value: "Singapore" },
    { label: "Scope", value: "Design Consultancy" },
    { label: "Year", value: "2022" }
  ],
  
  // Project description - could be a single rich text field in CMS
  description: [
    "WOLF was commissioned to design the Singapore headquarters for a global management consulting firm, creating a space that balances professionalism with innovation. The project aimed to reflect the firm's forward-thinking approach while providing a sophisticated environment for client interactions and collaborative work.",
    "Our design seamlessly integrates elements of Singaporean culture with the firm's global brand identity, creating a workspace that feels both locally relevant and internationally connected. The space serves as a powerful tool for talent attraction and retention in the competitive consulting sector."
  ],
  
  // Key themes section
  keyThemes: [
    {
      title: "Client-Centric Design",
      description: "The front-of-house spaces were designed with client experience as the priority. A welcoming reception area transitions into versatile meeting spaces equipped with state-of-the-art presentation technology. Private client lounges provide discreet areas for sensitive discussions, while the showcase space highlights the firm's global achievements and methodology through interactive displays."
    },
    {
      title: "Collaborative Ecosystem",
      description: "Beyond the client-facing areas, the workspace is organized into neighborhoods that support different work modes. Project zones feature flexible furniture systems that can be reconfigured based on team size and project requirements. Digital collaboration tools are integrated throughout, enabling seamless connection with global teams. Casual collision spaces encourage spontaneous interaction and knowledge sharing among consultants."
    },
    {
      title: "Wellness & Sustainability",
      description: "Employee wellbeing was central to our approach, with biophilic elements incorporated throughout to reduce stress and improve cognitive function. The lighting design mimics natural daylight cycles, supporting healthy circadian rhythms despite long working hours. Sustainable materials with low environmental impact were selected, and energy-efficient systems were implemented to reduce the carbon footprint, aligning with the firm's global sustainability commitments."
    },
    {
      title: "Brand Expression",
      description: "The firm's brand identity is subtly woven into the architectural elements and material palette. Corporate colors appear as thoughtful accents rather than overwhelming statements. Local art and design elements reflect Singapore's unique cultural position as a global business hub while creating a sense of place. The overall aesthetic strikes a perfect balance between timeless professionalism and contemporary innovation."
    }
  ],
  
  // Banner image - main hero image
  bannerImage: "/scraped-images/work-projects/managementconsultingsg/mcsg-banner.jpg",
  
  // Gallery images - can be expanded with more metadata from CMS
  galleryImages: [
    { 
      id: "gallery-1", 
      alt: "Elegant reception area featuring natural materials and subtle brand integration",
      url: "/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-1.jpg"
    },
    { 
      id: "gallery-2", 
      alt: "Contemporary client meeting space with advanced presentation technology",
      url: "/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-2.jpg"
    },
    { 
      id: "gallery-3", 
      alt: "Collaborative work zone with flexible furniture arrangements and digital tools",
      url: "/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-3.jpg"
    },
    { 
      id: "gallery-4", 
      alt: "Private client lounge designed for confidential discussions",
      url: "/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-4.jpg"
    },
    { 
      id: "gallery-5", 
      alt: "Interactive showcase area highlighting the firm's global achievements",
      url: "/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-5.jpg"
    },
    { 
      id: "gallery-6", 
      alt: "Biophilic elements integrated into the workspace to enhance wellbeing",
      url: "/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-6.jpg"
    },
    { 
      id: "gallery-7", 
      alt: "Staff café designed for both relaxation and informal collaboration",
      url: "/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-7.jpg"
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
              {/* Main description paragraphs */}
              {projectData.description.map((paragraph, index) => (
                <p key={index} className="text-base mb-4 leading-relaxed text-dark-grey">
                  {paragraph}
                </p>
              ))}
              
              {/* Numbered list with proper indentation */}
              <div className="pl-8 mb-6">
                {projectData.keyThemes.map((theme, index) => (
                  <div key={index} className="mb-2 text-base leading-relaxed text-dark-grey flex">
                    <span className="mr-2">{index + 1}.</span>
                    <span>{theme.title}</span>
                  </div>
                ))}
              </div>
              
              {/* Additional paragraphs */}
              {projectData.keyThemes.map((theme, index) => (
                <p key={`${theme.title}-description`} className="text-base mb-6 leading-relaxed text-dark-grey">
                  {theme.description}
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