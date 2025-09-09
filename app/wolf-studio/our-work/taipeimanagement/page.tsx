'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "taipeimanagement",
  "title": "Taipei Management",
  "subtitle": "Consulting firm",
  "details": [
    {
      "label": "Size",
      "value": "35,000 sqft"
    },
    {
      "label": "Location",
      "value": "Taipei, Taiwan"
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
    "This project created a modern workspace for a leading consulting firm in Taipei. The design focused on creating an environment that promotes collaboration while maintaining the professional aesthetic expected of a high-end consultancy.",
    "The key design challenge was balancing open, collaborative areas with private spaces needed for confidential client work. We implemented a mix of open plan workstations, enclosed meeting rooms, and flexible breakout areas to address these competing needs.",
    "Technology integration was paramount, with state-of-the-art video conferencing facilities and digital collaboration tools embedded throughout the space. The overall design reflects both the firm's global standards and elements of local Taiwanese design culture."
  ],
  "bannerImage": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Taipei Management Interior Design",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Taipei Management Workspace",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Taipei Management Collaborative Space",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Taipei Management Meeting Area",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "Taipei Management Office Space",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "Taipei Management Reception",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-6.jpg"
    },
    {
      "id": "gallery-7",
      "alt": "Taipei Management Lounge Area",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-7.jpg"
    },
    {
      "id": "gallery-8",
      "alt": "Taipei Management Work Environment",
      "url": "/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-8.jpg"
    }
  ]
};

/**
 * Taipei Management Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function TaipeimanagementProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="taipeimanagement"
      fallbackData={fallbackProjectData}
    />
  )
}