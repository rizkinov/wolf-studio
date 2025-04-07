"use client";

import React, { useState } from 'react';
import { CBREToggle } from '@/components/cbre-toggle';
import { CBREButton } from '@/components/cbre-button';
import Link from 'next/link';

export default function ToggleExamplePage() {
  const [basicToggle, setBasicToggle] = useState(false);
  const [sizeToggleSmall, setSizeToggleSmall] = useState(false);
  const [sizeToggleMedium, setSizeToggleMedium] = useState(true);
  const [sizeToggleLarge, setSizeToggleLarge] = useState(false);
  const [labelToggle, setLabelToggle] = useState(true);
  const [disabledToggle, setDisabledToggle] = useState(true);

  return (
    <div className="min-h-screen bg-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-financier text-cbre-green mb-10">Toggle Component</h1>
        
        {/* Basic Toggle */}
        <div className="mb-16">
          <h2 className="text-xl font-financier text-cbre-green mb-5">Basic Toggle</h2>
          <div className="bg-[var(--lighter-grey)] p-8">
            <div className="flex items-center gap-6">
              <CBREToggle 
                checked={basicToggle}
                onCheckedChange={setBasicToggle}
              />
              <div className="text-sm text-dark-grey">
                Toggle is {basicToggle ? 'ON' : 'OFF'}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`const [isChecked, setIsChecked] = useState(false);

<CBREToggle 
  checked={isChecked}
  onCheckedChange={setIsChecked}
/>`}
            </pre>
          </div>
        </div>
        
        {/* Sizes */}
        <div className="mb-16">
          <h2 className="text-xl font-financier text-cbre-green mb-5">Toggle Sizes</h2>
          <div className="bg-[var(--lighter-grey)] p-8">
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <CBREToggle 
                  checked={sizeToggleSmall}
                  onCheckedChange={setSizeToggleSmall}
                  size="sm"
                />
                <div className="text-sm text-dark-grey">
                  Small Toggle
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <CBREToggle 
                  checked={sizeToggleMedium}
                  onCheckedChange={setSizeToggleMedium}
                  size="md"
                />
                <div className="text-sm text-dark-grey">
                  Medium Toggle (default)
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <CBREToggle 
                  checked={sizeToggleLarge}
                  onCheckedChange={setSizeToggleLarge}
                  size="lg"
                />
                <div className="text-sm text-dark-grey">
                  Large Toggle
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Size Variants</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<CBREToggle size="sm" /> // Small
<CBREToggle size="md" /> // Medium (default)
<CBREToggle size="lg" /> // Large`}
            </pre>
          </div>
        </div>
        
        {/* With Label */}
        <div className="mb-16">
          <h2 className="text-xl font-financier text-cbre-green mb-5">Toggle with Label</h2>
          <div className="bg-[var(--lighter-grey)] p-8">
            <div className="flex items-center gap-6">
              <CBREToggle 
                checked={labelToggle}
                onCheckedChange={setLabelToggle}
                label="Notifications"
                description="Receive email notifications"
              />
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">With Label & Description</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<CBREToggle 
  checked={isChecked}
  onCheckedChange={setIsChecked}
  label="Notifications"
  description="Receive email notifications"
/>`}
            </pre>
          </div>
        </div>
        
        {/* Disabled State */}
        <div className="mb-16">
          <h2 className="text-xl font-financier text-cbre-green mb-5">Disabled Toggle</h2>
          <div className="bg-[var(--lighter-grey)] p-8">
            <div className="flex items-center gap-6">
              <CBREToggle 
                checked={disabledToggle}
                disabled={true}
                label="Disabled Toggle"
                description="This toggle cannot be interacted with"
              />
            </div>
          </div>
          
          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Disabled State</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<CBREToggle 
  checked={true}
  disabled={true}
  label="Disabled Toggle"
/>`}
            </pre>
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