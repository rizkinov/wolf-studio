'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "myp",
  "title": "MYP",
  "subtitle": "An SGX listed realestate investment company",
  "details": [
    {
      "label": "Size",
      "value": "5,000 sqft"
    },
    {
      "label": "Location",
      "value": "MYP Centre Level 9"
    },
    {
      "label": "Scope",
      "value": "Design & build"
    },
    {
      "label": "Year",
      "value": "2018"
    }
  ],
  "description": [
    "WOLF was engaged by MYP, an SGX mainboard listed company that invests in Realestate to relocate their headquarters to their new building in Battery Road.",
    "Inspired by a contoured design language and rich materials, the office exhumes a distinctive and strong presence. A custom laser cut feature wall was bespoke designed by Wolf to create wonderfully subtle yet detailed architectural feature."
  ],
  "bannerImage": "/scraped-images/work-projects/myp/myp-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "MYP reception",
      "url": "/scraped-images/work-projects/myp/myp-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "MYP OFFICE BOARDROOM",
      "url": "/scraped-images/work-projects/myp/myp-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "MYP OFFICE",
      "url": "/scraped-images/work-projects/myp/myp-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "MYP RECEPTION",
      "url": "/scraped-images/work-projects/myp/myp-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "MYP MEETING ROOM",
      "url": "/scraped-images/work-projects/myp/myp-gallery-5.jpg"
    }
  ]
};

/**
 * MYP Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function MypProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="myp"
      fallbackData={fallbackProjectData}
    />
  )
}