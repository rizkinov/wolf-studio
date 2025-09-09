'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "goodpack",
  "title": "Goodpack",
  "subtitle": "A hybrid office & warehouse showcase of supply chain solutions",
  "details": [
    {
      "label": "Size",
      "value": "20,000 sqft"
    },
    {
      "label": "Location",
      "value": "Changi South Street"
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
    "A home grown logistics solution provider, Goodpack tasked Wolf to design a new Singapore headquarters and warehouse demo showcase in and industrial building in Changi. The project involved a co-creation space linked with warehouse demo zone to innovate and incubate new initiatives. The activity based workplace provided their staff a variety of work settings and a central cafe for lunch and learn sessions."
  ],
  "bannerImage": "/scraped-images/work-projects/goodpack/goodpack-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Goodpack office",
      "url": "/scraped-images/work-projects/goodpack/goodpack-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Goodpack office",
      "url": "/scraped-images/work-projects/goodpack/goodpack-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Goodpack office",
      "url": "/scraped-images/work-projects/goodpack/goodpack-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Goodpack office",
      "url": "/scraped-images/work-projects/goodpack/goodpack-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "Goodpack office",
      "url": "/scraped-images/work-projects/goodpack/goodpack-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "Goodpack office",
      "url": "/scraped-images/work-projects/goodpack/goodpack-gallery-6.jpg"
    },
    {
      "id": "gallery-7",
      "alt": "Goodpack office",
      "url": "/scraped-images/work-projects/goodpack/goodpack-gallery-7.jpg"
    }
  ]
};

/**
 * Goodpack Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function GoodpackProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="goodpack"
      fallbackData={fallbackProjectData}
    />
  )
}