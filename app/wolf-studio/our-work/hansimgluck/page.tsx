'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "hansimgluck",
  "title": "HANS IM GLÜCK",
  "subtitle": "German Burger Grill in the heart of Orchard",
  "details": [
    {
      "label": "Size",
      "value": "4,000 sqft"
    },
    {
      "label": "Location",
      "value": "362 Orchard Rd Singapore"
    },
    {
      "label": "Scope",
      "value": "Design & Build"
    },
    {
      "label": "Year",
      "value": "2017"
    }
  ],
  "description": [
    "Hans Im Gluck from Germany needed to open their first Bar & Grill in Singapore, WOLF was tasked with the design and build of their first foray into Asia.",
    "Located within a rare freestanding pavilion right on Orchard Road, the Bar and Grill captures the brand and identity of the Restaurant from Germany, providing a unique dining and drinking experience amongst Birch Trees in a bright and airy lunchtime atmosphere and intimate mood in the evenings. WOLF worked closely with the Bespoke design team from Germany to ensure the project was successfully delivered within the aggressive timeline and to high European high standards."
  ],
  "bannerImage": "/scraped-images/work-projects/hansimgluck/hansimgluck-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "HANS IM GLÜCK Interior",
      "url": "/scraped-images/work-projects/hansimgluck/hansimgluck-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "HANS IM GLÜCK Dining Area",
      "url": "/scraped-images/work-projects/hansimgluck/hansimgluck-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "HANS IM GLÜCK Bar Area",
      "url": "/scraped-images/work-projects/hansimgluck/hansimgluck-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "HANS IM GLÜCK Design Detail",
      "url": "/scraped-images/work-projects/hansimgluck/hansimgluck-gallery-4.jpg"
    }
  ]
};

/**
 * HANS IM GLÜCK Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function HansimgluckProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="hansimgluck"
      fallbackData={fallbackProjectData}
    />
  )
}