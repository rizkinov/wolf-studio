'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "emerson",
  "title": "Emerson",
  "subtitle": "An automation specialist",
  "details": [
    {
      "label": "Size",
      "value": "23,000 sqft"
    },
    {
      "label": "Location",
      "value": "1 Pandan Crescent"
    },
    {
      "label": "Scope",
      "value": "Design & build"
    },
    {
      "label": "Year",
      "value": "2018"
    }
  ],
  "description": [
    "Emerson engaged Wolf to design and build their new office in Pandan Crescent to create a fresh new workplace that provided a clean and bright environment that captured portrayed their brand in a modern and minimalist design approach."
  ],
  "bannerImage": "/scraped-images/work-projects/emerson/emerson-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Emerson office interior",
      "url": "/scraped-images/work-projects/emerson/emerson-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Emerson workspace",
      "url": "/scraped-images/work-projects/emerson/emerson-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Emerson meeting space",
      "url": "/scraped-images/work-projects/emerson/emerson-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Emerson office design",
      "url": "/scraped-images/work-projects/emerson/emerson-gallery-4.jpg"
    }
  ]
};

/**
 * Emerson Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function EmersonProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="emerson"
      fallbackData={fallbackProjectData}
    />
  )
}