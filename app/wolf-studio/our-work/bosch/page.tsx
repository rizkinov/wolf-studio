'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "bosch",
  "title": "BOSCH",
  "subtitle": "A multinational engineering and electronics company",
  "details": [
    {
      "label": "Size",
      "value": "25,000 sqft"
    },
    {
      "label": "Location",
      "value": "Robert Bosch Building Bishan"
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
    "Wolf was tasked to carry out live office refresh of the Bosch headquarters in Singapore. The challenge: To spark enthusiasm, improve quality of life, and help conserve natural resources as part of the new workplace initiatives that align with their mission.",
    "The result: An uplifting and refreshing workplace that spark happiness."
  ],
  "bannerImage": "/scraped-images/work-projects/bosch/bosch-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Bosch office",
      "url": "/scraped-images/work-projects/bosch/bosch-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Bosch office",
      "url": "/scraped-images/work-projects/bosch/bosch-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Bosch office",
      "url": "/scraped-images/work-projects/bosch/bosch-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Bosch office",
      "url": "/scraped-images/work-projects/bosch/bosch-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "Bosch office",
      "url": "/scraped-images/work-projects/bosch/bosch-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "Bosch office",
      "url": "/scraped-images/work-projects/bosch/bosch-gallery-6.jpg"
    },
    {
      "id": "gallery-7",
      "alt": "Bosch office",
      "url": "/scraped-images/work-projects/bosch/bosch-gallery-7.jpg"
    },
    {
      "id": "gallery-8",
      "alt": "Bosch office",
      "url": "/scraped-images/work-projects/bosch/bosch-gallery-8.jpg"
    }
  ]
};

/**
 * BOSCH Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function BoschProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="bosch"
      fallbackData={fallbackProjectData}
    />
  )
}