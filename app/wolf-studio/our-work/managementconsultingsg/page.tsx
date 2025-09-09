'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "managementconsultingsg",
  "title": "Management Consulting SG",
  "subtitle": "Global Consultancy Headquarters",
  "details": [
    {
      "label": "Size",
      "value": "20,000 sqft"
    },
    {
      "label": "Location",
      "value": "Singapore"
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
    "WOLF was commissioned to design the Singapore headquarters for a global management consulting firm, creating a space that balances professionalism with innovation. The project aimed to reflect the firm's forward-thinking approach while providing a sophisticated environment for client interactions and collaborative work.",
    "Our design seamlessly integrates elements of Singaporean culture with the firm's global brand identity, creating a workspace that feels both locally relevant and internationally connected. The space serves as a powerful tool for talent attraction and retention in the competitive consulting sector."
  ],
  "keyThemes": [
    {
      "title": "Client-Centric Design",
      "description": "The front-of-house spaces were designed with client experience as the priority. A welcoming reception area transitions into versatile meeting spaces equipped with state-of-the-art presentation technology. Private client lounges provide discreet areas for sensitive discussions, while the showcase space highlights the firm's global achievements and methodology through interactive displays."
    },
    {
      "title": "Collaborative Ecosystem",
      "description": "Beyond the client-facing areas, the workspace is organized into neighborhoods that support different work modes. Project zones feature flexible furniture systems that can be reconfigured based on team size and project requirements. Digital collaboration tools are integrated throughout, enabling seamless connection with global teams. Casual collision spaces encourage spontaneous interaction and knowledge sharing among consultants."
    },
    {
      "title": "Wellness & Sustainability",
      "description": "Employee wellbeing was central to our approach, with biophilic elements incorporated throughout to reduce stress and improve cognitive function. The lighting design mimics natural daylight cycles, supporting healthy circadian rhythms despite long working hours. Sustainable materials with low environmental impact were selected, and energy-efficient systems were implemented to reduce the carbon footprint, aligning with the firm's global sustainability commitments."
    },
    {
      "title": "Brand Expression",
      "description": "The firm's brand identity is subtly woven into the architectural elements and material palette. Corporate colors appear as thoughtful accents rather than overwhelming statements. Local art and design elements reflect Singapore's unique cultural position as a global business hub while creating a sense of place. The overall aesthetic strikes a perfect balance between timeless professionalism and contemporary innovation."
    }
  ],
  "bannerImage": "/scraped-images/work-projects/managementconsultingsg/mcsg-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "Elegant reception area featuring natural materials and subtle brand integration",
      "url": "/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "Contemporary client meeting space with advanced presentation technology",
      "url": "/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "Collaborative work zone with flexible furniture arrangements and digital tools",
      "url": "/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "Private client lounge designed for confidential discussions",
      "url": "/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "Interactive showcase area highlighting the firm's global achievements",
      "url": "/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "Biophilic elements integrated into the workspace to enhance wellbeing",
      "url": "/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-6.jpg"
    },
    {
      "id": "gallery-7",
      "alt": "Staff café designed for both relaxation and informal collaboration",
      "url": "/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-7.jpg"
    }
  ]
};

/**
 * Management Consulting SG Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function ManagementconsultingsgProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="managementconsultingsg"
      fallbackData={fallbackProjectData}
    />
  )
}