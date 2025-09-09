'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "hongkongmanagement",
  "title": "Management Consulting Firm",
  "subtitle": "Innovative, agile, and collaborative workspace",
  "details": [
    {
      "label": "Size",
      "value": "30,000 sqft"
    },
    {
      "label": "Location",
      "value": "Hong Kong"
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
    "This office interior design project is centered around the headquarters of our esteemed client in Hong Kong. The objective was to create an innovative, agile, and collaborative workspace for their consultants.",
    "The design incorporated elements of hospitality in the reception and café areas, ensuring a warm welcome to clients and employees alike. Additionally, a large town hall space within the café will be highly flexible, enabling diverse use, and the integration of unique, local Hong Kong-inspired murals throughout the office facilitated intuitive wayfinding."
  ],
  "keyFeatures": [
    "Hospitality-Inspired Reception and Café: The reception area features hospitality-inspired elements, offering a warm and inviting ambiance to visitors. The café serves as a multifunctional hub, fostering client interactions, casual meetings, and relaxation with a touch of hospitality.",
    "Flexible Town Hall Space: The café includes a large town hall space designed for high flexibility. This space is easily reconfigurable to host a variety of events, from company-wide meetings to training sessions and social gatherings.",
    "Local Hong Kong Inspiration: Unique, local Hong Kong-inspired murals are strategically placed throughout the office to reflect the city's culture, history, and vibrant energy. These murals not only add visual interest but also serve as wayfinding landmarks with unique color schemes that guide employees and guests.",
    "Employee Well-Being: A focus on the well-being of employees was integrated into the design with ergonomic furniture, access to natural light, and spaces for relaxation and rejuvenation."
  ],
  "bannerImage": "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Management Consulting Firm Hong Kong Office",
      "url": "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Management Consulting Firm Reception Area",
      "url": "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Management Consulting Firm Workspace",
      "url": "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Management Consulting Firm Collaborative Space",
      "url": "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "Management Consulting Firm Meeting Room",
      "url": "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "Management Consulting Firm Social Area",
      "url": "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-6.jpg"
    },
    {
      "id": "gallery-7",
      "alt": "Management Consulting Firm Office Design",
      "url": "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-7.jpg"
    },
    {
      "id": "gallery-8",
      "alt": "Management Consulting Firm Collaborative Area",
      "url": "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-8.jpg"
    },
    {
      "id": "gallery-9",
      "alt": "Management Consulting Firm Office Interior",
      "url": "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-9.jpg"
    },
    {
      "id": "gallery-10",
      "alt": "Management Consulting Firm Hong Kong Office Design",
      "url": "/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-10.jpg"
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
export default function HongkongmanagementProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="hongkongmanagement"
      fallbackData={fallbackProjectData}
    />
  )
}