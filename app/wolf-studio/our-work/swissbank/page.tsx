'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "swissbank",
  "title": "Swiss Bank",
  "subtitle": "Understated Elegance - Swiss tradition with Asian soul",
  "details": [
    {
      "label": "Size",
      "value": "380,000 sqft"
    },
    {
      "label": "Location",
      "value": "Singapore"
    },
    {
      "label": "Scope",
      "value": "Design Consultancy"
    },
    {
      "label": "Year",
      "value": "2022"
    }
  ],
  "description": [
    "This project for a large Swiss Bank in Singapore consolidated over 3000 staff in wealth management, investment bank and asset management together within an entire building designed by Wolf.",
    "Outfitted with innovative future workplace concepts and customized health and well-being facilities, this 381,000 square foot state-of-the-art facility defined new ways of working for the organisation.",
    "Client suite, full scale kitchen, auditoriums, university, gymnasium, and recording studio are some of the unique offerings this project incorporated."
  ],
  "bannerImage": "/scraped-images/work-projects/swissbank/swissbank-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Swiss Bank Interior Design",
      "url": "/scraped-images/work-projects/swissbank/swissbank-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Swiss Bank Workspace",
      "url": "/scraped-images/work-projects/swissbank/swissbank-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Swiss Bank Meeting Room",
      "url": "/scraped-images/work-projects/swissbank/swissbank-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Swiss Bank Client Area",
      "url": "/scraped-images/work-projects/swissbank/swissbank-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "Swiss Bank Reception",
      "url": "/scraped-images/work-projects/swissbank/swissbank-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "Swiss Bank Executive Office",
      "url": "/scraped-images/work-projects/swissbank/swissbank-gallery-6.jpg"
    },
    {
      "id": "gallery-7",
      "alt": "Swiss Bank Lounge",
      "url": "/scraped-images/work-projects/swissbank/swissbank-gallery-7.jpg"
    },
    {
      "id": "gallery-8",
      "alt": "Swiss Bank Collaboration Space",
      "url": "/scraped-images/work-projects/swissbank/swissbank-gallery-8.jpg"
    },
    {
      "id": "gallery-9",
      "alt": "Swiss Bank Dining Area",
      "url": "/scraped-images/work-projects/swissbank/swissbank-gallery-9.jpg"
    },
    {
      "id": "gallery-10",
      "alt": "Swiss Bank Feature Space",
      "url": "/scraped-images/work-projects/swissbank/swissbank-gallery-10.jpg"
    }
  ]
};

/**
 * Swiss Bank Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function SwissbankProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="swissbank"
      fallbackData={fallbackProjectData}
    />
  )
}