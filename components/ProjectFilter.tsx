import React from 'react';
import { CBREButton } from '@/components/cbre-button';

interface ProjectFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function ProjectFilter({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: ProjectFilterProps) {
  return (
    <div className="project-filter mb-8">
      <div className="flex flex-wrap gap-2 justify-center">
        <CBREButton 
          variant={activeCategory === 'all' ? 'primary' : 'outline'} 
          onClick={() => onCategoryChange('all')}
        >
          All Projects
        </CBREButton>
        
        {categories.map(category => (
          <CBREButton 
            key={category}
            variant={activeCategory === category ? 'primary' : 'outline'} 
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </CBREButton>
        ))}
      </div>
    </div>
  );
} 