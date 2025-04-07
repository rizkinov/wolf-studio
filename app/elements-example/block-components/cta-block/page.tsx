"use client";

import React from 'react';
import { CBRECTABlock } from '@/components/cbre-cta-block';
import { CBREButton } from '@/components/cbre-button';
import Link from 'next/link';

export default function CTABlockPage() {
  return (
    <div className="min-h-screen bg-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-financier text-cbre-green mb-10">CTA Block Component</h1>
        
        <div className="mb-16">
          <h2 className="text-xl font-financier text-cbre-green mb-5">Call-to-Action Block</h2>
          <div className="mb-4">
            <CBRECTABlock 
              title="Connect with our team to get started"
              buttonText="Get in Touch"
            />
          </div>
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<CBRECTABlock 
  title="Connect with our team to get started"
  buttonText="Get in Touch" // Optional, defaults to "Get in Touch"
  onButtonClick={() => console.log('Button clicked')} // Optional
/>`}
            </pre>
            <div className="mt-4 text-sm text-dark-grey">
              <p>Design specifications:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Background color: #E6E8E9</li>
                <li>Text color: #003F2D (CBRE Green)</li>
                <li>Uses the "view-more" button variant</li>
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