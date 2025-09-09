'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "lufax",
  "title": "Lufax",
  "subtitle": "an edgy fintech workplace",
  "details": [
    {
      "label": "Size",
      "value": "3,500 sqft"
    },
    {
      "label": "Location",
      "value": "MBFC Tower 2 Level 13"
    },
    {
      "label": "Scope",
      "value": "Design & build"
    },
    {
      "label": "Year",
      "value": "2017"
    }
  ],
  "description": [
    "WOLF was engaged by LUFAX, one of China's giant fintech firms to design and build their first office in Singapore to serve as their new regional hub. The design through the use of materials, haptics and graphic imagery capture the spirit of Asia in a setting of a silicon valley inspired work environment designed to promote interaction and ideation."
  ],
  "bannerImage": "/scraped-images/work-projects/lufax/lufax-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Lufax Office Interior",
      "url": "/scraped-images/work-projects/lufax/lufax-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Lufax Office by Wolf studio",
      "url": "/scraped-images/work-projects/lufax/lufax-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Lufax Workspace",
      "url": "/scraped-images/work-projects/lufax/lufax-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Lufax Office Design by Wolf studio",
      "url": "/scraped-images/work-projects/lufax/lufax-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "Lufax Interior by Wolf studio",
      "url": "/scraped-images/work-projects/lufax/lufax-gallery-5.jpg"
    }
  ]
};

/**
 * Lufax Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function LufaxProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="lufax"
      fallbackData={fallbackProjectData}
    />
  )
}