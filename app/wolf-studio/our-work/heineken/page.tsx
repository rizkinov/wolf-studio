'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "heineken",
  "title": "Heineken",
  "subtitle": "A workplace, A Bar, an East meets West melting pot of 2 brands",
  "details": [
    {
      "label": "Size",
      "value": "32,000 sqft"
    },
    {
      "label": "Location",
      "value": "The Metropolis"
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
    "The new Heineken workplace in Singapore brings together both the Heineken and Tiger Beer brands together to create a new experience for staff and visitors. Wolf was engaged to carry our live office A&A works to totally transform the old office design to improve work settings, brand experience, and overall employee wellness in the new environment.",
    "A 'walk and talk' path (for wondering discussion) is woven through the office that connects the Bar, to key collaborative spaces, to shared meeting rooms and pantry facilities is a symbolic expression of both brands coming together in Singapore.",
    "Design touches throughout the workplace tells a story of east meets west."
  ],
  "bannerImage": "/scraped-images/work-projects/heineken/heineken-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Heineken Office Space",
      "url": "/scraped-images/work-projects/heineken/heineken-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Heineken Collaborative Area",
      "url": "/scraped-images/work-projects/heineken/heineken-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Heineken Meeting Space",
      "url": "/scraped-images/work-projects/heineken/heineken-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Heineken Office Design",
      "url": "/scraped-images/work-projects/heineken/heineken-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "Heineken Workspace",
      "url": "/scraped-images/work-projects/heineken/heineken-gallery-5.jpg"
    }
  ]
};

/**
 * Heineken Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function HeinekenProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="heineken"
      fallbackData={fallbackProjectData}
    />
  )
}