'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "thewolfden",
  "title": "The WOLF den",
  "subtitle": "Where great design happens",
  "details": [
    {
      "label": "Size",
      "value": "2,000 sqft"
    },
    {
      "label": "Location",
      "value": "Oxley Buzhub"
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
    "Our home, designed and built by the team at WOLF. It&apos;s an expression of who we are: Daring, edgy, and fun. We have a little piece of ourselves here and it&apos;s a home our team look forward to coming to each day."
  ],
  "bannerImage": "/scraped-images/work-projects/thewolfden/thewolfden-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "WOLF studio - interior view",
      "url": "/scraped-images/work-projects/thewolfden/thewolfden-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "WOLF studio - staircase detail",
      "url": "/scraped-images/work-projects/thewolfden/thewolfden-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "WOLF studio - mezzanine",
      "url": "/scraped-images/work-projects/thewolfden/thewolfden-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "WOLF studio - front door",
      "url": "/scraped-images/work-projects/thewolfden/thewolfden-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "WOLF studio - ceiling feature",
      "url": "/scraped-images/work-projects/thewolfden/thewolfden-gallery-5.jpg"
    }
  ]
};

/**
 * The WOLF den Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function ThewolfdenProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="thewolfden"
      fallbackData={fallbackProjectData}
    />
  )
}