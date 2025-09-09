'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "dassaultsystemes",
  "title": "Dassault Systèmes",
  "subtitle": "The 3DEXPERIENCE Company",
  "details": [
    {
      "label": "Size",
      "value": "10,500 sqft"
    },
    {
      "label": "Location",
      "value": "Tampines Grande L6"
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
    "WOLF was engaged by Dassault Systèmes, a global leader in 3D software to design and build their Singapore Headquarters.",
    "The brief was to create a clean and minimalist design language to create a refreshing and precise environment for their staff to focus on creating virtual universes that drive the company's business."
  ],
  "bannerImage": "/scraped-images/work-projects/dassaultsystemes/dassaultsystemes-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Dassault Systèmes Office Interior",
      "url": "/scraped-images/work-projects/dassaultsystemes/dassaultsystemes-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Dassault Systèmes Workspace",
      "url": "/scraped-images/work-projects/dassaultsystemes/dassaultsystemes-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Dassault Systèmes Meeting Space",
      "url": "/scraped-images/work-projects/dassaultsystemes/dassaultsystemes-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Dassault Systèmes Collaboration Area",
      "url": "/scraped-images/work-projects/dassaultsystemes/dassaultsystemes-gallery-4.jpg"
    }
  ]
};

/**
 * Dassault Systèmes Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function DassaultsystemesProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="dassaultsystemes"
      fallbackData={fallbackProjectData}
    />
  )
}