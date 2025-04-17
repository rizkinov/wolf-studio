import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CBREButton } from '@/components/cbre-button'

const projects = [
  {
    id: 'ihh',
    title: 'IHH Healthcare',
    description: 'The project created a workplace without boundaries across two different locations at Bendemeer and Harbourfront, with unique design themes while maintaining a unified IHH identity.',
    bannerImage: '/scraped-images/work/ihh-banner.jpg',
    size: '60,000 sqft',
    location: 'Singapore',
    scope: 'Design Consultancy',
    year: '2023'
  },
  {
    id: 'managementconsultingsg',
    title: 'Management Consulting Firm',
    description: 'A piece of the sky - The client\'s new Singapore headquarters spans 60,000 sq ft, overlooking Singapore\'s Southern shoreline at 79 Robinson Road, symbolic of a people-centric workplace in a post-pandemic world.',
    bannerImage: '/scraped-images/work/managementconsultingsg-banner.jpg',
    size: '60,000 sqft',
    location: 'Singapore',
    scope: 'Design Consultancy',
    year: '2022'
  },
  {
    id: 'philipmorrissingapore',
    title: 'Philip Morris Singapore',
    description: 'Delivering a Smoke-Free Future - A workplace designed to symbolize the company\'s transformation to replacing cigarettes with smoke-free alternatives, featuring natural materials, greenery, and a refreshing design.',
    bannerImage: '/scraped-images/work/philipmorrissingapore-banner.jpg',
    size: '24,000 sqft',
    location: 'E-Centre @ Redhill',
    scope: 'Design Consultancy',
    year: '2019'
  }
];

export default function WorkPage() {
  return (
    <div className="flex flex-col min-h-screen">
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
            <Link href="/wolf-studio/#meet-the-pack" className="hover:text-gray-600">Meet the Pack</Link>
            <Link href="/wolf-studio/our-work" className="hover:text-gray-600 font-bold">Our Work</Link>
            <Link href="/wolf-studio/#what-we-offer" className="hover:text-gray-600">What We Offer</Link>
            <Link href="/wolf-studio/#our-hideout" className="hover:text-gray-600">Our Hideout</Link>
            <Link href="/wolf-studio/#social" className="hover:text-gray-600">Social</Link>
            <Link href="/wolf-studio/#get-in-touch" className="hover:text-gray-600">Get in Touch</Link>
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
        {/* Hero Section */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">Our Work</h1>
              <p className="text-xl leading-relaxed mb-8">
                We define ourselves by the work we produce and the relationships we build with our clients.
                It's the skills, care and knowledge we have learnt and the experiences we have gained throughout
                the years that play a part in what we do at WOLF.
              </p>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-16">
              {projects.map((project) => (
                <div key={project.id} className="project-card">
                  {/* Project Banner Image */}
                  <div className="relative w-full h-[400px] mb-6 overflow-hidden rounded-lg">
                    <img
                      src={project.bannerImage}
                      alt={`${project.title} banner`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Project Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                      <h2 className="text-3xl font-bold mb-4">{project.title}</h2>
                      <p className="text-lg mb-6">{project.description}</p>
                      <Link href={`/wolf-studio/our-work/${project.id}`}>
                        <CBREButton>View Project</CBREButton>
                      </Link>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4">Project Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Size</p>
                          <p className="font-medium">{project.size}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">{project.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Scope</p>
                          <p className="font-medium">{project.scope}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Year</p>
                          <p className="font-medium">{project.year}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 WOLF Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
} 