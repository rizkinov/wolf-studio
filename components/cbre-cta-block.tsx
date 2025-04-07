"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { CBREButton } from './cbre-button';

interface CBRECTABlockProps {
  title: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
}

/**
 * CBRECTABlock - A styled call-to-action block component following CBRE design
 * 
 * Features:
 * - Light gray background (#C0D4CB)
 * - Title with Get in Touch button
 */
export function CBRECTABlock({
  title,
  buttonText = "Get in Touch",
  onButtonClick,
  className
}: CBRECTABlockProps) {
  return (
    <div className={cn(
      "flex flex-col md:flex-row items-center justify-between bg-[#E6E8E9] p-8",
      className
    )}>
      <div className="mb-6 md:mb-0 md:mr-8">
        <h3 className="text-[#003F2D] font-financier text-xl md:text-2xl">
          {title}
        </h3>
      </div>
      
      <div>
        <CBREButton 
          variant="view-more" 
          onClick={onButtonClick}
        >
          {buttonText}
        </CBREButton>
      </div>
    </div>
  );
} 