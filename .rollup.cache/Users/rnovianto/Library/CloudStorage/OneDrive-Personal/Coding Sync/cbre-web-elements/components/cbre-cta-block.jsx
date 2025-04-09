"use client";
import React from 'react';
import { cn } from "@/lib/utils";
import { CBREButton } from './cbre-button';
/**
 * CBRECTABlock - A styled call-to-action block component following CBRE design
 *
 * Features:
 * - Light gray background (#C0D4CB)
 * - Title with Get in Touch button
 */
export function CBRECTABlock({ title, buttonText = "Get in Touch", onButtonClick, className }) {
    return (<div className={cn("flex flex-col md:flex-row items-center justify-between bg-[var(--lighter-grey)] p-8", className)}>
      <div className="mb-6 md:mb-0 md:mr-8">
        <h3 className="text-[var(--cbre-green)] font-financier text-xl md:text-2xl">
          {title}
        </h3>
      </div>
      
      <div>
        <CBREButton variant="view-more" onClick={onButtonClick}>
          {buttonText}
        </CBREButton>
      </div>
    </div>);
}
//# sourceMappingURL=cbre-cta-block.jsx.map