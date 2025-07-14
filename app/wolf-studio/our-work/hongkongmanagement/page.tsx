import React from 'react'
import Link from 'next/link'
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
  id: "hongkongmanagement",
  title: "Management Consulting Firm",
  subtitle: "Innovative, agile, and collaborative workspace",
  
  // Project metadata
  details: [
    { label: "Size", value: "30,000 sqft" },
    { label: "Location", value: "Hong Kong" },
    { label: "Scope", value: "Design Consultancy" },
    { label: "Year", value: "2022" }
  ],
  
  // Project description - could be a single rich text field in CMS
  description: [
    "This office interior design project is centered around the headquarters of our esteemed client in Hong Kong. The objective was to create an innovative, agile, and collaborative workspace for their consultants.",
    "The design incorporated elements of hospitality in the reception and café areas, ensuring a warm welcome to clients and employees alike. Additionally, a large town hall space within the café will be highly flexible, enabling diverse use, and the integration of unique, local Hong Kong-inspired murals throughout the office facilitated intuitive wayfinding."
  ],
  
  // Key features
  keyFeatures: [
    "Hospitality-Inspired Reception and Café: The reception area features hospitality-inspired elements, offering a warm and inviting ambiance to visitors. The café serves as a multifunctional hub, fostering client interactions, casual meetings, and relaxation with a touch of hospitality.",
    "Flexible Town Hall Space: The café includes a large town hall space designed for high flexibility. This space is easily reconfigurable to host a variety of events, from company-wide meetings to training sessions and social gatherings.",
    "Local Hong Kong Inspiration: Unique, local Hong Kong-inspired murals are strategically placed throughout the office to reflect the city's culture, history, and vibrant energy. These murals not only add visual interest but also serve as wayfinding landmarks with unique color schemes that guide employees and guests.",
    "Employee Well-Being: A focus on the well-being of employees was integrated into the design with ergonomic furniture, access to natural light, and spaces for relaxation and rejuvenation."
  ],
  
  // Banner image - main hero image
  bannerImage: "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-banner.jpg",
  
  // Gallery images - can be expanded with more metadata from CMS
  galleryImages: [
    { 
      id: "gallery-1", 
      alt: "Management Consulting Firm Hong Kong Office",
      url: "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-1.jpg"
    },
    { 
      id: "gallery-2", 
      alt: "Management Consulting Firm Reception Area",
      url: "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-2.jpg"
    },
    { 
      id: "gallery-3", 
      alt: "Management Consulting Firm Workspace",
      url: "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-3.jpg"
    },
    { 
      id: "gallery-4", 
      alt: "Management Consulting Firm Collaborative Space",
      url: "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-4.jpg"
    },
    { 
      id: "gallery-5", 
      alt: "Management Consulting Firm Meeting Room",
      url: "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-5.jpg"
    },
    { 
      id: "gallery-6", 
      alt: "Management Consulting Firm Social Area",
      url: "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-6.jpg"
    },
    { 
      id: "gallery-7", 
      alt: "Management Consulting Firm Office Design",
      url: "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-7.jpg"
    },
    { 
      id: "gallery-8", 
      alt: "Management Consulting Firm Collaborative Area",
      url: "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-8.jpg"
    },
    { 
      id: "gallery-9", 
      alt: "Management Consulting Firm Office Interior",
      url: "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-9.jpg"
    },
    { 
      id: "gallery-10", 
      alt: "Management Consulting Firm Hong Kong Office Design",
      url: "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-10.jpg"
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
                <p key={index} className="text-base mb-6 leading-relaxed text-dark-grey">
                  {paragraph}
                </p>
              ))}
              
              {/* Key Features Section */}
              <h3 className="text-xl font-semibold mb-4">Key Design Features</h3>
              <div className="mb-6">
                {projectData.keyFeatures.map((feature, index) => (
                  <div key={index} className="mb-4 text-base leading-relaxed text-dark-grey">
                    <div className="flex items-start">
                      <span className="text-[#012A2D] font-bold mr-3 min-w-[20px]">
                        {index + 1}.
                      </span>
                      <div>
                        <strong>{feature.split(':')[0]}:</strong> {feature.split(':')[1]}
                      </div>
                    </div>
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