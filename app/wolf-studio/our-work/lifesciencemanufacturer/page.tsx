'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "lifesciencemanufacturer",
  "title": "Life Science & Clinical Manufacturer",
  "subtitle": "Advancing Scientific Discovery and Improving Healthcare",
  "details": [
    {
      "label": "Size",
      "value": "10,000 sqft + 30,000sqft warehouse"
    },
    {
      "label": "Location",
      "value": "IBP @ ICON"
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
    "Wolf was engaged to design and build a new office, Lab and warehouse facility by a global leader in developing, manufacturing, and marketing of innovative products for the life science research and clinical diagnostic markets. The workplace design carried a clean and fresh aesthetic, exhuming a sense of precision that is synonymous with the company brand.",
    "The use of Light Oak timber, neutral tones, and soft patterns created a pleasant and calming place for work.",
    "Wolf extend our services to also design and build the new assembly/warehousing facility following the completion of the office."
  ],
  "bannerImage": "/scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Life Science & Clinical Manufacturer Office Interior",
      "url": "/scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Life Science & Clinical Manufacturer Workspace",
      "url": "/scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Life Science & Clinical Manufacturer Meeting Space",
      "url": "/scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Life Science & Clinical Manufacturer Collaboration Area",
      "url": "/scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "Life Science & Clinical Manufacturer Office Design",
      "url": "/scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "Life Science & Clinical Manufacturer Laboratory Space",
      "url": "/scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-6.jpg"
    }
  ]
};

/**
 * Life Science & Clinical Manufacturer Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function LifesciencemanufacturerProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="lifesciencemanufacturer"
      fallbackData={fallbackProjectData}
    />
  )
}