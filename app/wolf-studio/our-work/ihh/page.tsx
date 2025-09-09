'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  id: "ihh",
  title: "IHH Healthcare",
  subtitle: "A workplace without boundaries",
  
  details: [
    { label: "Size", value: "60,000 sqft" },
    { label: "Location", value: "Singapore" },
    { label: "Scope", value: "Design Consultancy" },
    { label: "Year", value: "2023" }
  ],
  
  description: [
    "The project itself comprised of 2 different locations, which were at 80 Bendemeer and Harbourfront. The key concept was to have a different design theme across the 2 spaces while also creating a connection across all IHH locations.",
    "The key design challenge was to strike that balance between introducing different design elements so each location would have a its own unique flavour and expression, but at the same time have that unifying signature IHH element and branding.",
    "The key to the space planning and workplace design was to have a wide variety of different types of work points and breaking away from the typical workstation offering. A highly agile working environment created a variety of more collaborative seats, huddle spaces, hotdesks and quiet zones for people to have more choice for work setting."
  ],
  
  bannerImage: "/scraped-images/work-projects/ihh/ihh-banner.jpg",
  
  galleryImages: [
    { 
      id: "gallery-1", 
      alt: "IHH Healthcare Interior Design",
      url: "/scraped-images/work-projects/ihh/ihh-gallery-1.jpg"
    },
    { 
      id: "gallery-2", 
      alt: "IHH Healthcare Workspace",
      url: "/scraped-images/work-projects/ihh/ihh-gallery-2.jpg"
    },
    { 
      id: "gallery-3", 
      alt: "IHH Healthcare Collaborative Space",
      url: "/scraped-images/work-projects/ihh/ihh-gallery-3.jpg"
    },
    { 
      id: "gallery-4", 
      alt: "IHH Healthcare Meeting Area",
      url: "/scraped-images/work-projects/ihh/ihh-gallery-4.jpg"
    },
    { 
      id: "gallery-5", 
      alt: "IHH Healthcare Office Space",
      url: "/scraped-images/work-projects/ihh/ihh-gallery-5.jpg"
    },
    { 
      id: "gallery-6", 
      alt: "IHH Healthcare Reception",
      url: "/scraped-images/work-projects/ihh/ihh-gallery-6.jpg"
    },
    { 
      id: "gallery-7", 
      alt: "IHH Healthcare Lounge Area",
      url: "/scraped-images/work-projects/ihh/ihh-gallery-7.jpg"
    },
    { 
      id: "gallery-8", 
      alt: "IHH Healthcare Work Environment",
      url: "/scraped-images/work-projects/ihh/ihh-gallery-8.jpg"
    },
    { 
      id: "gallery-9", 
      alt: "IHH Healthcare Common Area",
      url: "/scraped-images/work-projects/ihh/ihh-gallery-9.jpg"
    },
    { 
      id: "gallery-10", 
      alt: "IHH Healthcare Design Detail",
      url: "/scraped-images/work-projects/ihh/ihh-gallery-10.jpg"
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
export default function IHHProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="ihh"
      fallbackData={fallbackProjectData}
    />
  )
} 