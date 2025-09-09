'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "ricecommunications",
  "title": "Rice Communications",
  "subtitle": "A loft full of ideas",
  "details": [
    {
      "label": "Size",
      "value": "1,800 sqft"
    },
    {
      "label": "Location",
      "value": "Suntec Tower 4 Level 42"
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
    "With the opening of a new Asia-Pacific headquarters coupled with the agency's rebrand. Previously in Tanjong Pagar, the new digs reside at Haw Par Glass Tower in Dhoby Ghaut. Standing at approximately 5,000 sq ft (2.5 times bigger than the previous office) Rice's new home sports high ceilings, big windows with views of Fort Canning Park, and an open, airy feel with lots of space for people to work in comfort, both alone and collaboratively.",
    "Read more at: http://www.campaignasia.com/gallery/best-spaces-to-work-rice-singapore/442429"
  ],
  "bannerImage": "/scraped-images/work-projects/ricecommunications/ricecommunications-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Rice Singapore Office Interior",
      "url": "/scraped-images/work-projects/ricecommunications/ricecommunications-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Rice Singapore Workspace",
      "url": "/scraped-images/work-projects/ricecommunications/ricecommunications-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Rice Singapore Meeting Area",
      "url": "/scraped-images/work-projects/ricecommunications/ricecommunications-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Rice Singapore Collaborative Space",
      "url": "/scraped-images/work-projects/ricecommunications/ricecommunications-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "Rice Singapore Office Design",
      "url": "/scraped-images/work-projects/ricecommunications/ricecommunications-gallery-5.jpg"
    }
  ]
};

/**
 * Rice Communications Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function RicecommunicationsProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="ricecommunications"
      fallbackData={fallbackProjectData}
    />
  )
}