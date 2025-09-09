'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "zurichinsurance",
  "title": "ZURICH INSURANCE",
  "subtitle": "Clean modern and refreshing",
  "details": [
    {
      "label": "Size",
      "value": "13,000 sqft"
    },
    {
      "label": "Location",
      "value": "Singapore Land Tower"
    },
    {
      "label": "Scope",
      "value": "Design & Build"
    },
    {
      "label": "Year",
      "value": "2018"
    }
  ],
  "description": [
    "Wolf was engaged to transform the Zurich Insurance office in a Live working environment. The workplace was transformed over a series of phased weekend works to refresh the entire workplace.",
    "The project involved a total change in furniture and relocating the staff cafe to connect with the client reception and meeting room zone to create a single communal zone for all staff and visitors to come together. A flexible design for the boardroom meant the ability to create a large staff town-hall and client entertainment zone."
  ],
  "bannerImage": "/scraped-images/work-projects/zurichinsurance/zurichinsurance-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Zurich Insurance Office Interior",
      "url": "/scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Zurich Insurance Workspace",
      "url": "/scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Zurich Insurance Meeting Space",
      "url": "/scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Zurich Insurance Collaboration Area",
      "url": "/scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "Zurich Insurance Common Area",
      "url": "/scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "Zurich Insurance Reception",
      "url": "/scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-6.jpg"
    },
    {
      "id": "gallery-7",
      "alt": "Zurich Insurance Boardroom",
      "url": "/scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-7.jpg"
    }
  ]
};

/**
 * ZURICH INSURANCE Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function ZurichinsuranceProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="zurichinsurance"
      fallbackData={fallbackProjectData}
    />
  )
}