"use client";

import React from 'react';
import { 
  CBRECard, 
  CBRECardHeader, 
  CBRECardTitle, 
  CBRECardDescription, 
  CBRECardContent, 
  CBRECardFooter 
} from '@/components/cbre-card';
import { CBREButton } from '@/components/cbre-button';
import Link from 'next/link';

export default function CardExamplePage() {
  return (
    <div className="min-h-screen bg-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-financier text-cbre-green mb-10">Card Component</h1>
        
        {/* Basic Card */}
        <div className="mb-16">
          <h2 className="text-xl font-financier text-cbre-green mb-5">Basic Card</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <CBRECard>
                <CBRECardHeader>
                  <CBRECardTitle>Card Title</CBRECardTitle>
                  <CBRECardDescription>Card description that provides additional context</CBRECardDescription>
                </CBRECardHeader>
                <CBRECardContent>
                  <p>This is the main content of the card. You can put any elements here including text, images, or other components.</p>
                </CBRECardContent>
                <CBRECardFooter>
                  <CBREButton variant="outline">Cancel</CBREButton>
                  <CBREButton variant="primary">Submit</CBREButton>
                </CBRECardFooter>
              </CBRECard>
            </div>
            
            <div className="md:w-1/2 bg-[var(--lighter-grey)] p-6">
              <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<CBRECard>
  <CBRECardHeader>
    <CBRECardTitle>Card Title</CBRECardTitle>
    <CBRECardDescription>
      Card description that provides additional context
    </CBRECardDescription>
  </CBRECardHeader>
  <CBRECardContent>
    <p>This is the main content of the card.</p>
  </CBRECardContent>
  <CBRECardFooter>
    <CBREButton variant="outline">Cancel</CBREButton>
    <CBREButton variant="primary">Submit</CBREButton>
  </CBRECardFooter>
</CBRECard>`}
              </pre>
            </div>
          </div>
        </div>
        
        {/* Card Variants */}
        <div className="mb-16">
          <h2 className="text-xl font-financier text-cbre-green mb-5">Card Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Default */}
            <CBRECard variant="default">
              <CBRECardHeader>
                <CBRECardTitle>Default Card</CBRECardTitle>
              </CBRECardHeader>
              <CBRECardContent>
                <p>Standard card with border and shadow.</p>
              </CBRECardContent>
              <CBRECardFooter>
                <CBREButton variant="view-more" size="sm">View Details</CBREButton>
              </CBRECardFooter>
            </CBRECard>
            
            {/* Outline */}
            <CBRECard variant="outline">
              <CBRECardHeader>
                <CBRECardTitle>Outline Card</CBRECardTitle>
              </CBRECardHeader>
              <CBRECardContent>
                <p>Card with border but no shadow.</p>
              </CBRECardContent>
              <CBRECardFooter>
                <CBREButton variant="view-more" size="sm">View Details</CBREButton>
              </CBRECardFooter>
            </CBRECard>
            
            {/* Secondary */}
            <CBRECard variant="secondary">
              <CBRECardHeader>
                <CBRECardTitle>Secondary Card</CBRECardTitle>
              </CBRECardHeader>
              <CBRECardContent>
                <p>Card with gray background and no border.</p>
              </CBRECardContent>
              <CBRECardFooter>
                <CBREButton variant="view-more" size="sm">View Details</CBREButton>
              </CBRECardFooter>
            </CBRECard>
          </div>
          
          <div className="bg-[var(--lighter-grey)] p-6 mt-8">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Variant Options</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`// Default - with border and shadow
<CBRECard variant="default">...</CBRECard>

// Outline - with border but no shadow
<CBRECard variant="outline">...</CBRECard>

// Secondary - gray background, no border
<CBRECard variant="secondary">...</CBRECard>`}
            </pre>
          </div>
        </div>
        
        {/* Interactive Card Example */}
        <div className="mb-16">
          <h2 className="text-xl font-financier text-cbre-green mb-5">Interactive Card Example</h2>
          
          <CBRECard>
            <CBRECardHeader>
              <CBRECardTitle>Property Investment Opportunity</CBRECardTitle>
              <CBRECardDescription>Class A Office Building in Downtown Chicago</CBRECardDescription>
            </CBRECardHeader>
            <CBRECardContent>
              <div className="space-y-4">
                <p>This premium investment opportunity features:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>250,000 square feet of leasable space</li>
                  <li>95% current occupancy rate</li>
                  <li>Average lease term of 7.5 years</li>
                  <li>LEED Gold certification</li>
                  <li>7.2% cap rate</li>
                </ul>
                <p>Contact our investment team to receive detailed financials and property information.</p>
              </div>
            </CBRECardContent>
            <CBRECardFooter>
              <CBREButton variant="outline">Download Brochure</CBREButton>
              <CBREButton variant="primary">Contact Us</CBREButton>
            </CBRECardFooter>
          </CBRECard>
        </div>
        
        {/* Cards in Grid Layout */}
        <div className="mb-16">
          <h2 className="text-xl font-financier text-cbre-green mb-5">Cards in Grid Layout</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <CBRECard key={item} variant="outline">
                <CBRECardHeader>
                  <CBRECardTitle>Market Report #{item}</CBRECardTitle>
                  <CBRECardDescription>Q2 2023 Commercial Real Estate Outlook</CBRECardDescription>
                </CBRECardHeader>
                <CBRECardContent>
                  <p>Analysis of current market trends, investment opportunities, and future predictions for key commercial real estate sectors.</p>
                </CBRECardContent>
                <CBRECardFooter>
                  <CBREButton variant="view-more">Read Report</CBREButton>
                </CBRECardFooter>
              </CBRECard>
            ))}
          </div>
        </div>
        
        <div className="mt-16 flex justify-center">
          <Link href="/elements-example">
            <CBREButton variant="outline">Back to UI Elements</CBREButton>
          </Link>
        </div>
      </div>
    </div>
  );
} 