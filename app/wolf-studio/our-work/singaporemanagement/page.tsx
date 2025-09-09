'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "singaporemanagement",
  "title": "Singapore Management",
  "subtitle": "Consulting Firm",
  "details": [
    {
      "label": "Size",
      "value": "40,000 sqft"
    },
    {
      "label": "Location",
      "value": "Singapore"
    },
    {
      "label": "Scope",
      "value": "Workplace Design & Build"
    },
    {
      "label": "Year",
      "value": "2023"
    }
  ],
  "description": [
    "This project for a leading Singapore-based management consulting firm focused on creating a workspace that embodies their analytical approach and commitment to excellence. The design emphasizes functionality while maintaining a sophisticated aesthetic suitable for client presentations and daily collaborative work.",
    "We introduced a variety of spaces to accommodate different working styles and needs, from focused private areas to dynamic team collaboration zones. Special attention was paid to creating seamless technology integration throughout, enabling consultants to work efficiently across global teams.",
    "The material palette combines natural elements with modern finishes, creating an environment that's both professional and inviting. Strategic use of the firm's brand colors creates visual interest while reinforcing corporate identity throughout the space."
  ],
  "bannerImage": "/scraped-images/work-projects/singaporemanagement/singaporemanagement-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Singapore Management Interior Design",
      "url": "/scraped-images/work-projects/singaporemanagement/singaporemanagement-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Singapore Management Workspace",
      "url": "/scraped-images/work-projects/singaporemanagement/singaporemanagement-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Singapore Management Meeting Room",
      "url": "/scraped-images/work-projects/singaporemanagement/singaporemanagement-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Singapore Management Collaborative Space",
      "url": "/scraped-images/work-projects/singaporemanagement/singaporemanagement-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "Singapore Management Reception",
      "url": "/scraped-images/work-projects/singaporemanagement/singaporemanagement-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "Singapore Management Breakout Area",
      "url": "/scraped-images/work-projects/singaporemanagement/singaporemanagement-gallery-6.jpg"
    }
  ]
};

/**
 * Singapore Management Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function SingaporemanagementProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="singaporemanagement"
      fallbackData={fallbackProjectData}
    />
  )
}