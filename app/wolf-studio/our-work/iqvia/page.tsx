'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "iqvia",
  "title": "Public Health IT & Clinical Research Organisation",
  "subtitle": "Let&apos;s do better, together.",
  "details": [
    {
      "label": "Size",
      "value": "50,000 sqft"
    },
    {
      "label": "Location",
      "value": "79 Anson Rd"
    },
    {
      "label": "Scope",
      "value": "Design Consultancy"
    },
    {
      "label": "Year",
      "value": "2019"
    }
  ],
  "description": [
    "A consolidation of 2 entities to form a new publicly listed company in the US paved the way for a new workplace designed by Wolf to usher in a new era for both organisations. The workplace is designed as a fully agile activity based working environment, providing a variety of work cafes, touchdown, and team-based neighbourhoods thought out each floor. Each Neighbourhood was designed as a self sustainable space for teams to work individually and collaboratively.",
    "The project was delivered on a limited capex, challenging the designer to utilise creative and innovative ways to create special experiences in functional spaces."
  ],
  "bannerImage": "/scraped-images/work-projects/iqvia/iqvia-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "IQVIA Office Interior",
      "url": "/scraped-images/work-projects/iqvia/iqvia-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "IQVIA Workspace",
      "url": "/scraped-images/work-projects/iqvia/iqvia-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "IQVIA Meeting Space",
      "url": "/scraped-images/work-projects/iqvia/iqvia-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "IQVIA Collaboration Area",
      "url": "/scraped-images/work-projects/iqvia/iqvia-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "IQVIA Work Cafe",
      "url": "/scraped-images/work-projects/iqvia/iqvia-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "IQVIA Neighborhood Area",
      "url": "/scraped-images/work-projects/iqvia/iqvia-gallery-6.jpg"
    },
    {
      "id": "gallery-7",
      "alt": "IQVIA Office Design",
      "url": "/scraped-images/work-projects/iqvia/iqvia-gallery-7.jpg"
    },
    {
      "id": "gallery-8",
      "alt": "IQVIA Creative Space",
      "url": "/scraped-images/work-projects/iqvia/iqvia-gallery-8.jpg"
    },
    {
      "id": "gallery-9",
      "alt": "IQVIA Reception Area",
      "url": "/scraped-images/work-projects/iqvia/iqvia-gallery-9.jpg"
    },
    {
      "id": "gallery-10",
      "alt": "IQVIA Team Space",
      "url": "/scraped-images/work-projects/iqvia/iqvia-gallery-10.jpg"
    }
  ]
};

/**
 * Public Health IT & Clinical Research Organisation Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function IqviaProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="iqvia"
      fallbackData={fallbackProjectData}
    />
  )
}