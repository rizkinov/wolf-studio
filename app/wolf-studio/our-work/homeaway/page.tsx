'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "homeaway",
  "title": "HOMEAWAY",
  "subtitle": "A home away from home",
  "details": [
    {
      "label": "Size",
      "value": "6,000 sqft"
    },
    {
      "label": "Location",
      "value": "UE Square Level 18"
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
    "HomeAway is a vacation rental marketplace with more than 2,000,000 vacation rentals in 190 countries listed on its website. When tasked to design their new workplace in Singapore, WOLF captured the spirit of travel while capturing unique Singapore design touches to ensure that the office felt just as much of a destination as the places they share on their website."
  ],
  "bannerImage": "/scraped-images/work-projects/homeaway/homeaway-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Homeaway Office Space",
      "url": "/scraped-images/work-projects/homeaway/homeaway-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Homeaway Reception Area",
      "url": "/scraped-images/work-projects/homeaway/homeaway-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Homeaway Workspace",
      "url": "/scraped-images/work-projects/homeaway/homeaway-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Homeaway Meeting Room",
      "url": "/scraped-images/work-projects/homeaway/homeaway-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "Homeaway Collaborative Space",
      "url": "/scraped-images/work-projects/homeaway/homeaway-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "Homeaway Office Design",
      "url": "/scraped-images/work-projects/homeaway/homeaway-gallery-6.jpg"
    },
    {
      "id": "gallery-7",
      "alt": "Homeaway Interior Design",
      "url": "/scraped-images/work-projects/homeaway/homeaway-gallery-7.jpg"
    },
    {
      "id": "gallery-8",
      "alt": "Homeaway Breakout Space",
      "url": "/scraped-images/work-projects/homeaway/homeaway-gallery-8.jpg"
    },
    {
      "id": "gallery-9",
      "alt": "Homeaway Meeting Area",
      "url": "/scraped-images/work-projects/homeaway/homeaway-gallery-9.jpg"
    },
    {
      "id": "gallery-10",
      "alt": "Homeaway Office Interior",
      "url": "/scraped-images/work-projects/homeaway/homeaway-gallery-10.jpg"
    }
  ]
};

/**
 * HOMEAWAY Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function HomeawayProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="homeaway"
      fallbackData={fallbackProjectData}
    />
  )
}