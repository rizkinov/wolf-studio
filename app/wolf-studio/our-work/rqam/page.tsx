'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "rqam",
  "title": "RQAM",
  "subtitle": "Raffles Quay Asset Management workplace",
  "details": [
    {
      "label": "Size",
      "value": "8,000 sqft"
    },
    {
      "label": "Location",
      "value": "One Raffles Quay"
    },
    {
      "label": "Scope",
      "value": "Design consultancy"
    },
    {
      "label": "Year",
      "value": "2019"
    }
  ],
  "description": [
    "RQAM manages One Raffles Quay and Marina Bay Financial Centre and tasked Wolf to design a timeless, engaging and employee centric workplace that also showcased how their developments could facilitate best in class office spaces.",
    "The project is also Singapore's first to be certified under the new BCA Greenmark Scheme. Applying best practices in design, engineering and employee wellness the project achieved a platinum rating."
  ],
  "bannerImage": "/scraped-images/work-projects/rqam/rqam-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "RQAM office",
      "url": "/scraped-images/work-projects/rqam/rqam-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "RQAM office",
      "url": "/scraped-images/work-projects/rqam/rqam-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "RQAM office",
      "url": "/scraped-images/work-projects/rqam/rqam-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "RQAM office",
      "url": "/scraped-images/work-projects/rqam/rqam-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "RQAM office",
      "url": "/scraped-images/work-projects/rqam/rqam-gallery-5.jpg"
    }
  ]
};

/**
 * RQAM Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function RqamProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="rqam"
      fallbackData={fallbackProjectData}
    />
  )
}