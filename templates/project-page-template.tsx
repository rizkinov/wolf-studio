'use client';

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CBREButton } from '@/components/cbre/cbre-button'
import { CBREStyledCard } from '@/components/cbre/cbre-styled-card'

/**
 * Project Page Template - Wolf Studio
 * 
 * Instructions:
 * 1. Copy this file to app/wolf-studio/our-work/[project-id]/page.tsx
 * 2. Replace [project-id] with your actual project ID
 * 3. Update the projectData object with your project information
 * 4. Add your project to data/projects.ts following the same format
 * 5. Add images to public/scraped-images/work-projects/[project-id]/
 *    following the naming convention: [project-id]-banner.jpg and [project-id]-gallery-1.jpg, etc.
 */

// Project data structure - replace with your project's information
const projectData = {
  // Basic project information
  id: "project-id", // Replace with your project ID
  title: "PROJECT TITLE", // Replace with your project title (ALL CAPS)
  subtitle: "Project Subtitle", // Replace with your project subtitle
  
  // Project metadata - customize as needed
  details: [
    { label: "Size", value: "X,XXX sqft" },
    { label: "Location", value: "City, Country" },
    { label: "Scope", value: "Design & Build" }, // Or other scope
    { label: "Year", value: "202X" }
  ],
  
  // Project description - add paragraphs as needed
  description: [
    "First paragraph of your project description goes here.",
    "Second paragraph with more details about the project.",
    "Additional paragraphs as needed to fully describe the project."
  ],
  
  // Banner image - follow naming convention
  bannerImage: "/scraped-images/work-projects/project-id/project-id-banner.jpg", // Replace project-id with your project ID
  
  // Gallery images - add as many as needed
  galleryImages: [
    { 
      id: "gallery-1", 
      alt: "Descriptive alt text for image 1",
      url: "/scraped-images/work-projects/project-id/project-id-gallery-1.jpg" // Replace project-id with your project ID
    },
    { 
      id: "gallery-2", 
      alt: "Descriptive alt text for image 2",
      url: "/scraped-images/work-projects/project-id/project-id-gallery-2.jpg" // Replace project-id with your project ID
    },
    // Add more gallery images as needed following the same pattern
  ]
};

/**
 * ProjectPage Component
 */
export default function ProjectPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation Menu */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/wolf-studio">
              <div className="h-12">
                <img 
                  src="/wolf-studio-logo-head.svg" 
                  alt="WOLF Studio Logo" 
                  className="h-full"
                />
              </div>
            </Link>
          </div>
          <div className="hidden md:flex space-x-6">
            <Link href="/wolf-studio/#meet-the-pack" className="hover:text-cbre-green">Meet the Pack</Link>
            <Link href="/wolf-studio/our-work" className="text-cbre-green font-medium">Our Work</Link>
            <Link href="/wolf-studio/#what-we-offer" className="hover:text-cbre-green">What We Offer</Link>
            <Link href="/wolf-studio/#our-hideout" className="hover:text-cbre-green">Our Hideout</Link>
            <Link href="/wolf-studio/#social" className="hover:text-cbre-green">Social</Link>
            <Link href="/wolf-studio/#get-in-touch" className="hover:text-cbre-green">Get in Touch</Link>
          </div>
          <div className="md:hidden">
            <button className="focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Banner */}
        <div className="w-full h-[45vh] relative overflow-hidden border-b border-gray-100">
          <img 
            src={projectData.bannerImage} 
            alt={`${projectData.title} Banner`} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Title Section */}
        <div className="pt-8 pb-4 max-w-3xl mx-auto px-6">
          {projectData.subtitle && (
            <h6 className="text-sm uppercase mb-2 tracking-wider font-medium text-[#333333] font-calibre">{projectData.subtitle}</h6>
          )}
          <h1 className="text-5xl font-financier font-bold text-dark-grey">{projectData.title}</h1>
        </div>

        {/* Project Info Section */}
        <section className="py-12 max-w-3xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Project Description */}
            <div className="md:w-2/3">
              {projectData.description.map((paragraph, index) => (
                <p key={index} className="text-base mb-6 leading-relaxed text-dark-grey">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Project Details */}
            <div className="md:w-1/3">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Project Details</h3>
                <div className="grid grid-cols-1 gap-4">
                  {projectData.details.map((detail, index) => (
                    <div key={index}>
                      <p className="text-sm text-gray-500">{detail.label}</p>
                      <p className="font-financier text-lg">{detail.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Project Gallery */}
        <section className="py-10 max-w-3xl mx-auto px-6">
          <div className="flex flex-col space-y-5">
            {projectData.galleryImages.map((image, index) => (
              <div key={image.id} className="overflow-hidden w-full border border-gray-100 shadow-sm">
                <img 
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-[350px] object-cover"
                />
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/wolf-studio/our-work">
              <CBREButton variant="view-more">
                Back to work
              </CBREButton>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#012A2D] py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-[rgb(230,232,233)]">© 2025 WOLF Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
} 