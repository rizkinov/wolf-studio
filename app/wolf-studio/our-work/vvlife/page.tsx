'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "vvlife",
  "title": "VV LIFE",
  "subtitle": "A home for big data, blockchain and artificial intelligence",
  "details": [
    {
      "label": "Size",
      "value": "10,000 sqft"
    },
    {
      "label": "Location",
      "value": "Asia Square"
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
    "VV Life is a a tech company that is powered by leading technologies to connect merchants and consumers seamlessly with an array of lifestyle solutions. This Singapore office was part of the organisations first foray into Singapore with a warm and sleek workplace that provided platform for their teams to grow and innovate."
  ],
  "bannerImage": "/scraped-images/work-projects/vvlife/vvlife-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "VV Life Office Design",
      "url": "/scraped-images/work-projects/vvlife/vvlife-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "VV Life Workspace",
      "url": "/scraped-images/work-projects/vvlife/vvlife-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "VV Life Meeting Space",
      "url": "/scraped-images/work-projects/vvlife/vvlife-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "VV Life Collaboration Area",
      "url": "/scraped-images/work-projects/vvlife/vvlife-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "VV Life Reception",
      "url": "/scraped-images/work-projects/vvlife/vvlife-gallery-5.jpg"
    }
  ]
};

/**
 * VV LIFE Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function VvlifeProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="vvlife"
      fallbackData={fallbackProjectData}
    />
  )
}