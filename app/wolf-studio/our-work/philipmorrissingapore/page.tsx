'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "philipmorrissingapore",
  "title": "Philip Morris Singapore",
  "subtitle": "Delivering a Smoke-Free Future",
  "details": [
    {
      "label": "Size",
      "value": "24,000 sqft"
    },
    {
      "label": "Location",
      "value": "E-Centre @ Redhill"
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
    "When Wolf was engaged to design the the new Philip Morris office in Singapore, it was an opportunity to design a workplace that would be symbolic of the company's ongoing transformation to building a future on replacing cigarettes with smoke-free alternatives.",
    "The approach was to infuse natural materials, greenery, and a light refreshing design expression. The workplace was designed for both office based employees and sales staff that we on the road for the majority of each day. The solution was to create a flexible sales team zone that is configurable to create project and town hall based spaces when required.",
    "The open-plan office space is interspersed with informal areas and 'themed' meeting rooms with different configurations that offer users with more choice. The result is an impression of calm collaboration and creativity. A space that captures the spirit of the new brand with an expression of local Asian culture and the personalities of the people who make up the business."
  ],
  "bannerImage": "/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Philip Morris Singapore Office Design",
      "url": "/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Philip Morris Singapore Workspace",
      "url": "/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Philip Morris Singapore Meeting Area",
      "url": "/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Philip Morris Singapore Collaborative Space",
      "url": "/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "Philip Morris Singapore Common Area",
      "url": "/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "Philip Morris Singapore Client Area",
      "url": "/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-6.jpg"
    },
    {
      "id": "gallery-7",
      "alt": "Philip Morris Singapore Interior",
      "url": "/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-7.jpg"
    },
    {
      "id": "gallery-8",
      "alt": "Philip Morris Singapore Reception",
      "url": "/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-8.jpg"
    },
    {
      "id": "gallery-9",
      "alt": "Philip Morris Singapore Office Interior",
      "url": "/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-9.jpg"
    }
  ]
};

/**
 * Philip Morris Singapore Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function PhilipmorrissingaporeProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="philipmorrissingapore"
      fallbackData={fallbackProjectData}
    />
  )
}