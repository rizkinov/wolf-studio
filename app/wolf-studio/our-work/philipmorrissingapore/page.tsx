import React from 'react'
import Link from 'next/link'
import { CBREButton } from '@/components/cbre-button'

export default function PhilipMorrisProjectPage() {
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
        {/* Hero Banner */}
        <div className="w-full h-[500px] relative overflow-hidden">
          <img 
            src="/scraped-images/work/philipmorrissingapore-banner.jpg" 
            alt="Philip Morris Singapore Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <h1 className="text-5xl font-bold mb-4">Philip Morris Singapore</h1>
              <p className="text-xl">Delivering a Smoke-Free Future</p>
            </div>
          </div>
        </div>

        {/* Project Info Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Project Description */}
              <div className="md:col-span-2">
                <h2 className="text-3xl font-bold mb-6">Project Overview</h2>
                <p className="text-lg mb-6">
                  When Wolf was engaged to design the new Philip Morris office in Singapore, it was an opportunity to design 
                  a workplace that would be symbolic of the company's ongoing transformation to building a future on replacing 
                  cigarettes with smoke-free alternatives.
                </p>
                <p className="text-lg mb-6">
                  The approach was to infuse natural materials, greenery, and a light refreshing design expression. The workplace was 
                  designed for both office based employees and sales staff that we on the road for the majority of each day. The solution was 
                  to create a flexible sales team zone that is configurable to create project and town hall based spaces when required.
                </p>
                <p className="text-lg mb-6">
                  The open-plan office space is interspersed with informal areas and 'themed' meeting rooms with different configurations 
                  that offer users with more choice. The result is an impression of calm collaboration and creativity. A space that captures 
                  the spirit of the new brand with an expression of local Asian culture and the personalities of the people who make up the business.
                </p>
              </div>

              {/* Project Details */}
              <div className="bg-gray-50 p-8 rounded-lg h-min">
                <h3 className="text-2xl font-semibold mb-6">Project Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="text-lg font-medium">24,000 sqft</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-lg font-medium">E-Centre @ Redhill</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Scope</p>
                    <p className="text-lg font-medium">Design Consultancy</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="text-lg font-medium">2019</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Project Gallery */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center">Project Gallery</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Main Images */}
              <div className="col-span-1 md:col-span-2 lg:col-span-2">
                <img 
                  src="/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-image-5.jpg" 
                  alt="Philip Morris Interior" 
                  className="w-full h-[400px] object-cover rounded-lg"
                />
              </div>
              <div>
                <img 
                  src="/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-image-6.jpg" 
                  alt="Philip Morris Interior" 
                  className="w-full h-[400px] object-cover rounded-lg"
                />
              </div>
              <div>
                <img 
                  src="/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-image-7.jpg" 
                  alt="Philip Morris Interior" 
                  className="w-full h-[400px] object-cover rounded-lg"
                />
              </div>
              <div className="col-span-1 md:col-span-2 lg:col-span-2">
                <img 
                  src="/scraped-images/work/philipmorrissingapore-banner.jpg" 
                  alt="Philip Morris Interior" 
                  className="w-full h-[400px] object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Back to Work */}
        <section className="py-16 text-center">
          <Link href="/wolf-studio/our-work">
            <CBREButton>Back to Our Work</CBREButton>
          </Link>
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