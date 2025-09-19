'use client';

import React, { useState, useEffect } from 'react'
import { CBREButton } from '@/components/cbre/cbre-button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { CBRECard } from '@/components/cbre/cbre-card'
import { ProjectGrid } from '@/components/common/ProjectGrid'
import { ProjectFilter } from '@/components/common/ProjectFilter'
import { Project } from '@/lib/types/project'
import { ColdStartFallback, useColdStartHandler } from '@/components/common/cold-start-fallback'

export default function WolfStudioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { error, handleError, retry, reset } = useColdStartHandler();

  // Smooth scroll function
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Fetch projects
  useEffect(() => {
    async function fetchProjects() {
      try {
        reset() // Clear any previous errors
        
        // Import projects data
        const { projectsData } = await import('@/data/projects');
        const sortedProjects = [...projectsData].sort((a, b) => a.order - b.order);
        
        // Get unique categories
        const uniqueCategories = [...new Set(sortedProjects.map(project => project.category || ''))].filter(Boolean);
        
        setProjects(sortedProjects);
        setFilteredProjects(sortedProjects);
        setCategories(uniqueCategories);
        setIsLoading(false);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch projects');
        console.error('Failed to fetch projects:', error);
        handleError(error);
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, []); // Empty dependency array since handleError and reset are now memoized

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    
    if (category === 'all') {
      setFilteredProjects(projects);
    } else {
      // Filter projects by category
      const filtered = projects.filter(project => 
        project.category === category
      );
      setFilteredProjects(filtered);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Menu */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            {/* Logo */}
            <div className="h-12">
              <img 
                src="/wolf-studio-logo-head.svg" 
                alt="WOLF Studio Logo" 
                className="h-full"
              />
            </div>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#meet-the-pack" onClick={(e) => handleNavClick(e, 'meet-the-pack')} className="hover:text-gray-600 cursor-pointer">Meet the Pack</a>
            <a href="#our-work" onClick={(e) => handleNavClick(e, 'our-work')} className="hover:text-gray-600 cursor-pointer">Our Work</a>
            <a href="#what-we-offer" onClick={(e) => handleNavClick(e, 'what-we-offer')} className="hover:text-gray-600 cursor-pointer">What We Offer</a>
            <a href="#our-hideout" onClick={(e) => handleNavClick(e, 'our-hideout')} className="hover:text-gray-600 cursor-pointer">Our Hideout</a>
            <a href="#social" onClick={(e) => handleNavClick(e, 'social')} className="hover:text-gray-600 cursor-pointer">Social</a>
            <a href="#get-in-touch" onClick={(e) => handleNavClick(e, 'get-in-touch')} className="hover:text-gray-600 cursor-pointer">Get in Touch</a>
          </div>
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-md py-4 z-40">
            <div className="container mx-auto px-4 flex flex-col space-y-4">
              <a href="#meet-the-pack" onClick={(e) => handleNavClick(e, 'meet-the-pack')} className="block hover:text-gray-600 cursor-pointer">Meet the Pack</a>
              <a href="#our-work" onClick={(e) => handleNavClick(e, 'our-work')} className="block hover:text-gray-600 cursor-pointer">Our Work</a>
              <a href="#what-we-offer" onClick={(e) => handleNavClick(e, 'what-we-offer')} className="block hover:text-gray-600 cursor-pointer">What We Offer</a>
              <a href="#our-hideout" onClick={(e) => handleNavClick(e, 'our-hideout')} className="block hover:text-gray-600 cursor-pointer">Our Hideout</a>
              <a href="#social" onClick={(e) => handleNavClick(e, 'social')} className="block hover:text-gray-600 cursor-pointer">Social</a>
              <a href="#get-in-touch" onClick={(e) => handleNavClick(e, 'get-in-touch')} className="block hover:text-gray-600 cursor-pointer">Get in Touch</a>
            </div>
          </div>
        )}
      </header>

      {/* Full-width Banner */}
      <div className="w-full h-[500px] relative overflow-hidden">
        <img 
          src="/banner.jpg" 
          alt="WOLF Studio Banner" 
          className="w-full h-full object-cover"
        />
        {/* Overlay Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/10 absolute inset-0"></div>
          <img 
            src="/wolf-studio-logo.svg" 
            alt="WOLF Studio" 
            className="w-1/2 md:w-1/2 lg:w-1/3 max-w-[500px] z-10 mt-32"
          />
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8">We Believe</h2>
            <p className="text-xl leading-relaxed mb-12">
              Here at WOLF, we stand firm for what we believe in - 
              a world where everyone loves going to work. 
              Every project is an opportunity for us to do our part in transforming offices 
              into places that bring joy and fulfilment to people at work; 
              this in turn help organisations grow. 
              It is our calling to design great workplaces while 
              making the journey for our clients delightful and rewarding.
            </p>
            <a href="#meet-the-pack" onClick={(e) => handleNavClick(e, 'meet-the-pack')}>
              <CBREButton>Meet the Pack</CBREButton>
            </a>
          </div>
        </div>
      </section>

      {/* Meet the Pack Section */}
      <section id="meet-the-pack" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-8 text-center">Meet the Pack</h2>
          <p className="text-xl mb-12 text-center max-w-4xl mx-auto">
            We share one belief and we are driven by the idea that great work is born from passion, diligence and fun.
          </p>
          
          {/* Photo collage layout with proper aspect ratios and scaled down size */}
          <div className="max-w-4xl mx-auto mb-12">
            {/* First row */}
            <div className="flex flex-col md:flex-row gap-2 mb-2">
              {/* Top-left (pool party) – 512 x 768 (portrait) */}
              <div className="w-full md:w-[40%] relative" style={{ height: '320px' }}>
                <div className="h-full w-full overflow-hidden">
                  <img 
                    src="/scraped-images/team/meet-the-pack-1.jpg" 
                    alt="WOLF Studio Team Pool Party" 
                    className="h-full w-full object-cover"
                    style={{ maxWidth: '100%', objectPosition: 'center' }}
                  />
                </div>
              </div>
              
              {/* Top-right (office celebration) – 768 x 512 (landscape) */}
              <div className="w-full md:w-[60%] relative" style={{ height: '320px' }}>
                <div className="h-full w-full overflow-hidden">
                  <img 
                    src="/scraped-images/team/meet-the-pack-2.jpg" 
                    alt="WOLF Studio Office Celebration"
                    className="h-full w-full object-cover"
                    style={{ maxWidth: '100%', objectPosition: 'center' }}
                  />
                </div>
              </div>
            </div>
            
            {/* Second row */}
            <div className="flex flex-col md:flex-row gap-2 mb-2">
              {/* Middle-left (snow trip group photo) – 768 x 512 (landscape) */}
              <div className="w-full md:w-[60%] relative" style={{ height: '320px' }}>
                <div className="h-full w-full overflow-hidden">
                  <img 
                    src="/scraped-images/team/meet-the-pack-3.jpg" 
                    alt="WOLF Studio Snow Trip Group"
                    className="h-full w-full object-cover"
                    style={{ maxWidth: '100%', objectPosition: 'center' }}
                  />
                </div>
              </div>
              
              {/* Middle-right (boxing training) – 512 x 768 (portrait) */}
              <div className="w-full md:w-[40%] relative" style={{ height: '320px' }}>
                <div className="h-full w-full overflow-hidden">
                  <img 
                    src="/scraped-images/team/meet-the-pack-4.jpg" 
                    alt="WOLF Studio Boxing Training"
                    className="h-full w-full object-cover"
                    style={{ maxWidth: '100%', objectPosition: 'center' }}
                  />
                </div>
              </div>
            </div>
            
            {/* Third row */}
            <div className="flex flex-col md:flex-row gap-2">
              {/* Bottom-left (group posing by mural) – 512 x 768 (portrait) */}
              <div className="w-full md:w-[40%] relative" style={{ height: '320px' }}>
                <div className="h-full w-full overflow-hidden">
                  <img 
                    src="/scraped-images/team/meet-the-pack-5.jpg" 
                    alt="WOLF Studio Group by Mural"
                    className="h-full w-full object-cover"
                    style={{ maxWidth: '100%', objectPosition: 'center' }}
                  />
                </div>
              </div>
              
              {/* Bottom-right (dragon boat team photo) – 768 x 512 (landscape) */}
              <div className="w-full md:w-[60%] relative" style={{ height: '320px' }}>
                <div className="h-full w-full overflow-hidden">
                  <img 
                    src="/scraped-images/team/meet-the-pack-6.jpg" 
                    alt="WOLF Studio Dragon Boat Team"
                    className="h-full w-full object-cover"
                    style={{ maxWidth: '100%', objectPosition: 'center' }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold mb-8 text-center">Our Second Singapore Studio & CBRE Offering</h3>
          
          {/* Video Embed */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://cbre.qumucloud.com/view/HNqYZIv46FEanvMoZH5NPj/"
                className="w-full h-full border-none"
                title="CBRE WOLF Studio Video"
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto mt-16">
            <h3 className="text-2xl font-bold mb-12 text-center">A Bit About Us</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <CBRECard className="text-center p-8">
                <h4 className="text-6xl font-bold mb-2">75+</h4>
                <p>Years of collective workplace design experience</p>
              </CBRECard>
              
              <CBRECard className="text-center p-8">
                <h4 className="text-6xl font-bold mb-2">10M+</h4>
                <p>Square feet of office space over the last 10 years</p>
              </CBRECard>
              
              <CBRECard className="text-center p-8">
                <h4 className="text-6xl font-bold mb-2">750+</h4>
                <p>Various client projects over the last 10 years</p>
              </CBRECard>
              
              <CBRECard className="text-center p-8">
                <h4 className="text-6xl font-bold mb-2">ONE</h4>
                <p>Team to change the world one office at a time</p>
              </CBRECard>
            </div>
          </div>
        </div>
      </section>

      {/* Our Work Section */}
      <section id="our-work" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-8 text-center">Our Work</h2>
          <p className="text-xl mb-12 text-center max-w-4xl mx-auto">
            We define ourselves by the work we produce and the relationships we build with our clients.
            It&apos;s the skills, care and knowledge we have learnt and the experiences we have gained throughout
            the years that play a part in what we do at WOLF.
          </p>
          
          {/* Project Filtering - HIDDEN FOR NOW */}
          {/* <div className="mb-8">
            <ProjectFilter 
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div> */}
          
          {/* Project Grid Component */}
          <div className="mb-12">
            {error ? (
              <ColdStartFallback 
                error={error} 
                reset={retry} 
                context="projects"
                retryDelay={3000}
              />
            ) : isLoading ? (
              <div className="text-center py-12">Loading projects...</div>
            ) : (
              <ProjectGrid 
                projects={projects} 
                columns={{
                  mobile: 1,
                  tablet: 2,
                  desktop: 3,
                  widescreen: 4
                }}
              />
            )}
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section id="what-we-offer" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8 text-center">What We Offer</h3>
          <p className="text-xl mb-12 text-center max-w-4xl mx-auto">
            We offer a range of service that we deliver as a promise to our clients. 
            Regardless of the scope of work, we make sure the design process is enjoyable, simple and successful for all our clients
          </p>
          
          <Accordion type="multiple" className="max-w-3xl mx-auto">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-xl font-medium py-4">Design Consultancy</AccordionTrigger>
              <AccordionContent>
                <p className="p-6 text-lg">We provide expert design consultancy services to help transform your workspace into an environment that inspires creativity and productivity.</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-xl font-medium py-4">Design & Build</AccordionTrigger>
              <AccordionContent>
                <p className="p-6 text-lg">Our comprehensive design and build services take your project from concept to completion with a seamless process.</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-xl font-medium py-4">Feasibility Studies</AccordionTrigger>
              <AccordionContent>
                <p className="p-6 text-lg">We conduct thorough feasibility studies to ensure your project is viable and meets all your requirements.</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-xl font-medium py-4">Visual Content</AccordionTrigger>
              <AccordionContent>
                <p className="p-6 text-lg">Our visual content services help you visualize and communicate your design concepts effectively.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Our Hideout Section */}
      <section id="our-hideout" className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8 text-center">Our Hideouts</h3>
          <p className="text-xl mb-12 text-center max-w-4xl mx-auto">
            Our space is an expression of who we are and we all have a little piece of our identity here. 
            This is our second home and we love going to work. Come and visits either at our Industrial or 
            CBD design studio locations in Singapore or Hongkong.
          </p>
          
          {/* Simplified Gallery with consistent image dimensions */}
          <div className="w-full max-w-full mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
              {/* All images with consistent aspect ratio */}
              <div className="aspect-square overflow-hidden rounded-sm">
                <img 
                  src="/scraped-images/office/hideouts-1.jpg" 
                  alt="WOLF Studio Hideout" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-sm">
                <img 
                  src="/scraped-images/office/hideouts-2.jpg" 
                  alt="WOLF Studio Hideout" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-sm">
                <img 
                  src="/scraped-images/office/hideouts-3.jpg" 
                  alt="WOLF Studio Hideout" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              
              <div className="aspect-square overflow-hidden rounded-sm">
                <img 
                  src="/scraped-images/office/hideouts-4.jpg" 
                  alt="WOLF Studio Hideout" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-sm">
                <img 
                  src="/scraped-images/office/hideouts-5.jpg" 
                  alt="WOLF Studio Hideout" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-sm">
                <img 
                  src="/scraped-images/office/hideouts-6.jpg" 
                  alt="WOLF Studio Hideout" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              
              <div className="aspect-square overflow-hidden rounded-sm">
                <img 
                  src="/scraped-images/office/hideouts-7.jpg" 
                  alt="WOLF Studio Hideout" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-sm">
                <img 
                  src="/scraped-images/office/hideouts-8.jpg" 
                  alt="WOLF Studio Hideout" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-sm">
                <img 
                  src="/scraped-images/office/hideouts-9.jpg" 
                  alt="WOLF Studio Hideout" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              
              <div className="aspect-square overflow-hidden rounded-sm">
                <img 
                  src="/scraped-images/office/hideouts-10.jpg" 
                  alt="WOLF Studio Hideout" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-sm">
                <img 
                  src="/scraped-images/office/hideouts-11.jpg" 
                  alt="WOLF Studio Hideout" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-sm">
                <img 
                  src="/scraped-images/office/hideouts-12.jpg" 
                  alt="WOLF Studio Hideout" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Section */}
      <section id="social" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8 text-center">Social</h3>
          
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xl mb-4">Follow us on Instagram <a href="https://www.instagram.com/wolfstudiosg/" target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">@wolfstudiosg</a></p>
            </div>
            
            {/* Instagram Feed Embed */}
            <div className="instagram-feed-container">
              {/* Instagram feed without the overlay - we'll use the custom button instead */}
              <iframe
                src="https://www.instagram.com/wolfstudiosg/embed"
                className="w-full h-[455px] sm:h-[642px] lg:h-[750px] border-none overflow-hidden rounded-xl"
                title="Instagram Feed for WOLF Studio"
                allowFullScreen={true}
                scrolling="no"
              ></iframe>
            </div>
            
            {/* Fallback button using CBRE button component */}
            <div className="text-center mt-6">
              <a href="https://www.instagram.com/wolfstudiosg/" target="_blank" rel="noopener noreferrer">
                <CBREButton>
                  View Our Instagram
                </CBREButton>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Get in Touch Section */}
      <section id="get-in-touch" className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8 text-center">Get in Touch</h3>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-xl mb-8 text-center">holla@wolf-studio.com</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <CBRECard className="p-6">
                <h4 className="font-bold mb-4">The INDUSTRIAL WOLF Den</h4>
                <p>@ 61 Ubi Road 1 #04-21/22<br />Singapore 408727</p>
              </CBRECard>
              
              <CBRECard className="p-6">
                <h4 className="font-bold mb-4">The CBD WOLF Den</h4>
                <p>@ 8 Marina Boulevard<br />#16-01, Marina Bay Financial Centre Tower 1 (MBFC Tower 1)<br />Singapore 018981</p>
              </CBRECard>
              
              <CBRECard className="p-6">
                <h4 className="font-bold mb-4">HK Studio</h4>
                <p>@ Level 27, One Pacific Place<br />88 Queensway, Admiralty<br />Hong Kong</p>
              </CBRECard>
            </div>
            
            <div className="mt-12 text-center">
              <a href="https://www.cbre.com/about-us/disclaimer-terms-of-use" target="_blank" rel="noopener noreferrer">
                <CBREButton variant="outline">Terms of Use</CBREButton>
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="bg-[#012A2D] py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-[rgb(230,232,233)]">© 2025 WOLF Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
} 