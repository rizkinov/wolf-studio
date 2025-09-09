'use client'

import React from 'react'
import { DynamicProjectPage } from '@/components/common/dynamic-project-page'

// Fallback project data - used if database fetch fails
const fallbackProjectData = {
  "id": "internationallawfirm",
  "title": "International Law Firm",
  "subtitle": "Transformative agile workspace",
  "details": [
    {
      "label": "Size",
      "value": "25,000 sqft"
    },
    {
      "label": "Location",
      "value": "Singapore"
    },
    {
      "label": "Scope",
      "value": "Design & Build"
    },
    {
      "label": "Year",
      "value": "2022"
    }
  ],
  "description": [
    "This top tier International Law Firm spanned across 25,000 square feet with a goal to transform and revolutionise the traditional legal industry's workspaces typology.",
    "Catering to approximately 200 staff members, the design encompasses a dynamic mix of private rooms, shared workspaces, team-based areas, open work cafes, and collaborative zones."
  ],
  "objectives": [
    "Revitalize the Workspace: Create a fresh and invigorating environment that rekindles the enthusiasm of lawyers for office work.",
    "Enhance Work Efficiency: Provide attorneys with the tools and spaces required to excel in their professional endeavors.",
    "Professional Excellence: Craft an atmosphere that reflects the ethos of a top-tier law firm, characterized by professionalism, sophistication, and impeccable service.",
    "Comfort and Assurance: Infuse soft hospitality touches into the design to cultivate a sense of comfort and assurance among staff and visitors.",
    "Local Inspiration: Develop a warm and inviting Singaporean-inspired café adjacent to the reception, welcoming both internal stakeholders and external guests."
  ],
  "designConcept": [
    "Flexible Workspace Design: Emphasis on unassigned workspaces to foster collaboration, innovation, and adaptability.",
    "Private Rooms: Offering secluded, focused workspaces for lawyers requiring confidentiality and concentration.",
    "Shared Rooms: Encouraging interaction and knowledge sharing among legal teams.",
    "Team-Based Rooms: Facilitating group work and cross-functional collaboration among lawyers.",
    "Open Work Cafe: A central hub for networking and informal meetings, complete with comfortable seating and state-of-the-art technology.",
    "Collaboration Areas: Strategically placed zones for brainstorming, meetings, and group discussions.",
    "Singaporean-Inspired Cafe: A warm and welcoming café designed with Singaporean motifs, serving as a delightful gathering spot and a testament to the firm's local presence."
  ],
  "bannerImage": "/scraped-images/work-projects/internationallawfirm/internationallawfirm-banner.jpg",
  "galleryImages": [
    {
      "id": "gallery-1",
      "alt": "International Law Firm",
      "url": "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-1.jpg"
    },
    {
      "id": "gallery-2",
      "alt": "International Law Firm",
      "url": "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-2.jpg"
    },
    {
      "id": "gallery-3",
      "alt": "International Law Firm",
      "url": "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-3.jpg"
    },
    {
      "id": "gallery-4",
      "alt": "International Law Firm",
      "url": "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-4.jpg"
    },
    {
      "id": "gallery-5",
      "alt": "International Law Firm",
      "url": "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-5.jpg"
    },
    {
      "id": "gallery-6",
      "alt": "International Law Firm",
      "url": "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-6.jpg"
    },
    {
      "id": "gallery-7",
      "alt": "International Law Firm",
      "url": "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-7.jpg"
    },
    {
      "id": "gallery-8",
      "alt": "International Law Firm",
      "url": "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-8.jpg"
    },
    {
      "id": "gallery-9",
      "alt": "International Law Firm",
      "url": "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-9.jpg"
    }
  ]
};

/**
 * International Law Firm Project Page
 * 
 * This page now uses the DynamicProjectPage component which:
 * 1. Fetches data from the database first (reflects admin changes)
 * 2. Falls back to static data if database fetch fails
 * 3. Maintains the same visual design and functionality
 */
export default function InternationallawfirmProjectPage() {
  return (
    <DynamicProjectPage 
      projectSlug="internationallawfirm"
      fallbackData={fallbackProjectData}
    />
  )
}