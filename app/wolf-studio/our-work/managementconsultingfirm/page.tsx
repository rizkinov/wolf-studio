'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "managementconsultingfirm",
  "title": "Management Consulting Firm",
  "subtitle": "Taipei Office",
  "details": [
    {
      "label": "Size",
      "value": "20,000 sqft"
    },
    {
      "label": "Location",
      "value": "Taipei"
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
    "This office interior design project created a modern, open workspace with a deep appreciation for Taiwanese culture and a client-centric approach. It was designed as a haven of calmness and productivity, fostering a sense of belonging and well-being among employees while offering a touch of luxury and tranquility in client areas."
  ],
  "bannerImage": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Management Consulting Firm Taiwan Office",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Management Consulting Firm Taiwan Workspace",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Management Consulting Firm Taiwan Collaboration Area",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Management Consulting Firm Taiwan Panoramic View",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "Management Consulting Firm Taiwan Meeting Area",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "Management Consulting Firm Taiwan Reception",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-6.jpg"
    },
    {
      "id": "gallery-7",
      "alt": "Management Consulting Firm Taiwan Client Area",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-7.jpg"
    },
    {
      "id": "gallery-8",
      "alt": "Management Consulting Firm Taiwan Interior",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-8.jpg"
    },
    {
      "id": "gallery-9",
      "alt": "Management Consulting Firm Taiwan Workspace",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-9.jpg"
    },
    {
      "id": "gallery-10",
      "alt": "Management Consulting Firm Taiwan Design Detail",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-10.jpg"
    }
  ]
};

/**
 * Management Consulting Firm Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function ManagementconsultingfirmProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="managementconsultingfirm"
      fallbackData={fallbackProjectData}
    />
  )
}