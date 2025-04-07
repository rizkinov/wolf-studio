"use client";

import { useState } from "react";
import { CBREButton } from "@/components/cbre-button";
import { CBREArrowButton } from "@/components/cbre-arrow-button";
import Link from "next/link";

export default function ButtonExample() {
  return (
    <div className="min-h-screen bg-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-financier text-cbre-green mb-10">CBRE Button Examples</h1>
        
        <div className="mb-12">
          <h2 className="text-xl font-financier text-cbre-green mb-5">All Button Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Button */}
            <div className="p-6 border border-light-grey flex flex-col">
              <span className="text-sm text-dark-grey mb-3 font-medium">Primary</span>
              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <CBREButton variant="primary">Primary</CBREButton>
                </div>
                <div className="text-xs text-dark-grey mt-2">
                  <p>Default: CBRE Green background</p>
                  <p>Hover: Accent Green background</p>
                </div>
              </div>
            </div>
            
            {/* Outline Button */}
            <div className="p-6 border border-light-grey flex flex-col">
              <span className="text-sm text-dark-grey mb-3 font-medium">Outline</span>
              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <CBREButton variant="outline">Outline</CBREButton>
                </div>
                <div className="text-xs text-dark-grey mt-2">
                  <p>Default: CBRE Green outline</p>
                  <p>Hover: Accent Green fill</p>
                </div>
              </div>
            </div>
            
            {/* Text Button */}
            <div className="p-6 border border-light-grey flex flex-col">
              <span className="text-sm text-dark-grey mb-3 font-medium">Text</span>
              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <CBREButton variant="text">Text Button</CBREButton>
                </div>
                <div className="text-xs text-dark-grey mt-2">
                  <p>Default: Text with dark green underline</p>
                  <p>Hover: Accent green underline (no highlight)</p>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="p-6 border border-light-grey flex flex-col">
              <span className="text-sm text-dark-grey mb-3 font-medium">Action</span>
              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <CBREButton variant="action">Action</CBREButton>
                </div>
                <div className="text-xs text-dark-grey mt-2">
                  <p>Default: CBRE Green with white text</p>
                  <p>Hover: Dark Green background with accent green text</p>
                </div>
              </div>
            </div>
            
            {/* Accent Button */}
            <div className="p-6 border border-light-grey flex flex-col">
              <span className="text-sm text-dark-grey mb-3 font-medium">Accent</span>
              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <CBREButton variant="accent">Accent</CBREButton>
                </div>
                <div className="text-xs text-dark-grey mt-2">
                  <p>Default: Accent green with dark text</p>
                  <p>Hover: CBRE dark green with white text</p>
                </div>
              </div>
            </div>
            
            {/* View More Button */}
            <div className="p-6 border border-light-grey flex flex-col bg-slate-50">
              <span className="text-sm text-dark-grey mb-3 font-medium">View More</span>
              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <CBREButton variant="view-more">View More</CBREButton>
                </div>
                <div className="text-xs text-dark-grey mt-2">
                  <p>Default: Dark Green</p>
                  <p>Hover: Accent Green</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-financier text-cbre-green mb-5">Arrow Button Component</h2>
          <div className="bg-slate-50 p-8 border border-light-grey">
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-lg font-calibre font-medium text-dark-grey mb-4">Default State (Line Before Text)</h3>
                <div className="p-6 bg-white border border-light-grey flex justify-center items-center">
                  <CBREArrowButton>View Profile</CBREArrowButton>
                </div>
                <div className="text-sm text-dark-grey mt-2 italic">
                  *Hover over the button to see the arrow animation
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-calibre font-medium text-dark-grey mb-4">Hover State (Arrow After Text)</h3>
                <div className="p-6 bg-white border border-light-grey flex justify-center items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-primary font-calibre font-medium">View Profile</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="2" y1="10" x2="12" y2="10" stroke="#17E88F" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M10 6L14 10L10 14" stroke="#17E88F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
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