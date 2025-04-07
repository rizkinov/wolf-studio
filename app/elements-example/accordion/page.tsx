"use client";

import React from 'react';
import { CBREAccordion } from '@/components/cbre-accordion';
import { CBREButton } from '@/components/cbre-button';
import Link from 'next/link';

// Sample content for the accordion items
const accordionItems = [
  {
    title: "Americas",
    content: (
      <div className="space-y-4">
        <p>Explore CBRE's presence across North and South America, including our services and offices in the United States, Canada, Mexico, Brazil, and other key markets.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>United States</li>
          <li>Canada</li>
          <li>Mexico</li>
          <li>Brazil</li>
          <li>Argentina</li>
          <li>Colombia</li>
        </ul>
      </div>
    )
  },
  {
    title: "Asia Pacific",
    content: (
      <div className="space-y-4">
        <p>CBRE maintains a strong presence throughout the Asia Pacific region, offering comprehensive real estate services in markets including China, Japan, India, Australia, and Southeast Asia.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Australia</li>
          <li>China</li>
          <li>Hong Kong</li>
          <li>India</li>
          <li>Japan</li>
          <li>Singapore</li>
          <li>South Korea</li>
        </ul>
      </div>
    )
  },
  {
    title: "Europe",
    content: (
      <div className="space-y-4">
        <p>Our European operations span across the continent, with significant presence in the UK, Germany, France, Spain, Italy, and other major European markets.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>United Kingdom</li>
          <li>France</li>
          <li>Germany</li>
          <li>Italy</li>
          <li>Netherlands</li>
          <li>Spain</li>
          <li>Sweden</li>
          <li>Switzerland</li>
        </ul>
      </div>
    )
  }
];

export default function AccordionExamplePage() {
  return (
    <div className="min-h-screen bg-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-financier text-cbre-green mb-10">CBRE Accordion Component</h1>
        
        <div className="mb-16">
          <h2 className="text-xl font-financier text-cbre-green mb-5">Regional Offices Accordion</h2>
          <div className="mb-8">
            <CBREAccordion items={accordionItems} />
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<CBREAccordion 
  items={[
    {
      title: "Americas",
      content: <div>Your content here...</div>
    },
    {
      title: "Asia Pacific",
      content: <div>Your content here...</div>
    },
    {
      title: "Europe",
      content: <div>Your content here...</div>
    }
  ]}
  type="single" // Optional: "single" (default) or "multiple"
  collapsible={true} // Optional: default is true
/>`}
            </pre>
            <div className="mt-4 text-sm text-dark-grey">
              <p>Design specifications:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Headers: CBRE green (#003F2D), Financier Display font</li>
                <li>Content: Dark grey text (#435254), Calibre font</li>
                <li>Borders: Light grey (#CAD1D3) top and bottom for each item</li>
                <li>Arrow: CBRE green, rotates on open/close</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mb-16">
          <h2 className="text-xl font-financier text-cbre-green mb-5">Multiple Selection Example</h2>
          <div className="mb-8">
            <CBREAccordion 
              items={accordionItems} 
              type="multiple"
              defaultValue={["item-0", "item-1"]}
            />
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Multiple Selection</h3>
            <p className="text-dark-grey mb-4">
              The accordion supports multiple open panels by setting <code className="bg-gray-100 px-1 py-0.5 rounded">type="multiple"</code>.
              You can also pre-open specific items with the <code className="bg-gray-100 px-1 py-0.5 rounded">defaultValue</code> prop.
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<CBREAccordion 
  items={accordionItems}
  type="multiple"
  defaultValue={["item-0", "item-1"]}
/>`}
            </pre>
          </div>
        </div>
        
        <div className="mt-16 flex justify-center">
          <Link href="/">
            <CBREButton variant="outline">Back to Home</CBREButton>
          </Link>
        </div>
      </div>
    </div>
  );
} 