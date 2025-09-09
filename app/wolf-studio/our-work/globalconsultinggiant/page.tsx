'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "globalconsultinggiant",
  "title": "Global Management Consulting and Professional Services Firm",
  "subtitle": "A tapestry of local inspiration",
  "details": [
    {
      "label": "Size",
      "value": "52,000 sqft"
    },
    {
      "label": "Location",
      "value": "Kuala Lumpur Malaysia"
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
    "A global giant in the industry, Wolf was tasked to design across 2 sites in Malaysia concurrently and deliver a creative and inspiring working environment for otherwise traditional delivery center. The result, a rich tapestry of finishes and features that embraces local culture and provides a fun and creative place to work."
  ],
  "bannerImage": "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Global Consulting Firm Office Interior",
      "url": "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Global Consulting Firm Workspace",
      "url": "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Global Consulting Firm Meeting Space",
      "url": "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Global Consulting Firm Collaboration Area",
      "url": "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "Global Consulting Firm Common Area",
      "url": "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "Global Consulting Firm Design Features",
      "url": "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-6.jpg"
    },
    {
      "id": "gallery-7",
      "alt": "Global Consulting Firm Office Design",
      "url": "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-7.jpg"
    },
    {
      "id": "gallery-8",
      "alt": "Global Consulting Firm Creative Space",
      "url": "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-8.jpg"
    },
    {
      "id": "gallery-9",
      "alt": "Global Consulting Firm Reception Area",
      "url": "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-9.jpg"
    },
    {
      "id": "gallery-10",
      "alt": "Global Consulting Firm Workspace Design",
      "url": "/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-10.jpg"
    }
  ]
};

/**
 * Global Management Consulting and Professional Services Firm Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function GlobalconsultinggiantProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="globalconsultinggiant"
      fallbackData={fallbackProjectData}
    />
  )
}