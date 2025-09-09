'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "cbre",
  "title": "CBRE",
  "subtitle": "Global commercial real estate services",
  "details": [
    {
      "label": "Size",
      "value": "6,000 sqft"
    },
    {
      "label": "Location",
      "value": "6 Battery Road"
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
    "Wolf was engaged to design and build the new CBRE city office in Singapore, which involved a refresh and reconfiguration of the existing premises. The project was designed to complement and support the main head office located in Paya Lebar Quarter.",
    "The design emphasises a clear sense of organization, unity and openness that creates a work environment that is both refreshing and productive. The design of the activity-based space responds to the building's floor plan and provides a variety of work settings for either focused work or collaboration that ultimately flows into communal space."
  ],
  "bannerImage": "/scraped-images/work-projects/cbre/cbre-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "CBRE Office Interior",
      "url": "/scraped-images/work-projects/cbre/cbre-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "CBRE Workspace",
      "url": "/scraped-images/work-projects/cbre/cbre-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "CBRE Meeting Space",
      "url": "/scraped-images/work-projects/cbre/cbre-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "CBRE Collaboration Area",
      "url": "/scraped-images/work-projects/cbre/cbre-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "CBRE Reception Area",
      "url": "/scraped-images/work-projects/cbre/cbre-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "CBRE Office Design",
      "url": "/scraped-images/work-projects/cbre/cbre-gallery-6.jpg"
    },
    {
      "id": "gallery-7",
      "alt": "CBRE Work Environment",
      "url": "/scraped-images/work-projects/cbre/cbre-gallery-7.jpg"
    }
  ]
};

/**
 * CBRE Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function CbreProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="cbre"
      fallbackData={fallbackProjectData}
    />
  )
}