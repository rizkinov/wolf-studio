"use client";

import React from 'react';
import { CBREQuoteBlock } from '@/components/cbre-quote-block';
import { CBREButton } from '@/components/cbre-button';
import Link from 'next/link';

export default function QuoteBlockPage() {
  return (
    <div className="min-h-screen bg-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-financier text-cbre-green mb-10">Quote Block Component</h1>
        
        <div className="mb-16">
          <h2 className="text-xl font-financier text-cbre-green mb-5">Executive Quote Block</h2>
          <div className="mb-4">
            <CBREQuoteBlock 
              quote="Our Smart FM Solutions offering allows us to support our clients with access to real-time data and actionable insights that help them achieve their sustainability and operating efficiency goals."
              author="Jeff Kleinschmidt"
              role="GWS Enterprise Facilities Management Product Leader"
            />
          </div>
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<CBREQuoteBlock 
  quote="Our Smart FM Solutions offering allows us to support our clients with access to real-time data and actionable insights that help them achieve their sustainability and operating efficiency goals."
  author="Jeff Kleinschmidt"
  role="GWS Enterprise Facilities Management Product Leader"
  imageSrc="/path/to/image.jpg" // Optional
/>`}
            </pre>
            <div className="mt-4 text-sm text-dark-grey">
              <p>Design specifications:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Background color: #E6E8E9</li>
                <li>Left border color: #012A2D</li>
                <li>Text color: #003F2D (CBRE Green)</li>
                <li>Responsive layout (stacks on mobile)</li>
              </ul>
            </div>
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