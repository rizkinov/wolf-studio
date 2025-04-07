"use client";

import React from 'react';
import { CBREButton } from '@/components/cbre-button';
import Link from 'next/link';

// List of block components
const blockComponents = [
  {
    name: "Quote Block",
    description: "A styled testimonial or quote block with optional image.",
    path: "/elements-example/block-components/quote-block",
    status: "completed"
  },
  {
    name: "CTA Block",
    description: "A call-to-action block with heading and button.",
    path: "/elements-example/block-components/cta-block",
    status: "completed"
  },
];

export default function BlockComponentsPage() {
  return (
    <div className="min-h-screen bg-white p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-financier text-cbre-green mb-4">Block Components</h1>
        
        <p className="text-dark-grey font-calibre mb-10 max-w-3xl">
          Pre-built content blocks that combine multiple elements for common use cases.
        </p>
        
        <div className="bg-[#E6E8E9] p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blockComponents.map((component, index) => (
              <div key={index} className="bg-white border-none p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-financier text-cbre-green">{component.name}</h3>
                  <span className="text-xs px-2 py-1 bg-accent-green text-cbre-green font-calibre">
                    Ready
                  </span>
                </div>
                <p className="text-dark-grey font-calibre mb-6 flex-grow">{component.description}</p>
                <Link href={component.path}>
                  <CBREButton variant="view-more" className="w-full justify-center">
                    View {component.name}
                  </CBREButton>
                </Link>
              </div>
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