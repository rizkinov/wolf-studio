'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "resources",
  "title": "Resources & Infrastructure client",
  "subtitle": "workplace concept design",
  "details": [
    {
      "label": "Size",
      "value": "20,000 sqft"
    },
    {
      "label": "Location",
      "value": "Shenton Way Building"
    },
    {
      "label": "Scope",
      "value": "Design consultancy"
    },
    {
      "label": "Year",
      "value": "2017"
    }
  ],
  "description": [
    "WOLF was engaged to develop a high level concept design for our client that captures a bold, modern, and professional outlook. The use of clean lines and contrasting finishes and tones the client and employee experience is carried through the entire workplace."
  ],
  "bannerImage": "/scraped-images/work-projects/resources/resources-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Sojitz boardroom",
      "url": "/scraped-images/work-projects/resources/resources-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Sojitz breakout",
      "url": "/scraped-images/work-projects/resources/resources-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Sojitz general area",
      "url": "/scraped-images/work-projects/resources/resources-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Sojitz executive office",
      "url": "/scraped-images/work-projects/resources/resources-gallery-4.jpg"
    }
  ]
};

/**
 * Resources & Infrastructure client Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function ResourcesProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="resources"
      fallbackData={fallbackProjectData}
    />
  )
}