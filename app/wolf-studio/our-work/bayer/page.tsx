'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "bayer",
  "title": "Bayer (South East Asia) Pte Ltd",
  "subtitle": "Science for a better life. A Workplace for a better future.",
  "details": [
    {
      "label": "Size",
      "value": "32,000 sqft"
    },
    {
      "label": "Location",
      "value": "Paya Lebar Quarter"
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
    "Wolf was engaged to design and build the regional headquarters of Bayer in Paya Lebar Quarter 3 offering a full turn key service from design, project management, and construction.",
    "The approach was to create a bright and positive atmosphere that promotes a collaborative work environment utilizing best-in-class work spaces and technology that bring a warm sense of optimism and innovation.",
    "Vibrant colours taken from the Bayer brand palette were used as a way finding tool to identify different zones across the floor plate. Varying levels of collaborative and quiet zones were planned with an audio spectrum in mind, creating acoustically appropriate zones for different type of work."
  ],
  "bannerImage": "/scraped-images/work-projects/bayer/bayer-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "bayer reception",
      "url": "/scraped-images/work-projects/bayer/bayer-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "bayer cafe",
      "url": "/scraped-images/work-projects/bayer/bayer-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "bayer cafe",
      "url": "/scraped-images/work-projects/bayer/bayer-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "bayer office",
      "url": "/scraped-images/work-projects/bayer/bayer-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "bayer office",
      "url": "/scraped-images/work-projects/bayer/bayer-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "bayer office",
      "url": "/scraped-images/work-projects/bayer/bayer-gallery-6.jpg"
    },
    {
      "id": "gallery-7",
      "alt": "bayer office",
      "url": "/scraped-images/work-projects/bayer/bayer-gallery-7.jpg"
    },
    {
      "id": "gallery-8",
      "alt": "bayer office",
      "url": "/scraped-images/work-projects/bayer/bayer-gallery-8.jpg"
    }
  ]
};

/**
 * Bayer (South East Asia) Pte Ltd Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function BayerProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="bayer"
      fallbackData={fallbackProjectData}
    />
  )
}