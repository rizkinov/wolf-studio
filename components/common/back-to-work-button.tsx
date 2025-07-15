import React from 'react';
import Link from 'next/link';
import { CBREButton } from '@/components/cbre/cbre-button';
import { navigateToOurWork } from '@/lib/navigation';

interface BackToWorkButtonProps {
  className?: string;
}

/**
 * Back to Work Button component
 * 
 * This component provides a consistent "Back to Work" button that links 
 * to the Our Work section on the landing page.
 */
export const BackToWorkButton: React.FC<BackToWorkButtonProps> = ({ 
  className = "mt-12 text-center" 
}) => {
  return (
    <div className={className}>
      <Link href={navigateToOurWork()}>
        <CBREButton variant="view-more">
          Back to work
        </CBREButton>
      </Link>
    </div>
  );
}; 