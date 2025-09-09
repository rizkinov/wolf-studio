'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "ridehailinggiant",
  "title": "Ride Hailing Giant",
  "subtitle": "Design & Build",
  "details": [
    {
      "label": "Size",
      "value": "20,000 sqft"
    },
    {
      "label": "Location",
      "value": "New Grade-A Building"
    },
    {
      "label": "Scope",
      "value": "Design & Build"
    },
    {
      "label": "Year",
      "value": "2019"
    }
  ],
  "description": [
    "The new Asia Pacific Headquarters in Singapore was designed and built by Wolf, providing a total turn key service. The project captures a rich melting pot of cultures that is representative of the region the office supports. Rooms and collaborative spaces are themed to provide a nostalgic experience of good food synonymous with South East Asian cuisines.",
    "Mural Art and an eclectic mix of design accessories provided the finishing touches and talking points for visitors and staff."
  ],
  "bannerImage": "/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Ride Hailing Giant Office Space",
      "url": "/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Ride Hailing Giant Collaborative Area",
      "url": "/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Ride Hailing Giant Meeting Space",
      "url": "/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Ride Hailing Giant Reception",
      "url": "/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "Ride Hailing Giant Workspace",
      "url": "/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "Ride Hailing Giant Office Design",
      "url": "/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-6.jpg"
    },
    {
      "id": "gallery-7",
      "alt": "Ride Hailing Giant Collaborative Space",
      "url": "/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-7.jpg"
    },
    {
      "id": "gallery-8",
      "alt": "Ride Hailing Giant Meeting Room",
      "url": "/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-8.jpg"
    },
    {
      "id": "gallery-9",
      "alt": "Ride Hailing Giant Office Interior",
      "url": "/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-9.jpg"
    }
  ]
};

/**
 * Ride Hailing Giant Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function RidehailinggiantProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="ridehailinggiant"
      fallbackData={fallbackProjectData}
    />
  )
}